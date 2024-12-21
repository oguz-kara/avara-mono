/*
  Warnings:

  - Changed the type of `entityType` on the `Translation` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "EntityType" AS ENUM ('PRODUCT', 'COLLECTION', 'FACET', 'FACET_VALUE', 'SEO_METADATA');

-- AlterTable
ALTER TABLE "Translation" DROP COLUMN "entityType",
ADD COLUMN     "entityType" "EntityType" NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Translation_entityType_entityId_locale_fieldName_key" ON "Translation"("entityType", "entityId", "locale", "fieldName");
