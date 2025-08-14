/*
  Warnings:

  - You are about to drop the column `individualGoalCurrency` on the `campaigns` table. All the data in the column will be lost.
  - You are about to drop the column `overallGoalCurrency` on the `campaigns` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "campaigns" DROP COLUMN "individualGoalCurrency",
DROP COLUMN "overallGoalCurrency",
ADD COLUMN     "amountPerPoint" DECIMAL(15,2),
ADD COLUMN     "campaignCurrency" TEXT NOT NULL DEFAULT 'MXN';
