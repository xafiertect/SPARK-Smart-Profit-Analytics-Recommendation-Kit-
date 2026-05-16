"""
Notification Service — Rule-based notification triggers.

Implements RULES N-2, N-3, N-4 from rules-notifikasi.md.
All detection is deterministic (no LLM). Dedup within 24 hours.
"""

import logging
from datetime import datetime, timezone, timedelta
from uuid import UUID

from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession

from models.notification import Notification
from models.product import Product

logger = logging.getLogger(__name__)


# ── Priority constants (RULE N-6) ─────────────────────────
PRIORITY_CRITICAL = "CRITICAL"          # 🔴 Stok habis (= 0)
PRIORITY_WARNING = "WARNING"            # ⚠️ Stok di bawah minimal
PRIORITY_ACTION_REQUIRED = "ACTION_REQUIRED"  # 📋 Produk belum dikonfigurasi
PRIORITY_NEW_PRODUCT = "NEW_PRODUCT"    # 🆕 Produk baru dari nota
PRIORITY_INFO = "INFO"                  # ℹ️ Umum

# ── Type constants ─────────────────────────────────────────
TYPE_LOW_STOCK = "LOW_STOCK"
TYPE_STOCK_EMPTY = "STOCK_EMPTY"
TYPE_UNCONFIGURED = "UNCONFIGURED_PRODUCT"
TYPE_NEW_PRODUCT = "NEW_PRODUCT"

# Priority sort order for querying
PRIORITY_ORDER = {
    PRIORITY_CRITICAL: 0,
    PRIORITY_WARNING: 1,
    PRIORITY_ACTION_REQUIRED: 2,
    PRIORITY_NEW_PRODUCT: 3,
    PRIORITY_INFO: 4,
}


async def _has_recent_notification(
    user_id: UUID, notif_type: str, product_id: UUID | None,
    db: AsyncSession, hours: int = 24
) -> bool:
    """Check if a similar notification was sent in the last N hours (dedup)."""
    cutoff = datetime.now(timezone.utc) - timedelta(hours=hours)
    stmt = select(Notification).where(
        Notification.user_id == user_id,
        Notification.type == notif_type,
        Notification.created_at >= cutoff,
        Notification.status.in_(["NEW", "READ"]),
    )
    if product_id:
        stmt = stmt.where(Notification.related_product_id == product_id)
    result = await db.execute(stmt)
    return result.scalar_one_or_none() is not None


async def check_low_stock(user_id: UUID, db: AsyncSession) -> list[Notification]:
    """RULE N-2 — Notify when product stock <= min_stock_threshold."""
    stmt = select(Product).where(
        Product.user_id == user_id,
        Product.is_deleted == False,
        Product.min_stock_threshold > 0,
    )
    result = await db.execute(stmt)
    products = result.scalars().all()

    created = []
    for product in products:
        stock = float(product.current_stock)
        threshold = float(product.min_stock_threshold)

        if stock > threshold:
            # Auto-resolve existing notifications if stock recovered
            await _auto_resolve(user_id, TYPE_LOW_STOCK, product.id, db)
            await _auto_resolve(user_id, TYPE_STOCK_EMPTY, product.id, db)
            continue

        if stock <= 0:
            # CRITICAL — stok habis
            if await _has_recent_notification(user_id, TYPE_STOCK_EMPTY, product.id, db):
                continue
            notif = Notification(
                user_id=user_id,
                type=TYPE_STOCK_EMPTY,
                priority=PRIORITY_CRITICAL,
                status="NEW",
                title=f"Stok {product.name} Habis",
                message=(
                    f"Stok saat ini: 0 {product.unit or 'pcs'}. "
                    f"Batas minimal: {threshold:.0f} {product.unit or 'pcs'}. "
                    f"Segera lakukan pengadaan stok!"
                ),
                action_data={
                    "product_id": str(product.id),
                    "product_name": product.name,
                    "current_stock": stock,
                    "min_threshold": threshold,
                    "action": "add_stock",
                },
                related_product_id=product.id,
            )
            db.add(notif)
            created.append(notif)

        elif stock <= threshold:
            # WARNING — stok di bawah minimal
            if await _has_recent_notification(user_id, TYPE_LOW_STOCK, product.id, db):
                continue
            notif = Notification(
                user_id=user_id,
                type=TYPE_LOW_STOCK,
                priority=PRIORITY_WARNING,
                status="NEW",
                title=f"Stok {product.name} Hampir Habis",
                message=(
                    f"Stok saat ini: {stock:.0f} {product.unit or 'pcs'}. "
                    f"Batas minimal: {threshold:.0f} {product.unit or 'pcs'}. "
                    f"Segera lakukan pengadaan stok."
                ),
                action_data={
                    "product_id": str(product.id),
                    "product_name": product.name,
                    "current_stock": stock,
                    "min_threshold": threshold,
                    "action": "add_stock",
                },
                related_product_id=product.id,
            )
            db.add(notif)
            created.append(notif)

    return created


