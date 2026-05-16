import sys
import os
import asyncio
from datetime import datetime

sys.path.append(os.path.abspath('backend'))

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import select
from models.user import User
from models.product import Product
from models.notification import Notification
from core.security import create_access_token

async def get_token():
    engine = create_async_engine("postgresql+asyncpg://spark:spark_secret@localhost:5434/spark_db")
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    async with async_session() as session:
        result = await session.execute(select(User).where(User.email == "qiasyu@gmail.com"))
        user = result.scalar_one_or_none()
        if user:
            return create_access_token(user.id)

token = asyncio.run(get_token())
import requests

# Test Manual Income with NEW Product
print("\nTesting Manual Income WITH auto-register NEW Product...")
payload_new_prod = {
    "transaction_type": "sale",
    "source": "manual",
    "transaction_date": "2026-05-16",
    "notes": "Penjualan Manual Auto Register",
    "total_amount": 50000,
    "items": [{
        "product_name": "Produk Misteri X",
        "quantity": 5,
        "unit_price": 10000,
        "reduce_stock": False,
        "is_new_product": True,
        "add_new_stock": True # Meaning create with 5 units
    }]
}
res = requests.post("http://localhost:8000/api/v1/transactions/", json=payload_new_prod, headers={"Authorization": f"Bearer {token}"})
print("Create Tx Status:", res.status_code, res.text)

# Check if product is created
res_prod = requests.get("http://localhost:8000/api/v1/products/", headers={"Authorization": f"Bearer {token}"})
products = res_prod.json()["data"]
misteri = next((p for p in products if p["name"] == "Produk Misteri X"), None)

if misteri:
    print(f"✅ Product created successfully: {misteri['name']}")
    print(f"   Stock: {misteri['current_stock']} (Expected: 5.0)")
    print(f"   Category: {misteri['category']} (Expected: ⚠️ Perlu Verifikasi)")
else:
    print("❌ Product NOT created!")

