/*
  Warnings:

  - The values [GOOGLE] on the enum `AutoTranslateModel` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "AutoTranslateModel_new" AS ENUM ('GPT_3_5_TURBO', 'GPT_4', 'GPT_4_O', 'GPT_4_O_MINI', 'GPT_O1', 'GPT_O1_MINI');
ALTER TABLE "ChannelSettings" ALTER COLUMN "autoTranslateModel" DROP DEFAULT;
ALTER TABLE "ChannelSettings" ALTER COLUMN "autoTranslateModel" TYPE "AutoTranslateModel_new" USING ("autoTranslateModel"::text::"AutoTranslateModel_new");
ALTER TYPE "AutoTranslateModel" RENAME TO "AutoTranslateModel_old";
ALTER TYPE "AutoTranslateModel_new" RENAME TO "AutoTranslateModel";
DROP TYPE "AutoTranslateModel_old";
ALTER TABLE "ChannelSettings" ALTER COLUMN "autoTranslateModel" SET DEFAULT 'GPT_3_5_TURBO';
COMMIT;

-- AlterEnum
ALTER TYPE "EntityType" ADD VALUE 'SEGMENT';

-- CreateTable
CREATE TABLE "DynamicSegment" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "channelToken" TEXT NOT NULL,
    "langCode" TEXT NOT NULL,
    "segment" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DynamicSegment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DynamicSegment_name_segment_channelToken_key" ON "DynamicSegment"("name", "segment", "channelToken");
