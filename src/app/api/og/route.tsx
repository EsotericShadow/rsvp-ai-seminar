import { ImageResponse } from "next/og"

export const runtime = "edge"
export const alt = "AI in Northern BC: Business Readiness Seminar"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export async function GET() {
  const brandSage = "#A0AD92"
  const brandInk = "#30332E"

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "56px",
          background: `linear-gradient(180deg, rgba(0,0,0,0.9), rgba(0,0,0,0.6)), radial-gradient(1200px 600px at 100% 0%, ${brandSage}22, transparent)`,
          color: "white",
          fontFamily: "system-ui, Inter, Segoe UI, Roboto",
          position: "relative",
        }}
      >
        <div style={{ fontSize: 24, opacity: 0.8, letterSpacing: 4, textTransform: "uppercase" }}>
          Evergreen Web Solutions
        </div>

        <div style={{ display: "flex", gap: 28, alignItems: "center" }}>
          <div style={{ width: 10, height: 10, borderRadius: 999, background: brandSage, flexShrink: 0 }} />
          <div style={{ fontSize: 64, lineHeight: 1.1, fontWeight: 700, maxWidth: 900 }}>
            AI in Northern BC: Business Readiness Seminar
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div style={{ fontSize: 28, opacity: 0.9 }}>
            Thu, Oct 23 • Doors 6:00 PM <span style={{ opacity: 0.6 }}>• Sunshine Inn Terrace</span>
          </div>
          <div
            style={{
              border: `2px solid ${brandSage}`,
              color: brandSage,
              padding: "10px 18px",
              borderRadius: 999,
              fontSize: 24,
              fontWeight: 600,
            }}
          >
            RSVP Free
          </div>
        </div>

        <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 8, background: brandInk }} />
      </div>
    ),
    size
  )
}
