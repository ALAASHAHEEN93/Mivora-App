-- AlterTable
ALTER TABLE "PlannedItem" ADD COLUMN     "childIds" TEXT[] DEFAULT ARRAY[]::TEXT[];
