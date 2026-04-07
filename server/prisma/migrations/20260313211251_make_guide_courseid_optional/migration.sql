-- DropForeignKey
ALTER TABLE "Guide" DROP CONSTRAINT "Guide_courseId_fkey";

-- AlterTable
ALTER TABLE "Guide" ALTER COLUMN "courseId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Guide" ADD CONSTRAINT "Guide_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE SET NULL ON UPDATE CASCADE;
