import { NextRequest, NextResponse } from 'next/server'
import { requireAdminSession } from '@/lib/adminSession'
import prisma from '@/lib/prisma'

export async function POST(request: NextRequest) {
  const auth = requireAdminSession()
  if ('response' in auth) return auth.response

  let body: any
  try {
    body = await request.json()
  } catch (error) {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { memberId, targetGroupId } = body

  if (!memberId || !targetGroupId) {
    return NextResponse.json({ error: 'Member ID and target group ID are required' }, { status: 400 })
  }

  try {
    // Verify the member exists
    const member = await prisma.audienceMember.findUnique({
      where: { id: memberId },
      include: { group: true }
    })

    if (!member) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 })
    }

    // Verify the target group exists
    const targetGroup = await prisma.audienceGroup.findUnique({
      where: { id: targetGroupId }
    })

    if (!targetGroup) {
      return NextResponse.json({ error: 'Target group not found' }, { status: 404 })
    }

    // Check if member is already in the target group
    if (member.groupId === targetGroupId) {
      return NextResponse.json({ error: 'Member is already in the target group' }, { status: 400 })
    }

    // Check if a member with the same businessId already exists in the target group
    const existingMember = await prisma.audienceMember.findFirst({
      where: {
        groupId: targetGroupId,
        businessId: member.businessId
      }
    })

    if (existingMember) {
      return NextResponse.json({ 
        error: `A member with business ID ${member.businessId} already exists in the target group` 
      }, { status: 400 })
    }

    // Move the member to the target group
    const updatedMember = await prisma.audienceMember.update({
      where: { id: memberId },
      data: { groupId: targetGroupId },
      include: { group: true }
    })

    return NextResponse.json({ 
      success: true, 
      member: updatedMember,
      message: `Member moved from "${member.group.name}" to "${targetGroup.name}"`
    })

  } catch (error) {
    console.error('Error moving member:', error)
    return NextResponse.json({ error: 'Failed to move member' }, { status: 500 })
  }
}
