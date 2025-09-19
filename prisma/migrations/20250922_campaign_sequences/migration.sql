-- CreateTable
CREATE TABLE "Campaign" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" "CampaignStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Campaign_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "CampaignSchedule"
ADD COLUMN "campaignId" TEXT,
ADD COLUMN "stepOrder" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN "smartWindowStart" TIMESTAMP(3),
ADD COLUMN "smartWindowEnd" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "CampaignSchedule_campaignId_stepOrder_idx" ON "CampaignSchedule"("campaignId", "stepOrder");

-- AddForeignKey
ALTER TABLE "CampaignSchedule"
ADD CONSTRAINT "CampaignSchedule_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE SET NULL ON UPDATE CASCADE;
