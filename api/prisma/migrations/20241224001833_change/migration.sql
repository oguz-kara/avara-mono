/*
  Warnings:

  - The values [GOOGLE] on the enum `TranslateModelType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "TranslateModelType_new" AS ENUM ('GOOGLE_TRANSLATE', 'GPT');
ALTER TYPE "TranslateModelType" RENAME TO "TranslateModelType_old";
ALTER TYPE "TranslateModelType_new" RENAME TO "TranslateModelType";
DROP TYPE "TranslateModelType_old";
COMMIT;
