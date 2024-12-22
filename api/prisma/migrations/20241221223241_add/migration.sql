/*
  Warnings:

  - A unique constraint covering the columns `[name,channelToken]` on the table `SeoMetadata` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[path,channelToken]` on the table `SeoMetadata` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `baseUrl` to the `ChannelSettings` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ChannelSettings" ADD COLUMN     "baseUrl" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "SeoMetadata_name_channelToken_key" ON "SeoMetadata"("name", "channelToken");

-- CreateIndex
CREATE UNIQUE INDEX "SeoMetadata_path_channelToken_key" ON "SeoMetadata"("path", "channelToken");
