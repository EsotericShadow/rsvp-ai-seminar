import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";

type Params = { params: { id: string } };

const WindowSchema = z.object({
  start: z.string().regex(/^\d{2}:\d{2}$/), // "HH:MM"
  end: z.string().regex(/^\d{2}:\d{2}$/),
});
const ScheduleSchema = z.object({
  windows: z.array(WindowSchema).min(1),
  throttlePerMinute: z.number().int().min(1).max(10000),
  maxConcurrent: z.number().int().min(1).max(10000),
  perDomain: z.record(z.any()).optional(),
  quietHours: z.array(WindowSchema).optional(),
});

function toMinutes(hhmm: string) {
  const [hh, mm] = hhmm.split(":").map(Number);
  return hh * 60 + mm;
}
function fromMinutes(mins: number) {
  const h = Math.floor(mins / 60)
    .toString()
    .padStart(2, "0");
  const m = (mins % 60).toString().padStart(2, "0");
  return `${h}:${m}`;
}

function nextSlotAfter(base: Date, dayHHMM: string) {
  const d = new Date(base);
  const [hh, mm] = dayHHMM.split(":").map(Number);
  d.setHours(hh, mm, 0, 0);
  if (d < base) d.setDate(d.getDate() + 1);
  return d;
}

export async function GET(_req: Request, { params }: Params) {
  const campaignId = params.id;

  const settings =
    (await prisma.campaignSettings.findUnique({ where: { campaignId } })) ??
    ({
      campaignId,
      windows: [{ start: "09:30", end: "11:45" }, { start: "13:15", end: "16:30" }],
      throttlePerMinute: 60,
      maxConcurrent: 50,
      perDomain: null,
      quietHours: null,
      updatedAt: new Date(),
    } as any);

  // derive simple calendar preview (planned totals next 7d)
  const now = new Date();
  const in7d = new Date(now.getTime() + 7 * 86400000);
  const planned = await prisma.emailJob.count({
    where: {
      campaignId,
      status: "scheduled",
      sendAt: { gte: now, lte: in7d },
    },
  });

  return NextResponse.json({ settings, preview: { plannedNext7Days: planned } });
}

export async function PATCH(req: Request, { params }: Params) {
  const campaignId = params.id;
  const body = await req.json();
  const input = ScheduleSchema.parse(body);

  // 1) Upsert settings
  const saved = await prisma.campaignSettings.upsert({
    where: { campaignId },
    update: {
      windows: input.windows,
      throttlePerMinute: input.throttlePerMinute,
      maxConcurrent: input.maxConcurrent,
      perDomain: input.perDomain,
      quietHours: input.quietHours,
    },
    create: {
      campaignId,
      windows: input.windows,
      throttlePerMinute: input.throttlePerMinute,
      maxConcurrent: input.maxConcurrent,
      perDomain: input.perDomain,
      quietHours: input.quietHours,
    },
  });

  // 2) Re-distribute pending jobs across new windows respecting throttle
  const pending = await prisma.emailJob.findMany({
    where: { campaignId, status: "scheduled" },
    orderBy: { sendAt: "asc" }, // keep relative order
    select: { id: true },
  });

  // Build a time generator that walks windows day by day creating slots
  const windows = input.windows
    .map((w) => ({ s: toMinutes(w.start), e: toMinutes(w.end) }))
    .filter((w) => w.e > w.s)
    .sort((a, b) => a.s - b.s);

  const tpm = input.throttlePerMinute;

  function* slotGen(from: Date) {
    // start from the soonest window start >= now
    let cursor = new Date(from);
    // normalize to first window boundary in the future
    // simple approach: try each window in order; pick earliest slot >= now
    let day = new Date(cursor);
    day.setHours(0, 0, 0, 0);

    while (true) {
      for (const w of windows) {
        const startHHMM = fromMinutes(w.s);
        const slotStart = nextSlotAfter(cursor, startHHMM);

        // Walk minute by minute, tpm items per minute
        let minuteCursor = new Date(slotStart);
        const windowEndMinutes = w.e;

        while (true) {
          const hhmm = `${minuteCursor.getHours().toString().padStart(2, "0")}:${minuteCursor
            .getMinutes()
            .toString()
            .padStart(2, "0")}`;
          const mins = toMinutes(hhmm);
          if (mins >= windowEndMinutes) break;

          for (let i = 0; i < tpm; i++) {
            yield new Date(minuteCursor);
          }
          // next minute
          minuteCursor = new Date(minuteCursor.getTime() + 60000);
        }
      }
      // next day
      day = new Date(day.getTime() + 86400000);
      cursor = new Date(day);
      cursor.setHours(0, 0, 0, 0);
    }
  }

  const now = new Date();
  const gen = slotGen(now);

  // Batch updates for efficiency
  const updates: Promise<any>[] = [];
  for (const p of pending) {
    const slot = gen.next().value as Date;
    updates.push(
      prisma.emailJob.update({
        where: { id: p.id },
        data: { sendAt: slot },
      })
    );
  }
  if (updates.length) await Promise.all(updates);

  // Log an event (optional)
  await prisma.emailEvent.create({
    data: {
      jobId: "schedule", // if you have a campaignEvent table, use that—this is a lightweight marker
      type: "schedule_updated",
      meta: { campaignId, count: pending.length, windows: input.windows, tpm: input.throttlePerMinute },
    },
  });

  return NextResponse.json({ ok: true, reassigned: pending.length, settings: saved });
}