/*
  Warnings:

  - You are about to drop the `_ProductAssets` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[code]` on the table `Facet` will be added. If there are existing duplicate values, this will fail.
  - Made the column `createdAt` on table `Facet` required. This step will fail if there are existing NULL values in that column.
  - Made the column `updatedAt` on table `Facet` required. This step will fail if there are existing NULL values in that column.
  - Made the column `createdAt` on table `FacetValue` required. This step will fail if there are existing NULL values in that column.
  - Made the column `updatedAt` on table `FacetValue` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "_ProductAssets" DROP CONSTRAINT "_ProductAssets_A_fkey";

-- DropForeignKey
ALTER TABLE "_ProductAssets" DROP CONSTRAINT "_ProductAssets_B_fkey";

-- AlterTable
ALTER TABLE "Facet" ALTER COLUMN "createdAt" SET NOT NULL,
ALTER COLUMN "updatedAt" SET NOT NULL;

-- AlterTable
ALTER TABLE "FacetValue" ALTER COLUMN "createdAt" SET NOT NULL,
ALTER COLUMN "updatedAt" SET NOT NULL;

-- DropTable
DROP TABLE "_ProductAssets";

-- CreateTable
CREATE TABLE "_ProductDocuments" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ProductDocuments_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_ProductDocuments_B_index" ON "_ProductDocuments"("B");

-- CreateIndex
CREATE UNIQUE INDEX "Facet_code_key" ON "Facet"("code");

-- AddForeignKey
ALTER TABLE "_ProductDocuments" ADD CONSTRAINT "_ProductDocuments_A_fkey" FOREIGN KEY ("A") REFERENCES "Asset"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProductDocuments" ADD CONSTRAINT "_ProductDocuments_B_fkey" FOREIGN KEY ("B") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
