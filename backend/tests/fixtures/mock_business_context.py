import uuid
from datetime import date

class MockTransactionItem:
    def __init__(self, product_name: str, quantity: float, unit_price: float):
        self.product_name = product_name
        self.quantity = quantity
        self.unit_price = unit_price
        self.subtotal = quantity * unit_price

class MockTransaction:
    def __init__(self, transaction_type: str, total_amount: float):
        self.id = uuid.uuid4()
        self.transaction_type = transaction_type
        self.total_amount = total_amount
        self.transaction_date = date.today()
        self.items = []

def make_transactions(sales: float, purchases: float) -> list[MockTransaction]:
    transactions = []
    if sales > 0:
        transactions.append(MockTransaction(transaction_type="sale", total_amount=sales))
    if purchases > 0:
        transactions.append(MockTransaction(transaction_type="purchase", total_amount=purchases))
    return transactions
