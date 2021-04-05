/*
  Warnings:

  - Made the column `bio` on table `Profile` required. The migration will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Profile" ALTER COLUMN "bio" SET NOT NULL,
ALTER COLUMN "userId" DROP NOT NULL;

-- AlterIndex
ALTER INDEX "Profile.userId_unique" RENAME TO "Profile_userId_unique";
