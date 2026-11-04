-- Add nullable familyId first
ALTER TABLE "RefreshToken"
ADD COLUMN "familyId" TEXT;

-- Give every existing refresh token its own family
UPDATE "RefreshToken"
SET "familyId" = gen_random_uuid()::TEXT;

-- Make familyId required
ALTER TABLE "RefreshToken"
ALTER COLUMN "familyId" SET NOT NULL;

-- Add indexes
CREATE INDEX "RefreshToken_familyId_idx"
ON "RefreshToken"("familyId");

CREATE INDEX "RefreshToken_userId_idx"
ON "RefreshToken"("userId");