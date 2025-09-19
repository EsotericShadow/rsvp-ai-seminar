-- CreateEnum
CREATE TYPE "CampaignStatus" AS ENUM ('DRAFT','SCHEDULED','SENDING','PAUSED','COMPLETED','CANCELLED');

-- CreateEnum
CREATE TYPE "CampaignSendStatus" AS ENUM ('PENDING','SENDING','SENT','FAILED','SKIPPED');

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
    CONSTRAINT "AudienceMember_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "AudienceMember_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "AudienceGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE
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
    CONSTRAINT "CampaignSchedule_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "CampaignSchedule_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "CampaignTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "CampaignSchedule_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "AudienceGroup"("id") ON DELETE RESTRICT ON UPDATE CASCADE
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
    CONSTRAINT "CampaignSend_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "CampaignSend_scheduleId_fkey" FOREIGN KEY ("scheduleId") REFERENCES "CampaignSchedule"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "AudienceMember_groupId_idx" ON "AudienceMember"("groupId");

-- CreateIndex
CREATE INDEX "AudienceMember_businessId_idx" ON "AudienceMember"("businessId");

-- CreateIndex
CREATE UNIQUE INDEX "AudienceMember_groupId_businessId_key" ON "AudienceMember"("groupId", "businessId");

-- CreateIndex
CREATE INDEX "CampaignSchedule_status_idx" ON "CampaignSchedule"("status");

-- CreateIndex
CREATE INDEX "CampaignSchedule_groupId_idx" ON "CampaignSchedule"("groupId");

-- CreateIndex
CREATE INDEX "CampaignSchedule_templateId_idx" ON "CampaignSchedule"("templateId");

-- CreateIndex
CREATE INDEX "CampaignSchedule_nextRunAt_idx" ON "CampaignSchedule"("nextRunAt");

-- CreateIndex
CREATE INDEX "CampaignSend_scheduleId_idx" ON "CampaignSend"("scheduleId");

-- CreateIndex
CREATE INDEX "CampaignSend_groupId_idx" ON "CampaignSend"("groupId");

-- CreateIndex
CREATE INDEX "CampaignSend_templateId_idx" ON "CampaignSend"("templateId");

-- CreateIndex
CREATE INDEX "CampaignSend_businessId_idx" ON "CampaignSend"("businessId");

-- CreateIndex
CREATE INDEX "CampaignSend_status_idx" ON "CampaignSend"("status");

-- CreateIndex
CREATE UNIQUE INDEX "CampaignSend_scheduleId_businessId_key" ON "CampaignSend"("scheduleId", "businessId");

