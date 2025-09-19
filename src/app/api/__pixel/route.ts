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

  // You can log an "open" Visit or Event here if you want
  // await prisma.event.create({ data: { type: 'email_open', eid, campaign, ... } })

  return new NextResponse(PIXEL, {
    headers: {
      'Content-Type': 'image/gif',
      'Content-Length': String(PIXEL.length),
      'Cache-Control': 'no-store, max-age=0',
    },
  })
}
