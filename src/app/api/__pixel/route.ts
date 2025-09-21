import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

const PIXEL = Buffer.from(
  '47494638396101000100800000ffffff00000021f90401000001002c00000000010001000002024401003b',
  'hex'
)

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const eid = searchParams.get('eid') || undefined
  const campaign = searchParams.get('campaign') || undefined
  const inviteToken = searchParams.get('token') || undefined

  try {
    // Record email open in Visit table
    if (eid || inviteToken) {
      await prisma.visit.create({
        data: {
          visitorId: 'email_pixel',
          sessionId: 'email_pixel',
          path: '/api/__pixel',
          query: req.url.split('?')[1] || '',
          eid,
          utmCampaign: campaign,
          userAgent: req.headers.get('user-agent') || undefined,
          device: 'email_client',
          platform: 'email',
        },
      })
    }

    // Update CampaignSend openedAt if we have inviteToken
    if (inviteToken) {
      await prisma.campaignSend.updateMany({
        where: { inviteToken },
        data: { openedAt: new Date() },
      })
    }
  } catch (error) {
    // Stay silent on errors to not break email rendering
    console.error('Email pixel tracking error:', error)
  }

  return new NextResponse(PIXEL, {
    headers: {
      'Content-Type': 'image/gif',
      'Content-Length': String(PIXEL.length),
      'Cache-Control': 'no-store, max-age=0',
    },
  })
}
