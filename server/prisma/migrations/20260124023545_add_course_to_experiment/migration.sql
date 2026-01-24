-- AlterTable
ALTER TABLE "Experiment" ADD COLUMN     "courseId" TEXT;

-- AddForeignKey
ALTER TABLE "Experiment" ADD CONSTRAINT "Experiment_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE SET NULL ON UPDATE CASCADE;
