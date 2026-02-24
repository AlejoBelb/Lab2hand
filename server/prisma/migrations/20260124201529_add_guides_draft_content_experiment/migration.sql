-- CreateEnum
CREATE TYPE "GuideStatus" AS ENUM ('DRAFT', 'PUBLISHED');

-- AlterTable
ALTER TABLE "Guide" ADD COLUMN     "content" JSONB,
ADD COLUMN     "experimentId" TEXT,
ADD COLUMN     "status" "GuideStatus" NOT NULL DEFAULT 'DRAFT';

-- CreateIndex
CREATE INDEX "Guide_courseId_status_idx" ON "Guide"("courseId", "status");

-- CreateIndex
CREATE INDEX "Guide_createdById_status_idx" ON "Guide"("createdById", "status");

-- CreateIndex
CREATE INDEX "Guide_experimentId_idx" ON "Guide"("experimentId");

-- AddForeignKey
ALTER TABLE "Guide" ADD CONSTRAINT "Guide_experimentId_fkey" FOREIGN KEY ("experimentId") REFERENCES "Experiment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
