import pytest
from unittest.mock import patch
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_ocr_scan_endpoint_success(client: AsyncClient, auth_headers: dict):
    # Mock ParsedReceipt returned by the OCR service
    mock_parsed_receipt = {
        "transaction_date": "2024-01-15",
        "items": [
            {
                "product_name": "Minyak Goreng",
                "quantity": 2,
                "unit_price": 16000,
                "subtotal": 32000
            }
        ],
        "total_amount": 32000,
        "confidence": "high"
    }

    with patch("routers.ocr.extract_text_from_image", return_value=mock_parsed_receipt):
        # We can send an empty file body since the function is mocked
        files = {"file": ("receipt.jpg", b"fake_image_data", "image/jpeg")}
        
        response = await client.post(
            "/api/v1/ocr/scan",
            headers=auth_headers,
            files=files
        )
        
        assert response.status_code == 200
        data = response.json()["data"]
        assert data["confidence"] == "high"
        assert len(data["items"]) == 1
        assert data["items"][0]["product_name"] == "Minyak Goreng"
        assert data["total_amount"] == 32000