async def check_unconfigured_products(user_id: UUID, db: AsyncSession) -> list[Notification]:
    """RULE N-3 — Notify when product has base_price=0 or min_stock_threshold not set."""
    stmt = select(Product).where(
        Product.user_id == user_id,
        Product.is_deleted == False,
    )
    result = await db.execute(stmt)
    products = result.scalars().all()

    created = []
    for product in products:
        base_price = float(product.base_price)
        min_stock = float(product.min_stock_threshold)

        needs_config = base_price <= 0 or min_stock <= 0

        if not needs_config:
            # Auto-resolve if now configured
            await _auto_resolve(user_id, TYPE_UNCONFIGURED, product.id, db)
            continue

        if await _has_recent_notification(user_id, TYPE_UNCONFIGURED, product.id, db):
            continue

        issues = []
        if base_price <= 0:
            issues.append("Harga beli: belum diisi")
        if min_stock <= 0:
            issues.append("Stok minimal: belum diatur")

        notif = Notification(
            user_id=user_id,
            type=TYPE_UNCONFIGURED,
            priority=PRIORITY_ACTION_REQUIRED,
            status="NEW",
            title=f"Produk {product.name} Belum Dikonfigurasi",
            message=(
                f"Produk ini perlu dilengkapi datanya. "
                f"{'. '.join(issues)}. "
                f"Silakan lengkapi data produk."
            ),
            action_data={
                "product_id": str(product.id),
                "product_name": product.name,
                "base_price": base_price,
                "min_stock": min_stock,
                "action": "configure_product",
            },
            related_product_id=product.id,
        )
        db.add(notif)
        created.append(notif)

    return created


async def create_new_product_notification(
    user_id: UUID, new_products: list[dict], receipt_date: str, db: AsyncSession
) -> Notification | None:
    """RULE N-4 — Notify when receipt scan detects unregistered products.

    new_products: list of {"name": str, "product_id": str | None}
    Groups all new products from one receipt into a single notification.
    """
    if not new_products:
        return None

    names = [p["name"] for p in new_products]
    items_text = "\n".join(f"- {name}" for name in names)

    notif = Notification(
        user_id=user_id,
        type=TYPE_NEW_PRODUCT,
        priority=PRIORITY_NEW_PRODUCT,
        status="NEW",
        title="Produk Baru Terdeteksi dari Nota",
        message=(
            f"Ditemukan {len(new_products)} produk baru dari nota tanggal {receipt_date}:\n"
            f"{items_text}\n"
            f"Produk telah otomatis didaftarkan dengan stok 0. "
            f"Lengkapi data produk agar sistem berjalan optimal."
        ),
        action_data={
            "new_products": new_products,
            "receipt_date": receipt_date,
            "action": "configure_new_products",
        },
    )
    db.add(notif)
    return notif


async def run_notification_checks(user_id: UUID, db: AsyncSession) -> list[Notification]:
    """Run all rule-based notification checks."""
    all_created: list[Notification] = []

    low_stock = await check_low_stock(user_id, db)
    all_created.extend(low_stock)

    unconfigured = await check_unconfigured_products(user_id, db)
    all_created.extend(unconfigured)

    if all_created:
        await db.commit()
        for n in all_created:
            await db.refresh(n)

    logger.info("Notification check for user %s: %d new notifications", user_id, len(all_created))
    return all_created


async def _auto_resolve(
    user_id: UUID, notif_type: str, product_id: UUID, db: AsyncSession
) -> None:
    """Auto-resolve active notifications when condition is fixed."""
    stmt = select(Notification).where(
        Notification.user_id == user_id,
        Notification.type == notif_type,
        Notification.related_product_id == product_id,
        Notification.status.in_(["NEW", "READ"]),
    )
    result = await db.execute(stmt)
    for notif in result.scalars().all():
        notif.status = "DONE"
        notif.resolved_at = datetime.now(timezone.utc)
