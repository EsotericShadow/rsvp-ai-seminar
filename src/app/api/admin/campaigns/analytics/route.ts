import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { subDays, startOfDay, endOfDay } from "date-fns";

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const campaignId = url.searchParams.get('campaignId');
    const days = parseInt(url.searchParams.get('days') || '30');
    const startDate = url.searchParams.get('startDate');
    const endDate = url.searchParams.get('endDate');

    // Date range
    const now = new Date();
    const rangeStart = startDate ? new Date(startDate) : subDays(now, days);
    const rangeEnd = endDate ? new Date(endDate) : now;

    // Base queries
    const whereClause = campaignId 
      ? { campaignId, sentAt: { gte: rangeStart, lte: rangeEnd } }
      : { sentAt: { gte: rangeStart, lte: rangeEnd } };

    const campaignWhereClause = campaignId 
      ? { campaignId }
      : {};

    // 1. OVERALL CAMPAIGN METRICS
    const [totalJobs, sentJobs, failedJobs, scheduledJobs, processingJobs] = await Promise.all([
      prisma.emailJob.count({ where: campaignWhereClause }).catch(() => 0),
      prisma.emailJob.count({ where: { ...campaignWhereClause, status: "sent" } }).catch(() => 0),
      prisma.emailJob.count({ where: { ...campaignWhereClause, status: "failed" } }).catch(() => 0),
      prisma.emailJob.count({ where: { ...campaignWhereClause, status: "scheduled" } }).catch(() => 0),
      prisma.emailJob.count({ where: { ...campaignWhereClause, status: "processing" } }).catch(() => 0),
    ]);

    // 2. EMAIL EVENTS ANALYTICS
    const emailEvents = await prisma.emailEvent.findMany({
      where: {
        job: campaignWhereClause,
        createdAt: { gte: rangeStart, lte: rangeEnd }
      },
      include: {
        job: {
          select: {
            campaignId: true,
            recipientEmail: true,
            sentAt: true,
            status: true
          }
        }
      }
    }).catch(() => []);

    // Calculate email engagement metrics
    const opens = emailEvents.filter(e => e.type === 'opened');
    const clicks = emailEvents.filter(e => e.type === 'clicked');
    const bounces = emailEvents.filter(e => e.type === 'bounce');
    const complaints = emailEvents.filter(e => e.type === 'complaint');

    const openRate = sentJobs > 0 ? (opens.length / sentJobs) * 100 : 0;
    const clickRate = sentJobs > 0 ? (clicks.length / sentJobs) * 100 : 0;
    const bounceRate = sentJobs > 0 ? (bounces.length / sentJobs) * 100 : 0;
    const complaintRate = sentJobs > 0 ? (complaints.length / sentJobs) * 100 : 0;
    const ctrRate = opens.length > 0 ? (clicks.length / opens.length) * 100 : 0; // Click-through rate from opens

    // 3. RSVP CONVERSION METRICS
    const campaignSends = await prisma.campaignSend.findMany({
      where: {
        ...campaignWhereClause,
        sentAt: { gte: rangeStart, lte: rangeEnd }
      },
      select: {
        id: true,
        businessId: true,
        email: true,
        sentAt: true,
        openedAt: true,
        visitedAt: true,
        rsvpAt: true,
        status: true,
        schedule: {
          select: {
            campaignId: true,
            templateId: true,
            groupId: true
          }
        }
      }
    });

    const totalSends = campaignSends.length;
    const uniqueOpens = new Set(campaignSends.filter(s => s.openedAt).map(s => s.businessId)).size;
    const uniqueClicks = new Set(campaignSends.filter(s => s.visitedAt).map(s => s.businessId)).size;
    const uniqueRSVPs = new Set(campaignSends.filter(s => s.rsvpAt).map(s => s.businessId)).size;

    const emailToOpenRate = totalSends > 0 ? (uniqueOpens / totalSends) * 100 : 0;
    const emailToClickRate = totalSends > 0 ? (uniqueClicks / totalSends) * 100 : 0;
    const emailToRSVPRate = totalSends > 0 ? (uniqueRSVPs / totalSends) * 100 : 0;
    const openToClickRate = uniqueOpens > 0 ? (uniqueClicks / uniqueOpens) * 100 : 0;
    const clickToRSVPRate = uniqueClicks > 0 ? (uniqueRSVPs / uniqueClicks) * 100 : 0;
    const openToRSVPRate = uniqueOpens > 0 ? (uniqueRSVPs / uniqueOpens) * 100 : 0;

    // 4. A/B/C TESTING ANALYTICS
    const templates = await prisma.campaignTemplate.findMany({
      where: {
        schedules: {
          some: campaignWhereClause
        }
      },
      select: {
        id: true,
        name: true,
        subject: true,
        schedules: {
          where: campaignWhereClause,
          select: {
            id: true,
            campaignId: true
          }
        }
      }
    });

    const abTestResults = await Promise.all(
      templates.map(async (template) => {
        const templateSends = await prisma.campaignSend.findMany({
          where: {
            templateId: template.id,
            ...campaignWhereClause,
            sentAt: { gte: rangeStart, lte: rangeEnd }
          }
        });

        const templateOpens = templateSends.filter(s => s.openedAt).length;
        const templateClicks = templateSends.filter(s => s.visitedAt).length;
        const templateRSVPs = templateSends.filter(s => s.rsvpAt).length;

        return {
          templateId: template.id,
          templateName: template.name,
          subject: template.subject,
          sends: templateSends.length,
          opens: templateOpens,
          clicks: templateClicks,
          rsvps: templateRSVPs,
          openRate: templateSends.length > 0 ? (templateOpens / templateSends.length) * 100 : 0,
          clickRate: templateSends.length > 0 ? (templateClicks / templateSends.length) * 100 : 0,
          rsvpRate: templateSends.length > 0 ? (templateRSVPs / templateSends.length) * 100 : 0,
          ctrFromOpen: templateOpens > 0 ? (templateClicks / templateOpens) * 100 : 0
        };
      })
    );

    // 5. TEMPORAL ANALYTICS (Daily/Hourly breakdowns)
    const dailyMetrics = await prisma.campaignSend.groupBy({
      by: ['sentAt'],
      where: {
        ...campaignWhereClause,
        sentAt: { gte: rangeStart, lte: rangeEnd }
      },
      _count: {
        id: true
      }
    });

    // Get daily opens, clicks, and RSVPs
    const dailyOpens = await prisma.campaignSend.groupBy({
      by: ['openedAt'],
      where: {
        ...campaignWhereClause,
        openedAt: { gte: rangeStart, lte: rangeEnd, not: null }
      },
      _count: {
        id: true
      }
    });

    const dailyClicks = await prisma.campaignSend.groupBy({
      by: ['visitedAt'],
      where: {
        ...campaignWhereClause,
        visitedAt: { gte: rangeStart, lte: rangeEnd, not: null }
      },
      _count: {
        id: true
      }
    });

    const dailyRSVPs = await prisma.campaignSend.groupBy({
      by: ['rsvpAt'],
      where: {
        ...campaignWhereClause,
        rsvpAt: { gte: rangeStart, lte: rangeEnd, not: null }
      },
      _count: {
        id: true
      }
    });

    // 6. AUDIENCE ANALYTICS
    const audienceGroups = await prisma.audienceGroup.findMany({
      where: {
        schedules: {
          some: campaignWhereClause
        }
      },
      select: {
        id: true,
        name: true,
        description: true,
        members: {
          select: {
            id: true,
            businessName: true,
            primaryEmail: true
          }
        },
        schedules: {
          where: campaignWhereClause,
          select: {
            id: true
          }
        }
      }
    });

    // 7. PERFORMANCE METRICS
    const throughputData = await prisma.emailJob.findMany({
      where: {
        ...campaignWhereClause,
        sentAt: { gte: rangeStart, lte: rangeEnd, not: null }
      },
      select: {
        sentAt: true,
        status: true
      },
      orderBy: {
        sentAt: 'asc'
      }
    });

    // Calculate hourly throughput
    const hourlyThroughput = throughputData.reduce((acc, job) => {
      if (!job.sentAt) return acc;
      const hour = new Date(job.sentAt).toISOString().slice(0, 13) + ':00:00.000Z';
      acc[hour] = (acc[hour] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // 8. ERROR ANALYTICS
    const failedJobsDetails = await prisma.emailJob.findMany({
      where: {
        ...campaignWhereClause,
        status: 'failed',
        updatedAt: { gte: rangeStart, lte: rangeEnd }
      },
      select: {
        error: true,
        attempts: true,
        updatedAt: true
      }
    });

    const errorBreakdown = failedJobsDetails.reduce((acc, job) => {
      const errorType = job.error?.includes('bounce') ? 'bounce' :
                       job.error?.includes('complaint') ? 'complaint' :
                       job.error?.includes('rate') ? 'rate_limit' :
                       job.error?.includes('invalid') ? 'invalid_email' :
                       'other';
      acc[errorType] = (acc[errorType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // 9. GEOGRAPHIC ANALYTICS (from visits)
    const campaignVisits = await prisma.visit.findMany({
      where: {
        eid: { contains: 'biz_' },
        createdAt: { gte: rangeStart, lte: rangeEnd }
      },
      select: {
        country: true,
        region: true,
        city: true,
        device: true,
        browser: true
      }
    });

    const geoBreakdown = campaignVisits.reduce((acc, visit) => {
      const country = visit.country || 'Unknown';
      acc.countries[country] = (acc.countries[country] || 0) + 1;
      
      const device = visit.device || 'Unknown';
      acc.devices[device] = (acc.devices[device] || 0) + 1;
      
      const browser = visit.browser || 'Unknown';
      acc.browsers[browser] = (acc.browsers[browser] || 0) + 1;
      
      return acc;
    }, {
      countries: {} as Record<string, number>,
      devices: {} as Record<string, number>,
      browsers: {} as Record<string, number>
    });

    return NextResponse.json({
      // Overall Metrics
      overview: {
        totalJobs,
        sentJobs,
        failedJobs,
        scheduledJobs,
        processingJobs,
        deliveryRate: totalJobs > 0 ? (sentJobs / totalJobs) * 100 : 0,
        failureRate: totalJobs > 0 ? (failedJobs / totalJobs) * 100 : 0
      },

      // Email Engagement
      emailEngagement: {
        totalOpens: opens.length,
        totalClicks: clicks.length,
        totalBounces: bounces.length,
        totalComplaints: complaints.length,
        openRate,
        clickRate,
        bounceRate,
        complaintRate,
        ctrRate
      },

      // Conversion Funnel
      conversionFunnel: {
        totalSends,
        uniqueOpens,
        uniqueClicks,
        uniqueRSVPs,
        emailToOpenRate,
        emailToClickRate,
        emailToRSVPRate,
        openToClickRate,
        clickToRSVPRate,
        openToRSVPRate
      },

      // A/B Testing
      abTestResults,

      // Temporal Analytics
      temporalAnalytics: {
        dailyMetrics: dailyMetrics.map(d => ({
          date: d.sentAt?.toISOString().split('T')[0] || 'unknown',
          sends: d._count.id
        })),
        hourlyThroughput
      },

      // Audience Analytics
      audienceAnalytics: {
        totalGroups: audienceGroups.length,
        totalMembers: audienceGroups.reduce((sum, group) => sum + group.members.length, 0),
        groups: audienceGroups.map(group => ({
          id: group.id,
          name: group.name,
          description: group.description,
          memberCount: group.members.length,
          scheduleCount: group.schedules.length
        }))
      },

      // Performance
      performance: {
        errorBreakdown,
        avgAttempts: failedJobsDetails.length > 0 ? failedJobsDetails.reduce((sum, job) => sum + job.attempts, 0) / failedJobsDetails.length : 0
      },

      // Geographic & Device Analytics
      geoAnalytics: geoBreakdown,

      // Date Range
      dateRange: {
        start: rangeStart,
        end: rangeEnd,
        days
      }
    });

  } catch (error) {
    console.error('Campaign analytics error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch campaign analytics' },
      { status: 500 }
    );
  }
}
