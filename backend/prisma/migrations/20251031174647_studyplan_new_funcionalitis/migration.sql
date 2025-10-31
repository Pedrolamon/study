/*
  Warnings:

  - Added the required column `isActive` to the `Edital` table without a default value. This is not possible if the table is not empty.
  - Added the required column `topics` to the `Edital` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalTopics` to the `Edital` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dailyHours` to the `StudyPlan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `description` to the `StudyPlan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `endDate` to the `StudyPlan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `isActive` to the `StudyPlan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lastUpdated` to the `StudyPlan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `progress` to the `StudyPlan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sessions` to the `StudyPlan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startDate` to the `StudyPlan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `StudyPlan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalHours` to the `StudyPlan` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Edital" ADD COLUMN     "isActive" BOOLEAN NOT NULL,
ADD COLUMN     "topics" JSONB NOT NULL,
ADD COLUMN     "totalTopics" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "StudyPlan" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "dailyHours" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "description" TEXT NOT NULL,
ADD COLUMN     "endDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "isActive" BOOLEAN NOT NULL,
ADD COLUMN     "lastUpdated" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "progress" INTEGER NOT NULL,
ADD COLUMN     "sessions" JSONB NOT NULL,
ADD COLUMN     "startDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "title" TEXT NOT NULL,
ADD COLUMN     "totalHours" DOUBLE PRECISION NOT NULL;
