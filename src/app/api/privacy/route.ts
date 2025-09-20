import { NextResponse } from "next/server";

export async function GET() {
  const res = await fetch(process.env.PRIVACY_POLICY_URL!,
  {
    cache: "force-cache",
    // next: { revalidate: 3600 },
  });
  if (!res.ok) {
    return NextResponse.json({ error: "Failed to load policy" }, { status: res.status });
  }
  const data = await res.json();
  return NextResponse.json(data, { status: 200 });
}
