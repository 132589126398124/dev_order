-- Add shop shipping address fields to ShopSettings
ALTER TABLE "ShopSettings" ADD COLUMN IF NOT EXISTS "shopRecipient" TEXT;
ALTER TABLE "ShopSettings" ADD COLUMN IF NOT EXISTS "shopAddress" TEXT;
ALTER TABLE "ShopSettings" ADD COLUMN IF NOT EXISTS "shopPhone" TEXT;

-- Add PIN reset token fields to User
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "pinResetToken" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "pinResetExpires" TIMESTAMP(3);
CREATE UNIQUE INDEX IF NOT EXISTS "User_pinResetToken_key" ON "User"("pinResetToken");
