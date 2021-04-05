/*
  Warnings:

  - Made the column `title` on table `Post` required. The migration will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Post" ALTER COLUMN "title" SET NOT NULL;
