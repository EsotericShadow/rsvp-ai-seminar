import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";

const Query = z.object({
  status: z.enum(["scheduled", "processing", "sent", "failed"]).optional(),
  take: z.coerce.number().int().min(1).max(100).default(25),
  cursor: z.string().optional(), // cursor = job.id
  search: z.string().optional(),  // filter by recipientEmail contains
});

type Params = { params: { id: string } };

export async function GET(req: Request, { params }: Params) {
  const campaignId = params.id;
  const url = new URL(req.url);
  const parsed = Query.parse({
    status: url.searchParams.get("status") ?? undefined,
    take: url.searchParams.get("take") ?? undefined,
    cursor: url.searchParams.get("cursor") ?? undefined,
    search: url.searchParams.get("search") ?? undefined,
  });

  const where: any = { campaignId };
  if (parsed.status) where.status = parsed.status;
  if (parsed.search) where.recipientEmail = { contains: parsed.search, mode: "insensitive" };

  const jobs = await prisma.emailJob.findMany({
    where,
    orderBy: { createdAt: "asc" },
    take: parsed.take + 1,
    ...(parsed.cursor ? { cursor: { id: parsed.cursor }, skip: 1 } : {}),
    select: {
      id: true,
      recipientEmail: true,
      sendAt: true,
      status: true,
      attempts: true,
      error: true,
      sentAt: true,
      processingStartedAt: true,
      providerMessageId: true,
      createdAt: true,
    },
  });

  let nextCursor: string | null = null;
  if (jobs.length > parsed.take) {
    const nextItem = jobs.pop()!;
    nextCursor = nextItem.id;
  }

  return NextResponse.json({ items: jobs, nextCursor });
}