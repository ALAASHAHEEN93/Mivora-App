-- CreateTable
CREATE TABLE "Inquiry" (
    "id" TEXT NOT NULL,
    "activityId" TEXT NOT NULL,
    "parentId" TEXT NOT NULL,
    "sessionAt" TIMESTAMPTZ(3),
    "childAge" INTEGER,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Inquiry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Inquiry_parentId_createdAt_idx" ON "Inquiry"("parentId", "createdAt");

-- CreateIndex
CREATE INDEX "Inquiry_activityId_createdAt_idx" ON "Inquiry"("activityId", "createdAt");

-- AddForeignKey
ALTER TABLE "Inquiry" ADD CONSTRAINT "Inquiry_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "Activity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inquiry" ADD CONSTRAINT "Inquiry_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
