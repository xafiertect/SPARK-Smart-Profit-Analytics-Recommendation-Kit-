from services.financial_engine import _calculate_summary
from tests.fixtures.mock_business_context import make_transactions

def test_profit_calculation():
    transactions = make_transactions(sales=500_000, purchases=300_000)
    result = _calculate_summary(transactions)
    assert result["income"] == 500_000
    assert result["expense"] == 300_000
    assert result["profit"] == 200_000

def test_zero_sales_no_division_error():
    result = _calculate_summary([])
    assert result["profit"] == 0
    assert result["income"] == 0
    assert result["expense"] == 0

def test_only_sales_profit():
    transactions = make_transactions(sales=500_000, purchases=0)
    result = _calculate_summary(transactions)
    assert result["income"] == 500_000
    assert result["expense"] == 0
    assert result["profit"] == 500_000

def test_only_purchases_loss():
    transactions = make_transactions(sales=0, purchases=300_000)
    result = _calculate_summary(transactions)
    assert result["income"] == 0
    assert result["expense"] == 300_000
    assert result["profit"] == -300_000
