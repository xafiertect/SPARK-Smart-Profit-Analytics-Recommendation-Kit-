import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_create_transaction_updates_stock(client: AsyncClient, auth_headers: dict):
    # 1. Create a product first
    product_res = await client.post(
        "/api/v1/products/",
        headers=auth_headers,
        json={
            "name": "Gula",
            "category": "Sembako",
            "unit": "kg",
            "base_price": 12000,
            "sell_price": 15000,
            "current_stock": 50,
            "min_stock_threshold": 10
        }
    )
    assert product_res.status_code == 201
    product_data = product_res.json()["data"]
    product_id = product_data["id"]

    # 2. Record a sale of 10 units
    tx_res = await client.post(
        "/api/v1/transactions/",
        headers=auth_headers,
        json={
            "transaction_type": "sale",
            "transaction_date": "2024-01-15",
            "source": "manual",
            "notes": "Test sale",
            "items": [
                {
                    "product_id": product_id,
                    "product_name": "Gula",
                    "quantity": 10,
                    "unit_price": 15000,
                    "subtotal": 150000
                }
            ]
        }
    )
    assert tx_res.status_code == 201

    # 3. Verify stock has decreased
    updated_product_res = await client.get(
        f"/api/v1/products/",
        headers=auth_headers
    )
    assert updated_product_res.status_code == 200
    products = updated_product_res.json()["data"]
    updated_product = next(p for p in products if p["id"] == product_id)
    assert updated_product["current_stock"] == 40.0


@pytest.mark.asyncio
async def test_user_cannot_access_other_user_data(client: AsyncClient, create_test_user):
    headers_a = await create_test_user(email="user_a@spark.id", business_name="Store A")
    headers_b = await create_test_user(email="user_b@spark.id", business_name="Store B")

    # User A creates a product
    product_res = await client.post(
        "/api/v1/products/",
        headers=headers_a,
        json={
            "name": "Kopi",
            "category": "Minuman",
            "unit": "pcs",
            "base_price": 2000,
            "sell_price": 3000,
            "current_stock": 100,
            "min_stock_threshold": 10
        }
    )
    assert product_res.status_code == 201
    product_id = product_res.json()["data"]["id"]

    # User A creates a transaction
    tx_res = await client.post(
        "/api/v1/transactions/",
        headers=headers_a,
        json={
            "transaction_type": "sale",
            "transaction_date": "2024-01-15",
            "source": "manual",
            "notes": "User A sale",
            "items": [
                {
                    "product_id": product_id,
                    "product_name": "Kopi",
                    "quantity": 5,
                    "unit_price": 3000,
                    "subtotal": 15000
                }
            ]
        }
    )
    assert tx_res.status_code == 201
    tx_id = tx_res.json()["data"]["id"]

    # User B must get 404 for User A's transaction
    res = await client.get(f"/api/v1/transactions/{tx_id}", headers=headers_b)
    assert res.status_code == 404

    # User B must not see User A's product
    res = await client.get("/api/v1/products/", headers=headers_b)
    assert res.status_code == 200
    products = res.json()["data"]
    assert not any(p["id"] == product_id for p in products)
