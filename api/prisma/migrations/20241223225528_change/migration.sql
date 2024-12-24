/*
  Warnings:

  - The `translationProvider` column on the `LocalizationSettings` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `translatorModel` on the `Translation` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "TranslationProvider" AS ENUM ('GOOGLE', 'GPT_3_5_TURBO', 'GPT_4', 'GPT_4_O', 'GPT_4_O_MINI', 'GPT_O1', 'GPT_O1_MINI');

-- AlterTable
ALTER TABLE "LocalizationSettings" DROP COLUMN "translationProvider",
ADD COLUMN     "translationProvider" "TranslationProvider" NOT NULL DEFAULT 'GPT_3_5_TURBO';

-- AlterTable
ALTER TABLE "Translation" DROP COLUMN "translatorModel",
ADD COLUMN     "translatorModel" "TranslationProvider" NOT NULL;

-- DropEnum
DROP TYPE "TranslationModel";
