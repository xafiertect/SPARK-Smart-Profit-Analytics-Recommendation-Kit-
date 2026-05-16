"""add_rls_and_indexes

Revision ID: 0c7d546735ea
Create Date: 2026-05-10

Row-Level Security policies + performance indexes.
"""
from typing import Sequence, Union

from alembic import op

revision: str = "0c7d546735ea"
down_revision: Union[str, None] = "ce56620200ec"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

# Tables that hold user-scoped data
RLS_TABLES = ["products", "transactions", "transaction_items", "ai_insights"]


def upgrade() -> None:
    # ── Row-Level Security ──────────────────────────────────────────
    for table in RLS_TABLES:
        op.execute(f"ALTER TABLE {table} ENABLE ROW LEVEL SECURITY")

    # Policies: user can only see rows matching app.current_user_id
    op.execute("""
        CREATE POLICY tenant_isolation_products ON products
            USING (user_id = current_setting('app.current_user_id', true)::UUID)
    """)
    op.execute("""
        CREATE POLICY tenant_isolation_transactions ON transactions
            USING (user_id = current_setting('app.current_user_id', true)::UUID)
    """)
    op.execute("""
        CREATE POLICY tenant_isolation_items ON transaction_items
            USING (transaction_id IN (
                SELECT id FROM transactions
                WHERE user_id = current_setting('app.current_user_id', true)::UUID
            ))
    """)
    op.execute("""
        CREATE POLICY tenant_isolation_insights ON ai_insights
            USING (user_id = current_setting('app.current_user_id', true)::UUID)
    """)

    # NOTE: BYPASSRLS for spark role applied manually (requires superuser):
    #   ALTER ROLE spark BYPASSRLS;

    # ── Additional performance indexes ──────────────────────────────
    # Partial index: unread insights per user (for dashboard badge count)
    op.execute("""
        CREATE INDEX idx_ai_insights_user_unread
        ON ai_insights(user_id) WHERE is_read = false
    """)

    # Composite index: user + soft delete filter (most common query pattern)
    op.execute("""
        CREATE INDEX idx_products_user_active
        ON products(user_id) WHERE is_deleted = false
    """)
    op.execute("""
        CREATE INDEX idx_transactions_user_active
        ON transactions(user_id) WHERE is_deleted = false
    """)

    # Composite: user + date range (dashboard/financial engine queries)
    op.execute("""
        CREATE INDEX idx_transactions_user_date
        ON transactions(user_id, transaction_date) WHERE is_deleted = false
    """)

    # Transaction items → transaction_id lookup
    op.execute("""
        CREATE INDEX idx_txn_items_transaction_id
        ON transaction_items(transaction_id)
    """)


def downgrade() -> None:
    # Drop indexes
    op.execute("DROP INDEX IF EXISTS idx_txn_items_transaction_id")
    op.execute("DROP INDEX IF EXISTS idx_transactions_user_date")
    op.execute("DROP INDEX IF EXISTS idx_transactions_user_active")
    op.execute("DROP INDEX IF EXISTS idx_products_user_active")
    op.execute("DROP INDEX IF EXISTS idx_ai_insights_user_unread")

    # Drop policies
    op.execute("DROP POLICY IF EXISTS tenant_isolation_insights ON ai_insights")
    op.execute("DROP POLICY IF EXISTS tenant_isolation_items ON transaction_items")
    op.execute("DROP POLICY IF EXISTS tenant_isolation_transactions ON transactions")
    op.execute("DROP POLICY IF EXISTS tenant_isolation_products ON products")

    # Disable RLS
    for table in RLS_TABLES:
        op.execute(f"ALTER TABLE {table} DISABLE ROW LEVEL SECURITY")
