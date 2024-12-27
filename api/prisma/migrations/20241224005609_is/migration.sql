/*
  Warnings:

  - You are about to drop the column `isActive` on the `LocalizationSettings` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "LocalizationSettings" DROP COLUMN "isActive",
ADD COLUMN     "enabled" BOOLEAN NOT NULL DEFAULT true;
