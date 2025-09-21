import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { sendCampaignEmail } from "@/lib/email-sender";

const Body = z.object({
  limit: z.number().int().min(1).max(200).default(50),
  campaignId: z.string().optional(), // optional: process a single campaign
});

export async function GET() {
  // Handle GET requests from Vercel cron
  return await processCronJobs({ limit: 50 });
}

export async function POST(req: Request) {
  const json = await req.json().catch(() => ({}));
  const { limit, campaignId } = Body.parse(json);
  return await processCronJobs({ limit, campaignId });
}

async function processCronJobs({ limit = 50, campaignId }: { limit?: number; campaignId?: string } = {}) {

  const now = new Date();

  // 1) Find due jobs
  const dueJobs = await prisma.emailJob.findMany({
    where: {
      status: "scheduled",
      ...(campaignId ? { campaignId } : {}),
      sendAt: { lte: now },
    },
    orderBy: { sendAt: "asc" },
    take: limit,
    select: { id: true, campaignId: true },
  });

  if (dueJobs.length === 0) {
    return NextResponse.json({ processed: 0 });
  }

  const campaignIds = Array.from(new Set(dueJobs.map(j => j.campaignId)));
  const settings = await prisma.campaignSettings.findMany({
    where: { campaignId: { in: campaignIds } },
    select: { campaignId: true, paused: true },
  });
  const pausedSet = new Set(settings.filter(s => s.paused).map(s => s.campaignId));
  const filtered = dueJobs.filter(j => !pausedSet.has(j.campaignId));
  if (filtered.length === 0) return NextResponse.json({ processed: 0, sent: 0, failed: 0, paused: true });

  // 2) Lock them (idempotent)
  const locked: string[] = [];
  for (const j of filtered) {
    const u = await prisma.emailJob.updateMany({
      where: { id: j.id, status: "scheduled" },
      data: { status: "processing", processingStartedAt: now },
    });
    if (u.count === 1) locked.push(j.id);
  }

  // Nothing locked
  if (locked.length === 0) return NextResponse.json({ processed: 0 });

  // 3) Send emails using actual email sender
  let sent = 0, failed = 0;
  for (const id of locked) {
    try {
      // Create send attempt event
      await prisma.emailEvent.create({
        data: { jobId: id, type: "send_attempt", meta: { via: "cron" } },
      });

      // Send the actual email
      const result = await sendCampaignEmail(id);
      
      console.log(`Email sent successfully for job ${id}:`, result);
      sent++;
    } catch (err: any) {
      console.error(`Failed to send email for job ${id}:`, err);
      
      const next = new Date(Date.now() + 10 * 60 * 1000); // 10m backoff
      await prisma.emailJob.update({
        where: { id },
        data: { 
          status: "scheduled", 
          sendAt: next, 
          attempts: { increment: 1 }, 
          error: String(err?.message ?? err) 
        },
      });
      await prisma.emailEvent.create({
        data: { 
          jobId: id, 
          type: "failed", 
          meta: { 
            via: "cron", 
            error: String(err?.message ?? err),
            retryAt: next.toISOString(),
          } 
        },
      });
      failed++;
    }
  }

  return NextResponse.json({ processed: locked.length, sent, failed });
}