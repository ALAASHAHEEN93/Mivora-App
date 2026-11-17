-- CreateTable
CREATE TABLE "SavedActivity" (
    "userId" TEXT NOT NULL,
    "activityId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SavedActivity_pkey" PRIMARY KEY ("userId","activityId")
);

-- CreateTable
CREATE TABLE "PlannedItem" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "activityId" TEXT NOT NULL,
    "startsAt" TIMESTAMPTZ(3) NOT NULL,
    "endsAt" TIMESTAMPTZ(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlannedItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PlannedItem_userId_startsAt_idx" ON "PlannedItem"("userId", "startsAt");

-- CreateIndex
CREATE UNIQUE INDEX "PlannedItem_userId_key_key" ON "PlannedItem"("userId", "key");

-- AddForeignKey
ALTER TABLE "SavedActivity" ADD CONSTRAINT "SavedActivity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlannedItem" ADD CONSTRAINT "PlannedItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
