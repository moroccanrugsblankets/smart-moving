-- AlterTable: add categoryIds and featuredImage to BlogPost
ALTER TABLE "BlogPost" ADD COLUMN "categoryIds" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "BlogPost" ADD COLUMN "featuredImage" TEXT NOT NULL DEFAULT '';

-- CreateTable: EmailTemplate
CREATE TABLE "EmailTemplate" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "htmlContent" TEXT NOT NULL DEFAULT '',
    "defaultContent" TEXT NOT NULL DEFAULT '',
    "variables" TEXT[],
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmailTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EmailTemplate_key_key" ON "EmailTemplate"("key");
