/*
  Warnings:

  - You are about to drop the `Page` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Page" DROP CONSTRAINT "Page_seoMetadataId_fkey";

-- AlterTable
ALTER TABLE "SeoMetadata" ADD COLUMN     "name" TEXT,
ADD COLUMN     "path" TEXT;

-- DropTable
DROP TABLE "Page";
