-- CreateEnum
CREATE TYPE "AutoTranslateModel" AS ENUM ('GOOGLE', 'GPT_3_5_TURBO', 'GPT_4', 'GPT_4_O', 'GPT_4_O_MINI', 'GPT_O1', 'GPT_O1_MINI');

-- CreateTable
CREATE TABLE "ChannelSettings" (
    "id" SERIAL NOT NULL,
    "channelId" INTEGER NOT NULL,
    "autoTranslate" BOOLEAN NOT NULL DEFAULT false,
    "autoTranslateModel" "AutoTranslateModel" NOT NULL DEFAULT 'GPT_3_5_TURBO',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChannelSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Translation" (
    "id" SERIAL NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" INTEGER NOT NULL,
    "locale" TEXT NOT NULL,
    "fieldName" TEXT NOT NULL,
    "translatedValue" TEXT,
    "lastSyncedAt" TIMESTAMP(3),
    "autoGenerated" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Translation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Locales" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Locales_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ChannelSettings_channelId_key" ON "ChannelSettings"("channelId");

-- CreateIndex
CREATE UNIQUE INDEX "Translation_entityType_entityId_locale_fieldName_key" ON "Translation"("entityType", "entityId", "locale", "fieldName");

-- AddForeignKey
ALTER TABLE "ChannelSettings" ADD CONSTRAINT "ChannelSettings_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "Channel"("id") ON DELETE CASCADE ON UPDATE CASCADE;
