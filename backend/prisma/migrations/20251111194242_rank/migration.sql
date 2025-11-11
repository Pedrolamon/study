/*
  Warnings:

  - Added the required column `rank` to the `user_points` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "user_points" ADD COLUMN     "rank" TEXT NOT NULL;
