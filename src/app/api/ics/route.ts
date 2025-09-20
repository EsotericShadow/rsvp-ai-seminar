import { NextResponse } from "next/server"

// Optional: export const runtime = "edge"

function toICSDate(dateIso: string) {
  // ICS wants UTC in basic format YYYYMMDDTHHMMSSZ
  const d = new Date(dateIso)
  const pad = (n: number) => String(n).padStart(2, "0")
  return (
    d.getUTCFullYear().toString() +
    pad(d.getUTCMonth() + 1) +
    pad(d.getUTCDate()) +
    "T" +
    pad(d.getUTCHours()) +
    pad(d.getUTCMinutes()) +
    pad(d.getUTCSeconds()) +
    "Z"
  )
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)

  const title = searchParams.get("title") ?? "Event"
  const start = searchParams.get("start") // ISO-8601
  const end = searchParams.get("end") // ISO-8601
  const location = searchParams.get("location") ?? ""
  const desc = searchParams.get("desc") ?? ""

  if (!start || !end) {
    return new NextResponse("Missing start or end", { status: 400 })
  }

  const dtStart = toICSDate(start)
  const dtEnd = toICSDate(end)
  const uid = `${dtStart}-${encodeURIComponent(title)} @evergreen`

  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Evergreen Web Solutions//Event//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${toICSDate(new Date().toISOString())}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${title}`,
    location ? `LOCATION:${location}` : "",
    desc ? `DESCRIPTION:${desc.replace(/\n/g, "\\n")}` : "",
    "END:VEVENT",
    "END:VCALENDAR",
  ]
    .filter(Boolean)
    .join("\r\n")

  return new NextResponse(ics, {
    status: 200,
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="${title
        .toLowerCase()
        .replace(/\s+/g, "-")}.ics"`,
      "Cache-Control": "no-store",
    },
  })
}