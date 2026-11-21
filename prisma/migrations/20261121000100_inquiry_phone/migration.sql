ALTER TABLE "Inquiry" ADD COLUMN "phone" TEXT;
CREATE INDEX "Inquiry_email_createdAt_idx" ON "Inquiry"("email", "createdAt");
