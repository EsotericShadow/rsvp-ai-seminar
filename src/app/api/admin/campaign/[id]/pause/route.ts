import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

type Params = { params: { id: string } };

export async function POST(_req: Request, { params }: Params) {
  const campaignId = params.id;

  await prisma.campaignSettings.upsert({
    where: { campaignId },
    update: { paused: true },
    create: {
      campaignId,
      windows: [{ start: "09:30", end: "11:45" }, { start: "13:15", end: "16:30" }],
      throttlePerMinute: 60,
      maxConcurrent: 50,
      paused: true,
    },
  });

  return NextResponse.json({ ok: true, paused: true });
}