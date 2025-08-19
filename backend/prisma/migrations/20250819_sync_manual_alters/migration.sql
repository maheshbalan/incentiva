-- CreateEnum
CREATE TYPE "DataExtractionJobType" AS ENUM ('ONE_TIME', 'INCREMENTAL');

-- CreateEnum
CREATE TYPE "DataExtractionJobStatus" AS ENUM ('PENDING', 'RUNNING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "TransactionProcessingJobStatus" AS ENUM ('PENDING', 'RUNNING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "RuleStatus" AS ENUM ('DRAFT', 'ACTIVE', 'INACTIVE', 'ARCHIVED');

-- AlterTable
ALTER TABLE "campaign_rules" DROP COLUMN "generatedCode",
DROP COLUMN "schemaFeedback",
DROP COLUMN "schemaUnderstandingScore",
ADD COLUMN     "status" "RuleStatus" NOT NULL DEFAULT 'DRAFT',
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "campaign_transactions" ADD COLUMN     "participantId" TEXT,
ADD COLUMN     "pointsEarned" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "campaigns" DROP COLUMN "backendConnectionConfig",
ADD COLUMN     "dataExtractionQueries" TEXT,
ADD COLUMN     "jsonRules" TEXT,
ADD COLUMN     "lastExecutedAt" TIMESTAMP(3),
ADD COLUMN     "transactionSchema" TEXT;

-- CreateTable
CREATE TABLE "tlp_artifacts" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "artifactType" TEXT NOT NULL,
    "artifactName" TEXT NOT NULL,
    "apiCall" TEXT NOT NULL,
    "response" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "errorDetails" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tlp_artifacts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "campaign_execution_logs" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "executedBy" TEXT NOT NULL,
    "executionData" TEXT NOT NULL,
    "success" BOOLEAN NOT NULL,
    "executionTime" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "campaign_execution_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "data_extraction_jobs" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "type" "DataExtractionJobType" NOT NULL,
    "status" "DataExtractionJobStatus" NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "extractedRows" INTEGER NOT NULL DEFAULT 0,
    "errorMessage" TEXT,
    "lastProcessedTimestamp" TIMESTAMP(3),

    CONSTRAINT "data_extraction_jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transaction_processing_jobs" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "status" "TransactionProcessingJobStatus" NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "processedRows" INTEGER NOT NULL DEFAULT 0,
    "processedTransactions" INTEGER NOT NULL DEFAULT 0,
    "errorMessage" TEXT,

    CONSTRAINT "transaction_processing_jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "campaign_participants" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "participantId" TEXT,
    "currentPoints" INTEGER NOT NULL DEFAULT 0,
    "goalProgress" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "isEnrolled" BOOLEAN NOT NULL DEFAULT true,
    "enrolledAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "campaign_participants_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "campaign_participants_userId_campaignId_key" ON "campaign_participants"("userId", "campaignId");

-- AddForeignKey
ALTER TABLE "campaign_transactions" ADD CONSTRAINT "campaign_transactions_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tlp_artifacts" ADD CONSTRAINT "tlp_artifacts_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campaign_execution_logs" ADD CONSTRAINT "campaign_execution_logs_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "data_extraction_jobs" ADD CONSTRAINT "data_extraction_jobs_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transaction_processing_jobs" ADD CONSTRAINT "transaction_processing_jobs_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campaign_participants" ADD CONSTRAINT "campaign_participants_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campaign_participants" ADD CONSTRAINT "campaign_participants_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

