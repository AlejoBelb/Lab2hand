/*
  Warnings:

  - You are about to drop the `Scenario` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Scenario" DROP CONSTRAINT "Scenario_experimentId_fkey";

-- DropTable
DROP TABLE "Scenario";
