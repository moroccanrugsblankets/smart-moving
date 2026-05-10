-- AlterTable: add quickLinks configuration to FooterSettings
ALTER TABLE "FooterSettings"
ADD COLUMN "quickLinks" JSONB NOT NULL DEFAULT '[{"id":"moving-cost","label":"Moving Cost by City","url":"/moving-cost"},{"id":"free-estimate-tool","label":"Free Estimate Tool","url":"/#calculator"}]';
