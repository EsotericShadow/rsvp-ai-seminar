import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const { email } = await req.json()
    if (!email) {
      return NextResponse.json({ message: 'Email is required.' }, { status: 400 })
    }

    const member = await prisma.audienceMember.findFirst({
      where: { primaryEmail: email },
      select: { id: true, unsubscribed: true },
    })

    if (!member) {
      // Soft-success to avoid leaking list membership
      return NextResponse.json({ message: 'Successfully unsubscribed.' }, { status: 200 })
    }

    if (member.unsubscribed) {
      return NextResponse.json({ message: 'Already unsubscribed.' }, { status: 200 })
    }

    await prisma.audienceMember.update({
      where: { id: member.id },
      data: { unsubscribed: true },
    })

    return NextResponse.json({ message: 'Successfully unsubscribed.' }, { status: 200 })
  } catch (err) {
    console.error('Unsubscribe error:', err)
    return NextResponse.json({ message: 'An error occurred during unsubscribe.' }, { status: 500 })
  }
}