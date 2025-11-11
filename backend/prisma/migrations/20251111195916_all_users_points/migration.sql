/*
  Warnings:

  - You are about to drop the column `rank` on the `user_points` table. All the data in the column will be lost.
  - Added the required column `allUsersPoints` to the `badges` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "badges" ADD COLUMN     "allUsersPoints" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "user_points" DROP COLUMN "rank";
