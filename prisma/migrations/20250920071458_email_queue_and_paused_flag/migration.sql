-- CreateEnum
CREATE TYPE "EmailJobStatus" AS ENUM ('scheduled', 'processing', 'sent', 'failed');

-- CreateEnum
CREATE TYPE "EmailEventType" AS ENUM ('send_attempt', 'sent', 'failed', 'bounce', 'complaint', 'opened', 'clicked', 'paused', 'resumed', 'schedule_updated');

-- AlterTable
ALTER TABLE "AudienceGroup" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "AudienceMember" ADD COLUMN     "unsubscribed" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "tagsSnapshot" DROP DEFAULT;

-- AlterTable
ALTER TABLE "CampaignSchedule" ADD COLUMN     "campaignId" TEXT,
ADD COLUMN     "smartWindowEnd" TIMESTAMP(3),
ADD COLUMN     "smartWindowStart" TIMESTAMP(3),
ADD COLUMN     "stepOrder" INTEGER NOT NULL DEFAULT 1,
ALTER COLUMN "timeZone" DROP NOT NULL,
ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "CampaignSend" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "CampaignTemplate" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- CreateTable
CREATE TABLE "Campaign" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" "CampaignStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Campaign_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CampaignSettings" (
    "campaignId" TEXT NOT NULL,
    "windows" JSONB NOT NULL,
    "throttlePerMinute" INTEGER NOT NULL DEFAULT 60,
    "maxConcurrent" INTEGER NOT NULL DEFAULT 50,
    "perDomain" JSONB,
    "quietHours" JSONB,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "paused" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "CampaignSettings_pkey" PRIMARY KEY ("campaignId")
);

-- CreateTable
CREATE TABLE "EmailJob" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "recipientEmail" TEXT NOT NULL,
    "recipientId" TEXT,
    "sendAt" TIMESTAMP(3) NOT NULL,
    "status" "EmailJobStatus" NOT NULL DEFAULT 'scheduled',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "error" TEXT,
    "processingStartedAt" TIMESTAMP(3),
    "sentAt" TIMESTAMP(3),
    "providerMessageId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmailJob_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmailEvent" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "type" "EmailEventType" NOT NULL,
    "meta" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmailEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "EmailJob_campaignId_status_sendAt_idx" ON "EmailJob"("campaignId", "status", "sendAt");

-- CreateIndex
CREATE INDEX "EmailEvent_jobId_type_createdAt_idx" ON "EmailEvent"("jobId", "type", "createdAt");

-- CreateIndex
CREATE INDEX "CampaignSchedule_campaignId_stepOrder_idx" ON "CampaignSchedule"("campaignId", "stepOrder");

-- AddForeignKey
ALTER TABLE "CampaignSchedule" ADD CONSTRAINT "CampaignSchedule_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignSettings" ADD CONSTRAINT "CampaignSettings_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmailEvent" ADD CONSTRAINT "EmailEvent_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "EmailJob"("id") ON DELETE CASCADE ON UPDATE CASCADE;
