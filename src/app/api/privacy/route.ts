import { NextResponse } from "next/server";

export async function GET() {
  const privacyPolicyUrl = process.env.PRIVACY_POLICY_URL;

  if (!privacyPolicyUrl) {
    return NextResponse.json({ error: "Privacy policy URL is not configured." }, { status: 500 });
  }

  const res = await fetch(privacyPolicyUrl,
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
