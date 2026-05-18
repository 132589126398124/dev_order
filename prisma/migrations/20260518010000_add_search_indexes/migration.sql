-- Add indexes for admin search queries on customerName and phone
CREATE INDEX IF NOT EXISTS "Order_customerName_idx" ON "Order" ("customerName");
CREATE INDEX IF NOT EXISTS "Order_phone_idx" ON "Order" ("phone");
