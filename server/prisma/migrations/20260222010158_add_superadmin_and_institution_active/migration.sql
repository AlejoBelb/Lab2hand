-- AlterEnum
ALTER TYPE "UserRole" ADD VALUE 'SUPERADMIN';

-- AlterTable
ALTER TABLE "Institution" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;
