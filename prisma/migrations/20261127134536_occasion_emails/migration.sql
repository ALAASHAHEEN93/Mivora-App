-- AlterTable
ALTER TABLE "User" ADD COLUMN     "occasionEmailsSince" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "OccasionNotice" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "occasionKey" TEXT NOT NULL,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OccasionNotice_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "OccasionNotice_userId_sentAt_idx" ON "OccasionNotice"("userId", "sentAt");

-- CreateIndex
CREATE UNIQUE INDEX "OccasionNotice_userId_occasionKey_key" ON "OccasionNotice"("userId", "occasionKey");

-- AddForeignKey
ALTER TABLE "OccasionNotice" ADD CONSTRAINT "OccasionNotice_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
