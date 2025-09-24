import { NextRequest, NextResponse } from 'next/server'
import { requireAdminSession } from '@/lib/adminSession'
import prisma from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = requireAdminSession()
  if ('response' in auth) return auth.response

  try {
    const body = await request.json()
    const { isEnabled } = body

    const workflow = await prisma.workflowRule.update({
      where: { id: params.id },
      data: {
        isEnabled,
        updatedAt: new Date()
      }
    })

    return NextResponse.json({ workflow })
  } catch (error) {
    console.error('Error toggling workflow:', error)
    return NextResponse.json({ error: 'Failed to toggle workflow' }, { status: 500 })
  }
}


