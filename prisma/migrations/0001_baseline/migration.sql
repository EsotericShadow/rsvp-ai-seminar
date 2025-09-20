-- CreateEnum
CREATE TYPE "CampaignSendStatus" AS ENUM ('PENDING', 'SENDING', 'SENT', 'FAILED', 'SKIPPED');

-- CreateEnum
CREATE TYPE "CampaignStatus" AS ENUM ('DRAFT', 'SCHEDULED', 'SENDING', 'PAUSED', 'COMPLETED', 'CANCELLED');

-- CreateTable
CREATE TABLE "AudienceGroup" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "criteria" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AudienceGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AudienceMember" (
    "id" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "businessName" TEXT,
    "primaryEmail" TEXT NOT NULL,
    "secondaryEmail" TEXT,
    "tagsSnapshot" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "inviteToken" TEXT,
    "meta" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AudienceMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CampaignSchedule" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "status" "CampaignStatus" NOT NULL DEFAULT 'DRAFT',
    "sendAt" TIMESTAMP(3),
    "timeZone" TEXT NOT NULL DEFAULT 'America/Vancouver',
    "throttlePerMinute" INTEGER DEFAULT 60,
    "repeatIntervalMins" INTEGER,
    "lastRunAt" TIMESTAMP(3),
    "nextRunAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CampaignSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CampaignSend" (
    "id" TEXT NOT NULL,
    "scheduleId" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "businessName" TEXT,
    "email" TEXT NOT NULL,
    "inviteToken" TEXT,
    "inviteLink" TEXT,
    "resendMessageId" TEXT,
    "status" "CampaignSendStatus" NOT NULL DEFAULT 'PENDING',
    "error" TEXT,
    "meta" JSONB,
    "sentAt" TIMESTAMP(3),
    "openedAt" TIMESTAMP(3),
    "visitedAt" TIMESTAMP(3),
    "rsvpAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CampaignSend_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CampaignTemplate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "htmlBody" TEXT NOT NULL,
    "textBody" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CampaignTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RSVP" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "organization" TEXT,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "attendanceStatus" TEXT NOT NULL,
    "attendeeCount" INTEGER NOT NULL,
    "dietaryPreference" TEXT NOT NULL,
    "dietaryOther" TEXT,
    "accessibilityNeeds" TEXT,
    "referralSource" TEXT NOT NULL,
    "referralOther" TEXT,
    "wantsResources" BOOLEAN NOT NULL DEFAULT false,
    "wantsAudit" BOOLEAN NOT NULL DEFAULT false,
    "learningGoal" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "visitorId" TEXT,
    "sessionId" TEXT,
    "referrer" TEXT,
    "eid" TEXT,
    "utmSource" TEXT,
    "utmMedium" TEXT,
    "utmCampaign" TEXT,
    "utmTerm" TEXT,
    "utmContent" TEXT,
    "userAgent" TEXT,
    "language" TEXT,
    "tz" TEXT,
    "country" TEXT,
    "region" TEXT,
    "city" TEXT,
    "ipHash" TEXT,
    "screenW" INTEGER,
    "screenH" INTEGER,
    "dpr" DOUBLE PRECISION,
    "platform" TEXT,
    "device" TEXT,
    "browser" TEXT,
    "meta" TEXT,

    CONSTRAINT "RSVP_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Visit" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "visitorId" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "query" TEXT,
    "referrer" TEXT,
    "eid" TEXT,
    "utmSource" TEXT,
    "utmMedium" TEXT,
    "utmCampaign" TEXT,
    "utmTerm" TEXT,
    "utmContent" TEXT,
    "gclid" TEXT,
    "fbclid" TEXT,
    "msclkid" TEXT,
    "userAgent" TEXT,
    "language" TEXT,
    "tz" TEXT,
    "screenW" INTEGER,
    "screenH" INTEGER,
    "dpr" DOUBLE PRECISION,
    "platform" TEXT,
    "device" TEXT,
    "browser" TEXT,
    "country" TEXT,
    "region" TEXT,
    "city" TEXT,
    "ipHash" TEXT,
    "connection" JSONB,
    "deviceMemory" DOUBLE PRECISION,
    "hardwareConcurrency" INTEGER,
    "interactionCounts" JSONB,
    "languages" JSONB,
    "maxTouchPoints" INTEGER,
    "navigation" JSONB,
    "orientation" TEXT,
    "paint" JSONB,
    "performance" JSONB,
    "scrollDepth" INTEGER,
    "storage" JSONB,
    "timeOnPageMs" INTEGER,
    "viewportH" INTEGER,
    "viewportW" INTEGER,
    "visibility" JSONB,

    CONSTRAINT "Visit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AudienceMember_businessId_idx" ON "AudienceMember"("businessId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "AudienceMember_groupId_businessId_key" ON "AudienceMember"("groupId" ASC, "businessId" ASC);

-- CreateIndex
CREATE INDEX "AudienceMember_groupId_idx" ON "AudienceMember"("groupId" ASC);

-- CreateIndex
CREATE INDEX "CampaignSchedule_groupId_idx" ON "CampaignSchedule"("groupId" ASC);

-- CreateIndex
CREATE INDEX "CampaignSchedule_nextRunAt_idx" ON "CampaignSchedule"("nextRunAt" ASC);

-- CreateIndex
CREATE INDEX "CampaignSchedule_status_idx" ON "CampaignSchedule"("status" ASC);

-- CreateIndex
CREATE INDEX "CampaignSchedule_templateId_idx" ON "CampaignSchedule"("templateId" ASC);

-- CreateIndex
CREATE INDEX "CampaignSend_businessId_idx" ON "CampaignSend"("businessId" ASC);

-- CreateIndex
CREATE INDEX "CampaignSend_groupId_idx" ON "CampaignSend"("groupId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "CampaignSend_scheduleId_businessId_key" ON "CampaignSend"("scheduleId" ASC, "businessId" ASC);

-- CreateIndex
CREATE INDEX "CampaignSend_scheduleId_idx" ON "CampaignSend"("scheduleId" ASC);

-- CreateIndex
CREATE INDEX "CampaignSend_status_idx" ON "CampaignSend"("status" ASC);

-- CreateIndex
CREATE INDEX "CampaignSend_templateId_idx" ON "CampaignSend"("templateId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "RSVP_email_key" ON "RSVP"("email" ASC);

-- AddForeignKey
ALTER TABLE "AudienceMember" ADD CONSTRAINT "AudienceMember_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "AudienceGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignSchedule" ADD CONSTRAINT "CampaignSchedule_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "AudienceGroup"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignSchedule" ADD CONSTRAINT "CampaignSchedule_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "CampaignTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignSend" ADD CONSTRAINT "CampaignSend_scheduleId_fkey" FOREIGN KEY ("scheduleId") REFERENCES "CampaignSchedule"("id") ON DELETE CASCADE ON UPDATE CASCADE;
