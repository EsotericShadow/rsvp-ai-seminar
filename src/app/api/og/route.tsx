import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const title = searchParams.get('title') || 'AI in Northern BC: Information Session'
    const subtitle = searchParams.get('subtitle') || 'Terrace, BC • October 23, 2025'
    const type = searchParams.get('type') || 'event'

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#ffffff',
            backgroundImage: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)',
          }}
        >
          {/* Header */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              padding: '60px',
            }}
          >
            {/* Logo/Brand */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '40px',
              }}
            >
              <div
                style={{
                  fontSize: '32px',
                  fontWeight: 'bold',
                  color: '#10b981',
                  marginRight: '16px',
                }}
              >
                🌲
              </div>
              <div
                style={{
                  fontSize: '24px',
                  fontWeight: '600',
                  color: '#374151',
                }}
              >
                Evergreen Web Solutions
              </div>
            </div>

            {/* Main Title */}
            <div
              style={{
                fontSize: title.length > 50 ? '48px' : '56px',
                fontWeight: 'bold',
                color: '#111827',
                textAlign: 'center',
                lineHeight: 1.2,
                maxWidth: '900px',
                marginBottom: '24px',
              }}
            >
              {title}
            </div>

            {/* Subtitle */}
            <div
              style={{
                fontSize: '28px',
                color: '#10b981',
                textAlign: 'center',
                fontWeight: '600',
                marginBottom: '40px',
              }}
            >
              {subtitle}
            </div>

            {/* Event Details */}
            {type === 'event' && (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  backgroundColor: '#ffffff',
                  borderRadius: '16px',
                  padding: '32px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  border: '1px solid #e5e7eb',
                }}
              >
                <div
                  style={{
                    fontSize: '20px',
                    color: '#374151',
                    marginBottom: '16px',
                    fontWeight: '600',
                  }}
                >
                  📅 Thursday, October 23, 2025
                </div>
                <div
                  style={{
                    fontSize: '20px',
                    color: '#374151',
                    marginBottom: '16px',
                    fontWeight: '600',
                  }}
                >
                  🏢 Sunshine Inn Terrace • Jasmine Room
                </div>
                <div
                  style={{
                    fontSize: '18px',
                    color: '#6b7280',
                    textAlign: 'center',
                    maxWidth: '600px',
                  }}
                >
                  Learn about AI automation, machine learning, and custom AI integrations for Northern BC businesses
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div
            style={{
              position: 'absolute',
              bottom: '40px',
              right: '60px',
              fontSize: '18px',
              color: '#6b7280',
              fontWeight: '500',
            }}
          >
            rsvp.evergreenwebsolutions.ca
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    )
  } catch (e: any) {
    console.log(`${e.message}`)
    return new Response(`Failed to generate the image`, {
      status: 500,
    })
  }
}