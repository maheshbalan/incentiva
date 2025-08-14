-- AlterTable
ALTER TABLE "campaigns" ADD COLUMN     "databaseHost" TEXT,
ADD COLUMN     "databaseName" TEXT,
ADD COLUMN     "databasePassword" TEXT,
ADD COLUMN     "databasePort" INTEGER,
ADD COLUMN     "databaseType" TEXT,
ADD COLUMN     "databaseUsername" TEXT,
ADD COLUMN     "individualGoalBonus" DECIMAL(15,2),
ADD COLUMN     "overallGoalBonus" DECIMAL(15,2),
ADD COLUMN     "rewards" TEXT;
