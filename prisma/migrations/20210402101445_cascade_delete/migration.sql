-- AlterTable
ALTER TABLE "Post" ALTER COLUMN "authorId" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "fki_Post_authorId_fkey2" ON "Post"("authorId");
