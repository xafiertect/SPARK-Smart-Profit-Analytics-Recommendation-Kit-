from services.ai_agent import check_low_stock, check_expense_spike

def test_low_stock_triggers_below_threshold():
    p = {"name": "Gula", "current_stock": 5}
    assert check_low_stock(p, avg_daily_sales=3.0) is True   # 5 < 3*3=9

def test_low_stock_does_not_trigger_above_threshold():
    p = {"name": "Gula", "current_stock": 15}
    assert check_low_stock(p, avg_daily_sales=3.0) is False  # 15 >= 9

def test_expense_spike_at_exact_threshold():
    # 25% increase threshold: last_week=100_000 -> 125_000 is NOT >, so False
    # Wait, the threshold in check_expense_spike is > last_week * 1.25.
    assert check_expense_spike(this_week=125_000, last_week=100_000) is False

def test_expense_spike_above_threshold():
    assert check_expense_spike(this_week=126_000, last_week=100_000) is True

def test_expense_spike_below_threshold():
    assert check_expense_spike(this_week=124_000, last_week=100_000) is False

def test_expense_spike_handles_zero_last_week():
    assert check_expense_spike(this_week=100_000, last_week=0) is False
