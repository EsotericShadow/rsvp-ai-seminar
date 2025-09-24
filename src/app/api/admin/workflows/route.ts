import { NextRequest, NextResponse } from 'next/server'
import { requireAdminSession } from '@/lib/adminSession'
import prisma from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const auth = requireAdminSession()
  if ('response' in auth) return auth.response

  try {
    const workflows = await prisma.workflowRule.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        executions: {
          orderBy: { startedAt: 'desc' },
          take: 5
        }
      }
    })

    return NextResponse.json({ workflows })
  } catch (error) {
    console.error('Error fetching workflows:', error)
    return NextResponse.json({ error: 'Failed to fetch workflows' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const auth = requireAdminSession()
  if ('response' in auth) return auth.response

  try {
    const body = await request.json()
    const { name, description, triggerType, triggerConfig, conditions, actions, campaignId } = body

    const workflow = await prisma.workflowRule.create({
      data: {
        name,
        description,
        triggerType,
        triggerConfig: triggerConfig || {},
        conditions: conditions || [],
        actions: actions || [],
        campaignId
      }
    })

    return NextResponse.json({ workflow })
  } catch (error) {
    console.error('Error creating workflow:', error)
    return NextResponse.json({ error: 'Failed to create workflow' }, { status: 500 })
  }
}



