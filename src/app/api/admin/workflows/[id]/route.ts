import { NextRequest, NextResponse } from 'next/server'
import { requireAdminSession } from '@/lib/adminSession'
import prisma from '@/lib/prisma'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = requireAdminSession()
  if ('response' in auth) return auth.response

  try {
    const body = await request.json()
    const { name, description, triggerType, triggerConfig, conditions, actions, isEnabled } = body

    const workflow = await prisma.workflowRule.update({
      where: { id: params.id },
      data: {
        name,
        description,
        triggerType,
        triggerConfig: triggerConfig || {},
        conditions: conditions || [],
        actions: actions || [],
        isEnabled,
        updatedAt: new Date()
      }
    })

    return NextResponse.json({ workflow })
  } catch (error) {
    console.error('Error updating workflow:', error)
    return NextResponse.json({ error: 'Failed to update workflow' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = requireAdminSession()
  if ('response' in auth) return auth.response

  try {
    await prisma.workflowRule.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting workflow:', error)
    return NextResponse.json({ error: 'Failed to delete workflow' }, { status: 500 })
  }
}


