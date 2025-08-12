-- CreateEnum
CREATE TYPE "TransactionProcessingStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'RETRY');

-- CreateEnum
CREATE TYPE "RulesEngineJobType" AS ENUM ('INITIAL_DATA_LOAD', 'INCREMENTAL_UPDATE', 'RULES_PROCESSING', 'TLP_SYNC');

-- CreateEnum
CREATE TYPE "RulesEngineJobStatus" AS ENUM ('PENDING', 'RUNNING', 'COMPLETED', 'FAILED', 'CANCELLED', 'SCHEDULED');

-- CreateEnum
CREATE TYPE "RulesEngineExecutionType" AS ENUM ('DATA_EXTRACTION', 'RULES_APPLICATION', 'TLP_INTEGRATION', 'FULL_PROCESSING');

-- CreateEnum
CREATE TYPE "RulesEngineExecutionStatus" AS ENUM ('RUNNING', 'COMPLETED', 'FAILED', 'CANCELLED');

-- AlterTable
ALTER TABLE "campaigns" ADD COLUMN     "totalPointsMinted" DECIMAL(15,2);

-- CreateTable
CREATE TABLE "campaign_transactions" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "externalId" TEXT,
    "externalType" TEXT,
    "transactionData" JSONB NOT NULL,
    "processedData" JSONB,
    "rulesApplied" BOOLEAN NOT NULL DEFAULT false,
    "pointsAllocated" INTEGER NOT NULL DEFAULT 0,
    "processingStatus" "TransactionProcessingStatus" NOT NULL DEFAULT 'PENDING',
    "tlpAccrualPayload" JSONB,
    "tlpTransactionId" TEXT,
    "tlpResponse" JSONB,
    "processedAt" TIMESTAMP(3),
    "errorMessage" TEXT,
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "maxRetries" INTEGER NOT NULL DEFAULT 3,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "campaign_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rules_engine_jobs" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "jobType" "RulesEngineJobType" NOT NULL,
    "status" "RulesEngineJobStatus" NOT NULL DEFAULT 'PENDING',
    "schedule" TEXT,
    "isRecurring" BOOLEAN NOT NULL DEFAULT false,
    "lastRunAt" TIMESTAMP(3),
    "nextRunAt" TIMESTAMP(3),
    "dataSourceConfig" JSONB NOT NULL,
    "batchSize" INTEGER NOT NULL DEFAULT 1000,
    "maxConcurrency" INTEGER NOT NULL DEFAULT 5,
    "totalRecords" INTEGER NOT NULL DEFAULT 0,
    "processedRecords" INTEGER NOT NULL DEFAULT 0,
    "failedRecords" INTEGER NOT NULL DEFAULT 0,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rules_engine_jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rules_engine_executions" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "executionType" "RulesEngineExecutionType" NOT NULL,
    "status" "RulesEngineExecutionStatus" NOT NULL DEFAULT 'RUNNING',
    "recordsProcessed" INTEGER NOT NULL DEFAULT 0,
    "recordsSucceeded" INTEGER NOT NULL DEFAULT 0,
    "recordsFailed" INTEGER NOT NULL DEFAULT 0,
    "startTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endTime" TIMESTAMP(3),
    "durationMs" INTEGER,
    "errorMessage" TEXT,
    "stackTrace" TEXT,
    "executionLog" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rules_engine_executions_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "campaign_transactions" ADD CONSTRAINT "campaign_transactions_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rules_engine_jobs" ADD CONSTRAINT "rules_engine_jobs_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rules_engine_executions" ADD CONSTRAINT "rules_engine_executions_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "rules_engine_jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rules_engine_executions" ADD CONSTRAINT "rules_engine_executions_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;
