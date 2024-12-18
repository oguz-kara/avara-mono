/*
  Warnings:

  - You are about to drop the column `seoMetadataId` on the `Collection` table. All the data in the column will be lost.
  - You are about to drop the column `seoMetadataId` on the `Product` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[collectionId]` on the table `SeoMetadata` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[productId]` on the table `SeoMetadata` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Collection" DROP CONSTRAINT "Collection_seoMetadataId_fkey";

-- DropForeignKey
ALTER TABLE "Product" DROP CONSTRAINT "Product_seoMetadataId_fkey";

-- DropIndex
DROP INDEX "Collection_seoMetadataId_key";

-- DropIndex
DROP INDEX "Product_seoMetadataId_key";

-- AlterTable
ALTER TABLE "Collection" DROP COLUMN "seoMetadataId";

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "seoMetadataId";

-- AlterTable
ALTER TABLE "SeoMetadata" ADD COLUMN     "collectionId" TEXT,
ADD COLUMN     "productId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "SeoMetadata_collectionId_key" ON "SeoMetadata"("collectionId");

-- CreateIndex
CREATE UNIQUE INDEX "SeoMetadata_productId_key" ON "SeoMetadata"("productId");

-- AddForeignKey
ALTER TABLE "SeoMetadata" ADD CONSTRAINT "SeoMetadata_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SeoMetadata" ADD CONSTRAINT "SeoMetadata_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "Collection"("id") ON DELETE CASCADE ON UPDATE CASCADE;
