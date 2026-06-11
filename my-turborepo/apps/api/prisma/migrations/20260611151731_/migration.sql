/*
  Warnings:

  - The values [PREMIUM,FAMILY] on the enum `SubscriptionTier` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "SubscriptionTier_new" AS ENUM ('FREE', 'STANDART');
ALTER TABLE "subscriptions" ALTER COLUMN "tier" DROP DEFAULT;
ALTER TABLE "subscriptions" ALTER COLUMN "tier" TYPE "SubscriptionTier_new" USING ("tier"::text::"SubscriptionTier_new");
ALTER TYPE "SubscriptionTier" RENAME TO "SubscriptionTier_old";
ALTER TYPE "SubscriptionTier_new" RENAME TO "SubscriptionTier";
DROP TYPE "SubscriptionTier_old";
ALTER TABLE "subscriptions" ALTER COLUMN "tier" SET DEFAULT 'FREE';
COMMIT;
