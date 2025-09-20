import { NextResponse } from "next/server";
import prisma from "@/lib/prisma"; // adjust import path if needed
import { addMinutes, subMinutes, startOfDay, endOfDay } from "date-fns";

type Params = { params: { id: string } };

export async function GET(_req: Request, { params }: Params) {
  const campaignId = params.id;

  // Basic counts
  const [total, sent, failed, scheduled, processing] = await Promise.all([
    prisma.emailJob.count({ where: { campaignId } }),
    prisma.emailJob.count({ where: { campaignId, status: "sent" } }),
    prisma.emailJob.count({ where: { campaignId, status: "failed" } }),
    prisma.emailJob.count({ where: { campaignId, status: "scheduled" } }),
    prisma.emailJob.count({ where: { campaignId, status: "processing" } }),
  ]);

  // Next scheduled send
  const nextJob = await prisma.emailJob.findFirst({
    where: { campaignId, status: "scheduled" },
    orderBy: { sendAt: "asc" },
    select: { sendAt: true },
  });

  // Last sent timestamp
  const lastSent = await prisma.emailJob.findFirst({
    where: { campaignId, status: "sent" },
    orderBy: { sentAt: "desc" },
    select: { sentAt: true },
  });

  // Throughput over last 15 minutes
  const now = new Date();
  const windowStart = subMinutes(now, 15);
  const recentSent = await prisma.emailJob.count({
    where: { campaignId, status: "sent", sentAt: { gte: windowStart, lte: now } },
  });
  const mins = 15;
  const avgThroughputPerMin = recentSent / Math.max(mins, 1);

  // ETA
  const remaining = total - sent;
  const etaMinutes =
    avgThroughputPerMin > 0 ? Math.ceil(remaining / avgThroughputPerMin) : null;
  const eta = etaMinutes ? addMinutes(now, etaMinutes) : null;

  // Calendar summary for the next 14 days: planned vs sent
  const today = startOfDay(now);
  const horizon = endOfDay(addMinutes(now, 60 * 24 * 14));

  const planned = await prisma.emailJob.findMany({
    where: {
      campaignId,
      status: "scheduled",
      sendAt: { gte: today, lte: horizon },
    },
    select: { sendAt: true },
  });

  const sentJobs = await prisma.emailJob.findMany({
    where: {
      campaignId,
      status: "sent",
      sentAt: { gte: today, lte: horizon },
    },
    select: { sentAt: true },
  });

  const byDate = (dates: Date[]) =>
    dates.reduce<Record<string, number>>((acc, d) => {
      const key = d.toISOString().slice(0, 10);
      acc[key] = (acc[key] ?? 0) + 1;
      return acc;
    }, {});

  const calendar = {
    planned: byDate(planned.map((j) => j.sendAt)),
    sent: byDate(sentJobs.map((j) => j.sentAt!)),
  };

  const settings = await prisma.campaignSettings.findUnique({
    where: { campaignId },
    select: { paused: true },
  });

  return NextResponse.json({
    totals: { total, sent, failed, scheduled, processing },
    nextSendAt: nextJob?.sendAt ?? null,
    lastSentAt: lastSent?.sentAt ?? null,
    avgThroughputPerMin,
    eta,
    calendar,
    paused: settings?.paused ?? false, // 👈 NEW
  });
}