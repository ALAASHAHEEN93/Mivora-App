-- AlterTable
ALTER TABLE "Activity" ADD COLUMN     "recheckSentAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "PlannedItem" ADD COLUMN     "reminderSentAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "remindersEnabled" BOOLEAN NOT NULL DEFAULT true;
