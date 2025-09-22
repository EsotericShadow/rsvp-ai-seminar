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

  const { businessId, groupId } = body

  if (!businessId || !groupId) {
    return NextResponse.json({ error: 'Business ID and group ID are required' }, { status: 400 })
  }

  try {
    // Check if the business exists by looking for any existing member with this businessId
    const sourceMember = await prisma.audienceMember.findFirst({
      where: { businessId: businessId }
    })

    if (!sourceMember) {
      return NextResponse.json({ error: 'Business not found in any group' }, { status: 404 })
    }

    // Check if the group exists
    const group = await prisma.audienceGroup.findUnique({
      where: { id: groupId }
    })

    if (!group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 })
    }

    // Check if the business is already in this group
    const existingMemberInGroup = await prisma.audienceMember.findFirst({
      where: {
        businessId: businessId,
        groupId: groupId
      }
    })

    if (existingMemberInGroup) {
      return NextResponse.json({ error: 'Business is already in this group' }, { status: 400 })
    }

    // Check if the business is in any other group
    const otherGroupMember = await prisma.audienceMember.findFirst({
      where: {
        businessId: businessId,
        groupId: { not: groupId }
      },
      include: { group: true }
    })

    if (otherGroupMember) {
      return NextResponse.json({ 
        error: `Business is already in group "${otherGroupMember.group.name}". Use move functionality instead.` 
      }, { status: 400 })
    }

    // Add the business to the group using the existing member's data
    const newMember = await prisma.audienceMember.create({
      data: {
        businessId: businessId,
        groupId: groupId,
        businessName: sourceMember.businessName,
        primaryEmail: sourceMember.primaryEmail,
        secondaryEmail: sourceMember.secondaryEmail,
        tagsSnapshot: sourceMember.tagsSnapshot,
        meta: sourceMember.meta as any
      },
      include: { group: true }
    })

    return NextResponse.json({
      success: true,
      member: newMember,
      message: `Business added to group "${group.name}"`
    })

  } catch (error) {
    console.error('Error adding member to group:', error)
    return NextResponse.json({ error: 'Failed to add member to group' }, { status: 500 })
  }
}
