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
from core.security import create_access_token
from fastapi.testclient import TestClient
from main import app

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

# Let's get the products list first
res_prod = requests.get("http://localhost:8000/api/v1/products/", headers={"Authorization": f"Bearer {token}"})
products = res_prod.json()["data"]

if not products:
    print("No products found")
    sys.exit(0)

test_product = products[0]
old_stock = test_product["current_stock"]
print(f"Testing with product: {test_product['name']} (Stock: {old_stock})")

# 1. Test Manual Income WITH stock reduction
print("\nTesting Manual Income WITH stock reduction...")
payload_reduce = {
    "transaction_type": "sale",
    "source": "manual",
    "transaction_date": "2026-05-16",
    "notes": "Penjualan Manual Reduce",
    "total_amount": 50000,
    "items": [{
        "product_name": test_product["name"],
        "quantity": 2,
        "unit_price": 25000,
        "reduce_stock": True
    }]
}
res1 = requests.post("http://localhost:8000/api/v1/transactions/", json=payload_reduce, headers={"Authorization": f"Bearer {token}"})
print(res1.status_code, res1.text)

# Check stock
res_prod2 = requests.get("http://localhost:8000/api/v1/products/", headers={"Authorization": f"Bearer {token}"})
new_stock_1 = next(p["current_stock"] for p in res_prod2.json()["data"] if p["id"] == test_product["id"])
print(f"Stock after reduction: {new_stock_1} (Expected: {max(0, old_stock - 2)})")

# 2. Test Manual Income WITHOUT stock reduction
print("\nTesting Manual Income WITHOUT stock reduction...")
payload_no_reduce = {
    "transaction_type": "sale",
    "source": "manual",
    "transaction_date": "2026-05-16",
    "notes": "Penjualan Manual NO Reduce",
    "total_amount": 30000,
    "items": [{
        "product_name": test_product["name"],
        "quantity": 3,
        "unit_price": 10000,
        "reduce_stock": False
    }]
}
res2 = requests.post("http://localhost:8000/api/v1/transactions/", json=payload_no_reduce, headers={"Authorization": f"Bearer {token}"})
print(res2.status_code, res2.text)

# Check stock again
res_prod3 = requests.get("http://localhost:8000/api/v1/products/", headers={"Authorization": f"Bearer {token}"})
new_stock_2 = next(p["current_stock"] for p in res_prod3.json()["data"] if p["id"] == test_product["id"])
print(f"Stock after no-reduction: {new_stock_2} (Expected: {new_stock_1})")

