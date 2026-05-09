-- Drop subscription_item (depends on subscription)
DROP TABLE IF EXISTS "subscription_item";

-- Drop subscription
DROP TABLE IF EXISTS "subscription";

-- Drop order_item (depends on order)
DROP TABLE IF EXISTS "order_item";

-- Drop order
DROP TABLE IF EXISTS "order";

-- Drop credit_transaction
DROP TABLE IF EXISTS "credit_transaction";

-- Drop credit_deduction_failure
DROP TABLE IF EXISTS "credit_deduction_failure";

-- Drop credit_balance
DROP TABLE IF EXISTS "credit_balance";

-- Drop billing_event
DROP TABLE IF EXISTS "billing_event";

-- Drop task
DROP TABLE IF EXISTS "task";

-- Remove stripe_customer_id from organization
ALTER TABLE "organization" DROP COLUMN IF EXISTS "stripe_customer_id";

-- Drop billing enums
DROP TYPE IF EXISTS "BillingInterval";
DROP TYPE IF EXISTS "CreditTransactionType";
DROP TYPE IF EXISTS "OrderStatus";
DROP TYPE IF EXISTS "OrderType";
DROP TYPE IF EXISTS "PriceModel";
DROP TYPE IF EXISTS "PriceType";
DROP TYPE IF EXISTS "SubscriptionStatus";

-- Drop task enums
DROP TYPE IF EXISTS "TaskStatus";
DROP TYPE IF EXISTS "TaskPriority";
