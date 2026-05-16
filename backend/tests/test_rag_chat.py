import asyncio
import os
import sys

# Add backend to sys.path to import modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from services.llm_service import chat_with_context

async def run_test():
    # Mock business context
    business_context = {
        "products": [
            {"id": "1", "name": "Kopi Susu", "current_stock": 50, "min_stock_threshold": 10, "sell_price": 15000}
        ],
        "stock_levels": {"Kopi Susu": 50},
        "daily_sales_avg": {"Kopi Susu": 10},
        "this_week_expense": 500000,
        "last_week_expense": 400000
    }
    
    # Test queries
    queries = [
        "Bagaimana cara mengelola arus kas yang baik?",
        "Tolong buatkan resep nasi goreng",
        "Apa produk terlaris saya minggu ini?"
    ]
    
    for q in queries:
        print(f"\n--- Q: {q} ---")
        response = await chat_with_context(q, business_context)
        print(f"A: {response}")

if __name__ == "__main__":
    asyncio.run(run_test())
