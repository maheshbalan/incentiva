-- CreateEnum
CREATE TYPE "GoalType" AS ENUM ('INDIVIDUAL', 'OVERALL', 'REGIONAL');

-- CreateEnum
CREATE TYPE "AIProvider" AS ENUM ('ANTHROPIC', 'OPENAI', 'GOOGLE', 'AZURE');

-- AlterTable
ALTER TABLE "campaign_executions" ADD COLUMN     "transactionAmount" DECIMAL(15,2),
ADD COLUMN     "transactionCurrency" TEXT DEFAULT 'MXN',
ADD COLUMN     "transactionType" TEXT;

-- AlterTable
ALTER TABLE "campaign_redemptions" ADD COLUMN     "offerDescription" TEXT,
ADD COLUMN     "offerName" TEXT,
ADD COLUMN     "tlpTransactionId" TEXT;

-- AlterTable
ALTER TABLE "campaigns" ADD COLUMN     "eligibilityCriteria" TEXT,
ADD COLUMN     "individualGoal" DECIMAL(15,2),
ADD COLUMN     "individualGoalCurrency" TEXT NOT NULL DEFAULT 'MXN',
ADD COLUMN     "overallGoal" DECIMAL(15,2),
ADD COLUMN     "overallGoalCurrency" TEXT NOT NULL DEFAULT 'MXN';

-- AlterTable
ALTER TABLE "user_campaigns" ADD COLUMN     "enrolledAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "isEnrolled" BOOLEAN NOT NULL DEFAULT true;

-- CreateTable
CREATE TABLE "campaign_goals" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "goalType" "GoalType" NOT NULL,
    "targetValue" DECIMAL(15,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'MXN',
    "description" TEXT,
    "isAchieved" BOOLEAN NOT NULL DEFAULT false,
    "achievedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "campaign_goals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system_configurations" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "description" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT,

    CONSTRAINT "system_configurations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_configurations" (
    "id" TEXT NOT NULL,
    "provider" "AIProvider" NOT NULL,
    "modelName" TEXT NOT NULL,
    "apiKey" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ai_configurations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "system_configurations_key_key" ON "system_configurations"("key");

-- AddForeignKey
ALTER TABLE "campaign_goals" ADD CONSTRAINT "campaign_goals_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;
