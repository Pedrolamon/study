/*
  Warnings:

  - The `allUsersPoints` column on the `badges` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "badges" DROP COLUMN "allUsersPoints",
ADD COLUMN     "allUsersPoints" INTEGER;
