import { NextRequest, NextResponse } from 'next/server'

import { requireAdminSession } from '@/lib/adminSession'
import { createAudienceGroup, listGroups, updateAudienceGroup } from '@/lib/campaigns'

export async function GET() {
  const auth = requireAdminSession()
  if ('response' in auth) return auth.response

  const groups = await listGroups()
  return NextResponse.json({ groups })
}

export async function POST(request: NextRequest) {
  const auth = requireAdminSession()
  if ('response' in auth) return auth.response

  let body: any
  try {
    body = await request.json()
  } catch (error) {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  if (!body?.name || !Array.isArray(body.members) || body.members.length === 0) {
    return NextResponse.json({ error: 'Group name and at least one member are required' }, { status: 400 })
  }

  const group = await createAudienceGroup({
    name: String(body.name),
    description: body.description ? String(body.description) : undefined,
    criteria: body.criteria ?? undefined,
    members: body.members.map((member: any) => ({
      businessId: String(member.businessId),
      businessName: member.businessName ? String(member.businessName) : undefined,
      primaryEmail: String(member.primaryEmail),
      secondaryEmail: member.secondaryEmail ? String(member.secondaryEmail) : undefined,
      inviteToken: member.inviteToken ? String(member.inviteToken) : undefined,
      tags: Array.isArray(member.tags) ? member.tags.map(String) : undefined,
      meta: member.meta ?? undefined,
    })),
  })

  return NextResponse.json({ group }, { status: 201 })
}

export async function PUT(request: NextRequest) {
  const auth = requireAdminSession()
  if ('response' in auth) return auth.response

  let body: any
  try {
    body = await request.json()
  } catch (error) {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  if (!body?.id || !Array.isArray(body.members)) {
    return NextResponse.json({ error: 'Group id and members array are required' }, { status: 400 })
  }

  const group = await updateAudienceGroup(String(body.id), {
    name: body.name !== undefined ? String(body.name) : undefined,
    description: body.description !== undefined ? (body.description ? String(body.description) : null) : undefined,
    criteria: body.criteria ?? undefined,
    members: body.members.map((member: any) => ({
      businessId: String(member.businessId),
      businessName: member.businessName ? String(member.businessName) : undefined,
      primaryEmail: String(member.primaryEmail),
      secondaryEmail: member.secondaryEmail ? String(member.secondaryEmail) : undefined,
      inviteToken: member.inviteToken ? String(member.inviteToken) : undefined,
      tags: Array.isArray(member.tags) ? member.tags.map(String) : undefined,
      meta: member.meta ?? undefined,
    })),
  })

  return NextResponse.json({ group })
}
