import { NextRequest, NextResponse } from 'next/server'
import { requireAdminSession } from '@/lib/adminSession'
import prisma from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const auth = requireAdminSession()
  if ('response' in auth) return auth.response

  const { searchParams } = new URL(request.url)
  const q = searchParams.get('q')
  const limit = parseInt(searchParams.get('limit') || '100')

  try {
    // Build search filters
    const visitWhere = q
      ? {
          OR: [
            { visitorId: { contains: q } },
            { sessionId: { contains: q } },
            { eid: { contains: q } },
            { utmCampaign: { contains: q, mode: 'insensitive' as const } },
            { utmSource: { contains: q, mode: 'insensitive' as const } },
            { referrer: { contains: q, mode: 'insensitive' as const } },
          ],
        }
      : {}

    // Fetch visits with business information
    const visits = await prisma.visit.findMany({
      where: visitWhere,
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        id: true,
        createdAt: true,
        visitorId: true,
        sessionId: true,
        path: true,
        query: true,
        referrer: true,
        eid: true,
        utmSource: true,
        utmMedium: true,
        utmCampaign: true,
        utmTerm: true,
        utmContent: true,
        userAgent: true,
        language: true,
        country: true,
        region: true,
        city: true,
        platform: true,
        device: true,
        browser: true,
        timeOnPageMs: true,
        scrollDepth: true,
        screenW: true,
        screenH: true,
        viewportW: true,
        viewportH: true,
      },
    })

    // Extract business IDs from eid field (format: biz_123)
    const businessIds = visits
      .map(visit => {
        if (visit.eid && visit.eid.startsWith('biz_')) {
          return visit.eid.slice(4) // Remove 'biz_' prefix
        }
        return null
      })
      .filter(Boolean) as string[]

    // Fetch business information for visits that have business tracking
    const businesses = businessIds.length > 0 
      ? await prisma.audienceMember.findMany({
          where: {
            businessId: { in: businessIds }
          },
          select: {
            businessId: true,
            businessName: true,
            primaryEmail: true,
            group: {
              select: {
                id: true,
                name: true,
                color: true
              }
            }
          }
        })
      : []

    // Create a map for quick business lookup
    const businessMap = new Map(
      businesses.map(business => [business.businessId, business])
    )

    // Enhance visits with business information
    const enhancedVisits = visits.map(visit => {
      let businessInfo = null
      
      if (visit.eid && visit.eid.startsWith('biz_')) {
        const businessId = visit.eid.slice(4)
        businessInfo = businessMap.get(businessId)
      }

      return {
        ...visit,
        business: businessInfo
      }
    })

    // Fetch campaign send information for tracking link performance
    const campaignSends = await prisma.campaignSend.findMany({
      where: {
        businessId: { in: businessIds }
      },
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
        schedule: {
          select: {
            id: true,
            name: true,
            campaign: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      },
      orderBy: { sentAt: 'desc' }
    })

    // Create a map for campaign send lookup
    const campaignSendMap = new Map(
      campaignSends.map(send => [send.businessId, send])
    )

    // Add campaign send information to visits
    const finalVisits = enhancedVisits.map(visit => {
      let campaignSend = null
      
      if (visit.business) {
        campaignSend = campaignSendMap.get(visit.business.businessId)
      }

      return {
        ...visit,
        campaignSend
      }
    })

    return NextResponse.json({
      visits: finalVisits,
      total: visits.length,
      businessCount: businessIds.length
    })

  } catch (error) {
    console.error('Error fetching visitor analytics:', error)
    return NextResponse.json({ error: 'Failed to fetch visitor analytics' }, { status: 500 })
  }
}





