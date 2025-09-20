import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";

const Body = z.object({
  limit: z.number().int().min(1).max(200).default(50),
});

type Params = { params: { id: string } };

export async function POST(req: Request, { params }: Params) {
  const campaignId = params.id;
  const { limit } = Body.parse(await req.json().catch(() => ({})));

  // Respect paused
  const settings = await prisma.campaignSettings.findUnique({ where: { campaignId } });
  if (settings?.paused) return NextResponse.json({ processed: 0, sent: 0, failed: 0, paused: true });

  const now = new Date();

  const due = await prisma.emailJob.findMany({
    where: { campaignId, status: "scheduled", sendAt: { lte: now } },
    orderBy: { sendAt: "asc" },
    take: limit,
    select: { id: true },
  });

  if (due.length === 0) return NextResponse.json({ processed: 0, sent: 0, failed: 0 });

  // Lock
  const locked: string[] = [];
  for (const j of due) {
    const u = await prisma.emailJob.updateMany({
      where: { id: j.id, status: "scheduled" },
      data: { status: "processing", processingStartedAt: now },
    });
    if (u.count === 1) locked.push(j.id);
  }
  if (locked.length === 0) return NextResponse.json({ processed: 0, sent: 0, failed: 0 });

  // TODO: replace with your real sender (runSchedule)
  let sent = 0, failed = 0;
  for (const id of locked) {
    try {
      await prisma.emailEvent.create({ data: { jobId: id, type: "send_attempt", meta: { manual: true } } });
      await prisma.emailJob.update({
        where: { id },
        data: { status: "sent", sentAt: new Date(), attempts: { increment: 1 }, error: null },
      });
      await prisma.emailEvent.create({ data: { jobId: id, type: "sent", meta: { via: "manual" } } });
      sent++;
    } catch (err: any) {
      await prisma.emailJob.update({
        where: { id },
        data: {
          status: "scheduled",
          sendAt: new Date(Date.now() + 10 * 60 * 1000),
          attempts: { increment: 1 },
          error: String(err?.message ?? err),
        },
      });
      await prisma.emailEvent.create({ data: { jobId: id, type: "failed", meta: { via: "manual" } } });
      failed++;
    }
  }

  return NextResponse.json({ processed: locked.length, sent, failed });
}