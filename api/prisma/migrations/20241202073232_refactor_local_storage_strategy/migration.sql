/*
  Warnings:

  - Added the required column `channelToken` to the `ImageVariant` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ImageVariant" ADD COLUMN     "channelToken" TEXT NOT NULL;
