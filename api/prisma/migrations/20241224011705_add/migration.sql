-- AlterTable
ALTER TABLE "LocalizationSettings" ADD COLUMN     "dynamicSegmentsEnabled" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "enabled" SET DEFAULT false;
