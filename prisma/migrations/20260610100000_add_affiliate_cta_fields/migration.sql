-- AlterTable: add affiliate CTA text fields to Setting
ALTER TABLE "Setting" ADD COLUMN "affiliateTitle"       TEXT NOT NULL DEFAULT 'Moving Into a New House?';
ALTER TABLE "Setting" ADD COLUMN "affiliateDescription" TEXT NOT NULL DEFAULT 'Don''t let unexpected repairs or lock issues ruin your moving day. Get a certified local technician to secure your new home immediately.';
ALTER TABLE "Setting" ADD COLUMN "affiliateButtonText"  TEXT NOT NULL DEFAULT 'Call Our 24/7 Hotline:';
ALTER TABLE "Setting" ADD COLUMN "affiliateFooterText"  TEXT NOT NULL DEFAULT 'Free Quotes & Immediate Availability Verification';
