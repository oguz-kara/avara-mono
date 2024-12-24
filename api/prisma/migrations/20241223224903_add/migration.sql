/*
  Warnings:

  - You are about to drop the `ChannelSettings` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `translatorModel` to the `Translation` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "TranslationModel" AS ENUM ('GOOGLE', 'GPT_3_5_TURBO', 'GPT_4', 'GPT_4_O', 'GPT_4_O_MINI', 'GPT_O1', 'GPT_O1_MINI');

-- CreateEnum
CREATE TYPE "TranslateModelType" AS ENUM ('GOOGLE', 'GPT');

-- DropForeignKey
ALTER TABLE "ChannelSettings" DROP CONSTRAINT "ChannelSettings_channelId_fkey";

-- AlterTable
ALTER TABLE "Translation" ADD COLUMN     "translatorModel" "TranslationModel" NOT NULL;

-- DropTable
DROP TABLE "ChannelSettings";

-- DropEnum
DROP TYPE "AutoTranslateModel";

-- CreateTable
CREATE TABLE "Segment" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "channel_token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Segment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LocalizationSettings" (
    "id" SERIAL NOT NULL,
    "channelId" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "autoTranslate" BOOLEAN NOT NULL DEFAULT false,
    "translationProvider" "TranslationModel" NOT NULL DEFAULT 'GPT_3_5_TURBO',
    "channel_token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LocalizationSettings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Segment_channel_token_path_key" ON "Segment"("channel_token", "path");

-- CreateIndex
CREATE UNIQUE INDEX "LocalizationSettings_channelId_key" ON "LocalizationSettings"("channelId");
