/*
  Warnings:

  - Added the required column `dynamicSegments` to the `ChannelSettings` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ChannelSettings" ADD COLUMN     "dynamicSegments" JSONB NOT NULL;
