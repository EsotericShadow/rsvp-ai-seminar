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

  const { businessId, groupId, businessData } = body

  if (!businessId || !groupId) {
    return NextResponse.json({ error: 'Business ID and group ID are required' }, { status: 400 })
  }

  try {
    // Check if the business exists in any group (to get source data if it exists)
    const sourceMember = await prisma.audienceMember.findFirst({
      where: { businessId: businessId }
    })

    // If business is not in any group, we need to get it from the businesses API
    // For now, we'll allow adding even if not in any group (the frontend should handle this)

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

    // Add the business to the group
    const newMember = await prisma.audienceMember.create({
      data: {
        businessId: businessId,
        groupId: groupId,
        businessName: sourceMember?.businessName || businessData?.name || 'Unknown Business',
        primaryEmail: sourceMember?.primaryEmail || businessData?.primaryEmail || '',
        secondaryEmail: sourceMember?.secondaryEmail || businessData?.alternateEmail || null,
        tagsSnapshot: sourceMember?.tagsSnapshot || businessData?.tags || [],
        meta: sourceMember?.meta as any || {}
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
