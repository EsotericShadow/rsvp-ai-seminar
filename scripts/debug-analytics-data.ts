#!/usr/bin/env tsx

import prisma from '../src/lib/prisma';

async function debugAnalyticsData() {
  console.log('🔍 Debugging Analytics Data...\n');

  try {
    // Check visits data
    const visits = await prisma.visit.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' }
    });

    console.log('📊 Recent Visits:');
    console.log(`Total visits: ${visits.length}`);
    
    if (visits.length > 0) {
      const sampleVisit = visits[0];
      console.log('\n📋 Sample Visit Data:');
      console.log('- visitorId:', sampleVisit.visitorId || 'NULL');
      console.log('- sessionId:', sampleVisit.sessionId || 'NULL');
      console.log('- path:', sampleVisit.path || 'NULL');
      console.log('- country:', sampleVisit.country || 'NULL');
      console.log('- region:', sampleVisit.region || 'NULL');
      console.log('- city:', sampleVisit.city || 'NULL');
      console.log('- device:', sampleVisit.device || 'NULL');
      console.log('- browser:', sampleVisit.browser || 'NULL');
      console.log('- platform:', sampleVisit.platform || 'NULL');
      console.log('- eid:', sampleVisit.eid || 'NULL');
      console.log('- utmSource:', sampleVisit.utmSource || 'NULL');
      console.log('- utmCampaign:', sampleVisit.utmCampaign || 'NULL');
      console.log('- referrer:', sampleVisit.referrer || 'NULL');
      console.log('- userAgent:', sampleVisit.userAgent ? 'Present' : 'NULL');
      console.log('- timeOnPageMs:', sampleVisit.timeOnPageMs || 'NULL');
      console.log('- scrollDepth:', sampleVisit.scrollDepth || 'NULL');
      console.log('- screenW:', sampleVisit.screenW || 'NULL');
      console.log('- screenH:', sampleVisit.screenH || 'NULL');
      console.log('- viewportW:', sampleVisit.viewportW || 'NULL');
      console.log('- viewportH:', sampleVisit.viewportH || 'NULL');
      console.log('- dpr:', sampleVisit.dpr || 'NULL');
      console.log('- language:', sampleVisit.language || 'NULL');
      console.log('- tz:', sampleVisit.tz || 'NULL');
      console.log('- deviceMemory:', sampleVisit.deviceMemory || 'NULL');
      console.log('- hardwareConcurrency:', sampleVisit.hardwareConcurrency || 'NULL');
      console.log('- maxTouchPoints:', sampleVisit.maxTouchPoints || 'NULL');
      console.log('- interactionCounts:', sampleVisit.interactionCounts ? 'Present' : 'NULL');
      console.log('- connection:', sampleVisit.connection ? 'Present' : 'NULL');
      console.log('- storage:', sampleVisit.storage ? 'Present' : 'NULL');
      console.log('- navigation:', sampleVisit.navigation ? 'Present' : 'NULL');
      console.log('- paint:', sampleVisit.paint ? 'Present' : 'NULL');
      console.log('- performance:', sampleVisit.performance ? 'Present' : 'NULL');
      console.log('- visibility:', sampleVisit.visibility ? 'Present' : 'NULL');
    }

    // Check RSVPs data
    const rsvps = await prisma.rSVP.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' }
    });

    console.log('\n\n📝 Recent RSVPs:');
    console.log(`Total RSVPs: ${rsvps.length}`);
    
    if (rsvps.length > 0) {
      const sampleRSVP = rsvps[0];
      console.log('\n📋 Sample RSVP Data:');
      console.log('- fullName:', sampleRSVP.fullName || 'NULL');
      console.log('- email:', sampleRSVP.email || 'NULL');
      console.log('- organization:', sampleRSVP.organization || 'NULL');
      console.log('- phone:', sampleRSVP.phone || 'NULL');
      console.log('- visitorId:', sampleRSVP.visitorId || 'NULL');
      console.log('- sessionId:', sampleRSVP.sessionId || 'NULL');
      console.log('- eid:', sampleRSVP.eid || 'NULL');
      console.log('- referrer:', sampleRSVP.referrer || 'NULL');
      console.log('- device:', sampleRSVP.device || 'NULL');
      console.log('- browser:', sampleRSVP.browser || 'NULL');
      console.log('- platform:', sampleRSVP.platform || 'NULL');
      console.log('- userAgent:', sampleRSVP.userAgent ? 'Present' : 'NULL');
      console.log('- country:', sampleRSVP.country || 'NULL');
      console.log('- region:', sampleRSVP.region || 'NULL');
      console.log('- city:', sampleRSVP.city || 'NULL');
      console.log('- screenW:', sampleRSVP.screenW || 'NULL');
      console.log('- screenH:', sampleRSVP.screenH || 'NULL');
      console.log('- dpr:', sampleRSVP.dpr || 'NULL');
      console.log('- language:', sampleRSVP.language || 'NULL');
      console.log('- tz:', sampleRSVP.tz || 'NULL');
    }

    // Check for data quality issues
    console.log('\n\n🔧 Data Quality Analysis:');
    
    const totalVisits = await prisma.visit.count();
    const visitsWithCountry = await prisma.visit.count({ where: { country: { not: null } } });
    const visitsWithDevice = await prisma.visit.count({ where: { device: { not: null } } });
    const visitsWithBrowser = await prisma.visit.count({ where: { browser: { not: null } } });
    const visitsWithEid = await prisma.visit.count({ where: { eid: { not: null } } });
    const visitsWithTimeOnPage = await prisma.visit.count({ where: { timeOnPageMs: { not: null } } });

    console.log(`Total visits: ${totalVisits}`);
    console.log(`Visits with country data: ${visitsWithCountry} (${((visitsWithCountry/totalVisits)*100).toFixed(1)}%)`);
    console.log(`Visits with device data: ${visitsWithDevice} (${((visitsWithDevice/totalVisits)*100).toFixed(1)}%)`);
    console.log(`Visits with browser data: ${visitsWithBrowser} (${((visitsWithBrowser/totalVisits)*100).toFixed(1)}%)`);
    console.log(`Visits with eid (business tracking): ${visitsWithEid} (${((visitsWithEid/totalVisits)*100).toFixed(1)}%)`);
    console.log(`Visits with time on page: ${visitsWithTimeOnPage} (${((visitsWithTimeOnPage/totalVisits)*100).toFixed(1)}%)`);

  } catch (error) {
    console.error('❌ Error debugging analytics data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugAnalyticsData();


