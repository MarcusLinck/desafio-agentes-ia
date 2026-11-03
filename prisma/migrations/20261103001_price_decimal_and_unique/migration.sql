-- Change price and totalAmount from Float to Decimal for financial precision
-- Also add unique constraint to prevent duplicate products in orders

-- Alter Order.totalAmount from DOUBLE PRECISION to Decimal(65,30)
ALTER TABLE "Order" ALTER COLUMN "totalAmount" TYPE DECIMAL(65,30) USING "totalAmount"::DECIMAL(65,30);

-- Alter OrderItem.price from DOUBLE PRECISION to Decimal(65,30)
ALTER TABLE "OrderItem" ALTER COLUMN "price" TYPE DECIMAL(65,30) USING "price"::DECIMAL(65,30);

-- Add unique constraint on (orderId, productId) to prevent duplicate products in orders
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_orderId_productId_key" UNIQUE ("orderId", "productId");