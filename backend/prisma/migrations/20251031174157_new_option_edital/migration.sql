/*
  Warnings:

  - Added the required column `description` to the `Edital` table without a default value. This is not possible if the table is not empty.
  - Added the required column `examDate` to the `Edital` table without a default value. This is not possible if the table is not empty.
  - Added the required column `examType` to the `Edital` table without a default value. This is not possible if the table is not empty.
  - Added the required column `organization` to the `Edital` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Edital" ADD COLUMN     "description" TEXT NOT NULL,
ADD COLUMN     "examDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "examType" TEXT NOT NULL,
ADD COLUMN     "organization" TEXT NOT NULL;
