/*
  Warnings:

  - You are about to drop the `_CollectionProducts` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[seoMetadataId]` on the table `Product` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[seoMetadataId]` on the table `ProductCollection` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "_CollectionProducts" DROP CONSTRAINT "_CollectionProducts_A_fkey";

-- DropForeignKey
ALTER TABLE "_CollectionProducts" DROP CONSTRAINT "_CollectionProducts_B_fkey";

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "seoMetadataId" TEXT;

-- AlterTable
ALTER TABLE "ProductCollection" ADD COLUMN     "isPrivate" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "parentId" TEXT,
ADD COLUMN     "seoMetadataId" TEXT;

-- DropTable
DROP TABLE "_CollectionProducts";

-- CreateIndex
CREATE UNIQUE INDEX "Product_seoMetadataId_key" ON "Product"("seoMetadataId");

-- CreateIndex
CREATE UNIQUE INDEX "ProductCollection_seoMetadataId_key" ON "ProductCollection"("seoMetadataId");

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_seoMetadataId_fkey" FOREIGN KEY ("seoMetadataId") REFERENCES "SeoMetadata"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductCollection" ADD CONSTRAINT "ProductCollection_seoMetadataId_fkey" FOREIGN KEY ("seoMetadataId") REFERENCES "SeoMetadata"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductCollection" ADD CONSTRAINT "ProductCollection_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "ProductCollection"("id") ON DELETE SET NULL ON UPDATE CASCADE;
