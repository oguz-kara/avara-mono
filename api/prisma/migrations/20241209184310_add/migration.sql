/*
  Warnings:

  - A unique constraint covering the columns `[featuredAssetId]` on the table `Collection` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Collection" ADD COLUMN     "featuredAssetId" TEXT;

-- CreateTable
CREATE TABLE "_CollectionDocuments" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_CollectionDocuments_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_CollectionDocuments_B_index" ON "_CollectionDocuments"("B");

-- CreateIndex
CREATE UNIQUE INDEX "Collection_featuredAssetId_key" ON "Collection"("featuredAssetId");

-- AddForeignKey
ALTER TABLE "Collection" ADD CONSTRAINT "Collection_featuredAssetId_fkey" FOREIGN KEY ("featuredAssetId") REFERENCES "Asset"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CollectionDocuments" ADD CONSTRAINT "_CollectionDocuments_A_fkey" FOREIGN KEY ("A") REFERENCES "Asset"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CollectionDocuments" ADD CONSTRAINT "_CollectionDocuments_B_fkey" FOREIGN KEY ("B") REFERENCES "Collection"("id") ON DELETE CASCADE ON UPDATE CASCADE;
