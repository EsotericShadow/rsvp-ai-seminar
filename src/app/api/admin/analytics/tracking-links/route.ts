import { NextRequest, NextResponse } from 'next/server'
import { requireAdminSession } from '@/lib/adminSession'
import prisma from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const auth = requireAdminSession()
  if ('response' in auth) return auth.response

  const { searchParams } = new URL(request.url)
  const q = searchParams.get('q')
  const groupId = searchParams.get('groupId')
  const campaignId = searchParams.get('campaignId')
  const status = searchParams.get('status')
  const limit = parseInt(searchParams.get('limit') || '100')

  try {
    // Build filters
    const where: any = {}

    if (q) {
      where.OR = [
        { businessName: { contains: q, mode: 'insensitive' } },
        { email: { contains: q, mode: 'insensitive' } },
        { inviteToken: { contains: q } },
        { inviteLink: { contains: q } }
      ]
    }

    if (groupId) {
      where.groupId = groupId
    }

    if (campaignId) {
      where.schedule = {
        campaignId: campaignId
      }
    }

    if (status) {
      where.status = status
    }

    // Fetch campaign sends with related data
    const campaignSends = await prisma.campaignSend.findMany({
      where,
      orderBy: { sentAt: 'desc' },
      take: limit,
      select: {
        id: true,
        businessId: true,
        businessName: true,
        email: true,
        inviteToken: true,
        inviteLink: true,
        status: true,
        sentAt: true,
        openedAt: true,
        visitedAt: true,
        rsvpAt: true,
        error: true,
        meta: true,
        schedule: {
          select: {
            id: true,
            name: true,
            campaign: {
              select: {
                id: true,
                name: true
              }
            },
            group: {
              select: {
                id: true,
                name: true,
                color: true
              }
            }
          }
        }
      }
    })

    // Calculate performance metrics
    const performanceMetrics = {
      total: campaignSends.length,
      sent: campaignSends.filter(s => s.sentAt).length,
      opened: campaignSends.filter(s => s.openedAt).length,
      visited: campaignSends.filter(s => s.visitedAt).length,
      rsvp: campaignSends.filter(s => s.rsvpAt).length,
      failed: campaignSends.filter(s => s.status === 'FAILED').length,
      pending: campaignSends.filter(s => s.status === 'PENDING').length,
    }

    // Calculate rates
    const openRate = performanceMetrics.sent > 0 
      ? (performanceMetrics.opened / performanceMetrics.sent) * 100 
      : 0
    const visitRate = performanceMetrics.sent > 0 
      ? (performanceMetrics.visited / performanceMetrics.sent) * 100 
      : 0
    const rsvpRate = performanceMetrics.sent > 0 
      ? (performanceMetrics.rsvp / performanceMetrics.sent) * 100 
      : 0

    // Group by campaign for summary
    const campaignSummary = campaignSends.reduce((acc, send) => {
      if (!send.schedule?.campaign) return acc
      
      const campaignId = send.schedule.campaign.id
      const campaignName = send.schedule.campaign.name
      
      if (!acc[campaignId]) {
        acc[campaignId] = {
          campaignId,
          campaignName,
          total: 0,
          sent: 0,
          opened: 0,
          visited: 0,
          rsvp: 0,
          failed: 0,
          pending: 0
        }
      }
      
      acc[campaignId].total++
      if (send.sentAt) acc[campaignId].sent++
      if (send.openedAt) acc[campaignId].opened++
      if (send.visitedAt) acc[campaignId].visited++
      if (send.rsvpAt) acc[campaignId].rsvp++
      if (send.status === 'FAILED') acc[campaignId].failed++
      if (send.status === 'PENDING') acc[campaignId].pending++
      
      return acc
    }, {} as Record<string, any>)

    // Group by audience group for summary
    const groupSummary = campaignSends.reduce((acc, send) => {
      if (!send.schedule?.group) return acc
      
      const groupId = send.schedule.group.id
      const groupName = send.schedule.group.name
      
      if (!acc[groupId]) {
        acc[groupId] = {
          groupId,
          groupName,
          groupColor: send.schedule.group.color,
          total: 0,
          sent: 0,
          opened: 0,
          visited: 0,
          rsvp: 0,
          failed: 0,
          pending: 0
        }
      }
      
      acc[groupId].total++
      if (send.sentAt) acc[groupId].sent++
      if (send.openedAt) acc[groupId].opened++
      if (send.visitedAt) acc[groupId].visited++
      if (send.rsvpAt) acc[groupId].rsvp++
      if (send.status === 'FAILED') acc[groupId].failed++
      if (send.status === 'PENDING') acc[groupId].pending++
      
      return acc
    }, {} as Record<string, any>)

    return NextResponse.json({
      trackingLinks: campaignSends,
      performance: {
        ...performanceMetrics,
        openRate: Math.round(openRate * 100) / 100,
        visitRate: Math.round(visitRate * 100) / 100,
        rsvpRate: Math.round(rsvpRate * 100) / 100,
      },
      campaignSummary: Object.values(campaignSummary),
      groupSummary: Object.values(groupSummary)
    })

  } catch (error) {
    console.error('Error fetching tracking links analytics:', error)
    return NextResponse.json({ error: 'Failed to fetch tracking links analytics' }, { status: 500 })
  }
}
