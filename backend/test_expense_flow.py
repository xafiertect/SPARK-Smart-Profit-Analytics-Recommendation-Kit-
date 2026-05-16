import sys
import os
import asyncio
from datetime import datetime

sys.path.append(os.path.abspath('backend'))

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import select
from models.user import User
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
client = TestClient(app)

# 1. Test "draft" expense
print("Testing Draft Expense...")
payload = {
    "name": f"Test Prod {datetime.now().timestamp()}",
    "category": "Sembako",
    "unit": "pcs",
    "base_price": 5000,
    "sell_price": 7000,
    "current_stock": 10,
    "min_stock_threshold": 5,
    "expense_action": "draft"
}
res1 = client.post("/api/v1/products/", json=payload, headers={"Authorization": f"Bearer {token}"})
print(res1.json())
prod_id = res1.json()["data"]["id"]

print("\nChecking expenses...")
exp_res = client.get("/api/v1/expenses/", headers={"Authorization": f"Bearer {token}"})
for exp in exp_res.json()["data"]:
    if exp["related_product_id"] == prod_id:
        print(f"Expense Found: status={exp['status']}, total={exp['total_default']}")

print("\nChecking notifications...")
notif_res = client.get("/api/v1/notifications/", headers={"Authorization": f"Bearer {token}"})
for notif in notif_res.json()["data"]:
    if notif["related_product_id"] == prod_id:
        print(f"Notif Found: type={notif['type']}, msg={notif['message']}")

# 2. Test "confirmed" expense
print("\nTesting Confirmed Expense...")
update_payload = {
    "current_stock": 15,
    "expense_action": "confirmed",
    "expense_total_actual": 24000
}
res2 = client.put(f"/api/v1/products/{prod_id}", json=update_payload, headers={"Authorization": f"Bearer {token}"})
print(res2.json()["data"]["current_stock"])

print("\nChecking expenses again...")
exp_res2 = client.get("/api/v1/expenses/", headers={"Authorization": f"Bearer {token}"})
for exp in exp_res2.json()["data"]:
    if exp["related_product_id"] == prod_id and exp["status"] == "confirmed":
        print(f"Expense Found: status={exp['status']}, actual={exp['total_actual']}")

