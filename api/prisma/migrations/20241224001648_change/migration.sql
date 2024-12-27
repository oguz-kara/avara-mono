/*
  Warnings:

  - The values [GOOGLE] on the enum `TranslationProvider` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "TranslationProvider_new" AS ENUM ('GOOGLE_TRANSLATE', 'GPT_3_5_TURBO', 'GPT_4', 'GPT_4_O', 'GPT_4_O_MINI', 'GPT_O1', 'GPT_O1_MINI');
ALTER TABLE "LocalizationSettings" ALTER COLUMN "translationProvider" DROP DEFAULT;
ALTER TABLE "Translation" ALTER COLUMN "translatorModel" TYPE "TranslationProvider_new" USING ("translatorModel"::text::"TranslationProvider_new");
ALTER TABLE "LocalizationSettings" ALTER COLUMN "translationProvider" TYPE "TranslationProvider_new" USING ("translationProvider"::text::"TranslationProvider_new");
ALTER TYPE "TranslationProvider" RENAME TO "TranslationProvider_old";
ALTER TYPE "TranslationProvider_new" RENAME TO "TranslationProvider";
DROP TYPE "TranslationProvider_old";
ALTER TABLE "LocalizationSettings" ALTER COLUMN "translationProvider" SET DEFAULT 'GPT_3_5_TURBO';
COMMIT;
