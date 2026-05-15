from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select, func, case, literal
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from core.security import get_current_user
from models.user import User
from models.notification import Notification
from schemas.notification import NotificationOut, NotificationStatusUpdate, UnreadCountOut
from services.notification_service import run_notification_checks, PRIORITY_ORDER

router = APIRouter(prefix="/api/v1/notifications", tags=["notifications"])


@router.get("/", response_model=list[NotificationOut])
async def list_notifications(
    status: str | None = Query(None, description="Filter by status: NEW, READ, DONE, IGNORED"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """List notifications ordered by priority then time (RULE N-6)."""
    # Build priority sort expression
    priority_sort = case(
        (Notification.priority == "CRITICAL", literal(0)),
        (Notification.priority == "WARNING", literal(1)),
        (Notification.priority == "ACTION_REQUIRED", literal(2)),
        (Notification.priority == "NEW_PRODUCT", literal(3)),
        else_=literal(4),
    )

    stmt = (
        select(Notification)
        .where(Notification.user_id == current_user.id)
        .order_by(priority_sort, Notification.created_at.desc())
        .limit(50)
    )
    if status:
        stmt = stmt.where(Notification.status == status)

    result = await db.execute(stmt)
    return result.scalars().all()


@router.get("/unread-count", response_model=UnreadCountOut)
async def get_unread_count(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get count of NEW (unread) notifications for badge display."""
    stmt = select(func.count()).where(
        Notification.user_id == current_user.id,
        Notification.status == "NEW",
    )
    result = await db.execute(stmt)
    count = result.scalar() or 0
    return UnreadCountOut(count=count)


@router.put("/{notification_id}/status", response_model=NotificationOut)
async def update_notification_status(
    notification_id: UUID,
    data: NotificationStatusUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update notification status (READ, DONE, IGNORED)."""
    valid_statuses = {"NEW", "READ", "DONE", "IGNORED"}
    if data.status not in valid_statuses:
        raise HTTPException(status_code=422, detail=f"Status harus salah satu dari: {valid_statuses}")

    result = await db.execute(
        select(Notification).where(
            Notification.id == notification_id,
            Notification.user_id == current_user.id,
        )
    )
    notif = result.scalar_one_or_none()
    if not notif:
        raise HTTPException(status_code=404, detail="Notifikasi tidak ditemukan")

    notif.status = data.status
    if data.status in ("DONE", "IGNORED"):
        from datetime import datetime, timezone
        notif.resolved_at = datetime.now(timezone.utc)

    await db.commit()
    await db.refresh(notif)
    return notif


@router.post("/check")
async def trigger_notification_check(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Trigger all rule-based notification checks manually."""
    created = await run_notification_checks(current_user.id, db)
    return {"generated": len(created)}
