/*
  Warnings:

  - You are about to drop the column `courseId` on the `Experiment` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Experiment" DROP CONSTRAINT "Experiment_courseId_fkey";

-- AlterTable
ALTER TABLE "Experiment" DROP COLUMN "courseId";

-- CreateTable
CREATE TABLE "CourseExperiment" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "experimentId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CourseExperiment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CourseExperiment_courseId_idx" ON "CourseExperiment"("courseId");

-- CreateIndex
CREATE INDEX "CourseExperiment_experimentId_idx" ON "CourseExperiment"("experimentId");

-- CreateIndex
CREATE UNIQUE INDEX "CourseExperiment_courseId_experimentId_key" ON "CourseExperiment"("courseId", "experimentId");

-- AddForeignKey
ALTER TABLE "CourseExperiment" ADD CONSTRAINT "CourseExperiment_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseExperiment" ADD CONSTRAINT "CourseExperiment_experimentId_fkey" FOREIGN KEY ("experimentId") REFERENCES "Experiment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
