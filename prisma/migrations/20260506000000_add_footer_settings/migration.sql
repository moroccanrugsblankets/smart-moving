-- AlterTable: add showInFooter and footerOrder to Page
ALTER TABLE "Page" ADD COLUMN "showInFooter" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "Page" ADD COLUMN "footerOrder" INTEGER NOT NULL DEFAULT 0;

-- CreateTable: FooterSettings
CREATE TABLE "FooterSettings" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "description" TEXT NOT NULL DEFAULT 'Cost estimates are based on U.S. Bureau of Labor Statistics data and regional market surveys (2026). Actual prices may vary.',
    "customLinks" JSONB NOT NULL DEFAULT '[]',

    CONSTRAINT "FooterSettings_pkey" PRIMARY KEY ("id")
);
