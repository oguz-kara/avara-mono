/*
  Warnings:

  - Made the column `createdAt` on table `SeoMetadata` required. This step will fail if there are existing NULL values in that column.
  - Made the column `updatedAt` on table `SeoMetadata` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Asset" ADD COLUMN     "autoGenerated" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Facet" ADD COLUMN     "autoGenerated" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "FacetValue" ADD COLUMN     "autoGenerated" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "ImageVariant" ADD COLUMN     "autoGenerated" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "autoGenerated" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "ProductCollection" ADD COLUMN     "autoGenerated" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "SeoMetadata" ADD COLUMN     "autoGenerated" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "createdBy" TEXT,
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "deletedBy" TEXT,
ADD COLUMN     "updatedBy" TEXT,
ALTER COLUMN "createdAt" SET NOT NULL,
ALTER COLUMN "updatedAt" SET NOT NULL;

-- CreateTable
CREATE TABLE "Page" (
    "id" TEXT NOT NULL,
    "seoMetadataId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "defaultPath" TEXT NOT NULL,
    "channelToken" TEXT NOT NULL,
    "autoGenerated" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" TEXT,
    "createdBy" TEXT NOT NULL,
    "updatedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Page_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Page_seoMetadataId_key" ON "Page"("seoMetadataId");

-- AddForeignKey
ALTER TABLE "Page" ADD CONSTRAINT "Page_seoMetadataId_fkey" FOREIGN KEY ("seoMetadataId") REFERENCES "SeoMetadata"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
