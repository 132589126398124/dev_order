-- AlterTable: add autoExpireDays to ShopSettings if it does not already exist
ALTER TABLE "ShopSettings" ADD COLUMN IF NOT EXISTS "autoExpireDays" INTEGER NOT NULL DEFAULT 7;
