/*
  Warnings:

  - Added the required column `channel_token` to the `Locales` table without a default value. This is not possible if the table is not empty.
  - Added the required column `channel_token` to the `Translation` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Locales" ADD COLUMN     "channel_token" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Translation" ADD COLUMN     "channel_token" TEXT NOT NULL;
