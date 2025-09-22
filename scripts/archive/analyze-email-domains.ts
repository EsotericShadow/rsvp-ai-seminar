import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function analyzeEmailDomains() {
  try {
    console.log('📊 Analyzing email domains in verified business database...');

    // Get all verified business emails from the spreadsheet import
    const verifiedGroup = await prisma.audienceGroup.findFirst({
      where: { name: 'Verified Business Emails - Spreadsheet' },
      include: {
        members: {
          select: {
            primaryEmail: true,
            businessName: true,
            unsubscribed: true
          }
        }
      }
    });

    if (!verifiedGroup) {
      console.log('❌ No verified business emails group found');
      return;
    }

    console.log(`📋 Total verified businesses: ${verifiedGroup.members.length}`);

    // Extract domains and categorize them
    const domainStats = new Map<string, {
      count: number;
      percentage: number;
      businesses: string[];
      unsubscribed: number;
    }>();

    const customDomains = new Map<string, number>();
    let totalEmails = 0;
    let unsubscribedCount = 0;

    for (const member of verifiedGroup.members) {
      if (!member.primaryEmail) continue;
      
      totalEmails++;
      if (member.unsubscribed) unsubscribedCount++;

      const domain = member.primaryEmail.split('@')[1]?.toLowerCase();
      if (!domain) continue;

      // Categorize domains
      let category: string;
      if (domain.includes('gmail.com')) {
        category = 'Gmail';
      } else if (domain.includes('yahoo.com') || domain.includes('ymail.com') || domain.includes('rocketmail.com')) {
        category = 'Yahoo';
      } else if (domain.includes('hotmail.com') || domain.includes('outlook.com') || domain.includes('live.com') || domain.includes('msn.com')) {
        category = 'Microsoft (Hotmail/Outlook)';
      } else if (domain.includes('icloud.com') || domain.includes('me.com') || domain.includes('mac.com')) {
        category = 'iCloud (Apple)';
      } else if (domain.includes('aol.com')) {
        category = 'AOL';
      } else if (domain.includes('telus.net') || domain.includes('shaw.ca') || domain.includes('rogers.com') || domain.includes('bell.net')) {
        category = 'Canadian ISP';
      } else {
        // Check if it's a custom domain (not a major provider)
        const isCustomDomain = !domain.includes('.') || 
          !['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'live.com', 'msn.com', 'icloud.com', 'me.com', 'mac.com', 'aol.com', 'telus.net', 'shaw.ca', 'rogers.com', 'bell.net'].some(provider => domain.includes(provider));
        
        if (isCustomDomain) {
          category = 'Custom Domain';
          customDomains.set(domain, (customDomains.get(domain) || 0) + 1);
        } else {
          category = 'Other';
        }
      }

      if (!domainStats.has(category)) {
        domainStats.set(category, {
          count: 0,
          percentage: 0,
          businesses: [],
          unsubscribed: 0
        });
      }

      const stats = domainStats.get(category)!;
      stats.count++;
      stats.businesses.push(member.businessName || 'Unknown Business');
      if (member.unsubscribed) stats.unsubscribed++;
    }

    // Calculate percentages
    for (const [category, stats] of domainStats) {
      stats.percentage = (stats.count / totalEmails) * 100;
    }

    // Sort by count (descending)
    const sortedDomains = Array.from(domainStats.entries())
      .sort(([,a], [,b]) => b.count - a.count);

    console.log('\n📊 EMAIL DOMAIN ANALYSIS');
    console.log('═'.repeat(60));
    console.log(`Total Verified Businesses: ${totalEmails}`);
    console.log(`Unsubscribed: ${unsubscribedCount} (${((unsubscribedCount / totalEmails) * 100).toFixed(1)}%)`);
    console.log(`Active Subscribers: ${totalEmails - unsubscribedCount} (${(((totalEmails - unsubscribedCount) / totalEmails) * 100).toFixed(1)}%)`);
    console.log('═'.repeat(60));

    console.log('\n🏆 TOP EMAIL PROVIDERS:');
    console.log('─'.repeat(60));
    
    for (const [category, stats] of sortedDomains) {
      const activeSubscribers = stats.count - stats.unsubscribed;
      const activePercentage = (activeSubscribers / totalEmails) * 100;
      
      console.log(`${category.padEnd(25)} ${stats.count.toString().padStart(4)} emails (${stats.percentage.toFixed(1)}%)`);
      console.log(`${' '.repeat(25)} ${activeSubscribers.toString().padStart(4)} active (${activePercentage.toFixed(1)}%)`);
      console.log(`${' '.repeat(25)} ${stats.unsubscribed.toString().padStart(4)} unsubscribed`);
      console.log('');
    }

    // Show top custom domains
    if (customDomains.size > 0) {
      console.log('🏢 TOP CUSTOM DOMAINS:');
      console.log('─'.repeat(60));
      
      const sortedCustomDomains = Array.from(customDomains.entries())
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10); // Top 10 custom domains
      
      for (const [domain, count] of sortedCustomDomains) {
        const percentage = (count / totalEmails) * 100;
        console.log(`${domain.padEnd(30)} ${count.toString().padStart(3)} emails (${percentage.toFixed(1)}%)`);
      }
    }

    // Deliverability recommendations
    console.log('\n🎯 DELIVERABILITY RECOMMENDATIONS:');
    console.log('─'.repeat(60));
    
    const gmailCount = domainStats.get('Gmail')?.count || 0;
    const yahooCount = domainStats.get('Yahoo')?.count || 0;
    const microsoftCount = domainStats.get('Microsoft (Hotmail/Outlook)')?.count || 0;
    const icloudCount = domainStats.get('iCloud (Apple)')?.count || 0;
    const customCount = domainStats.get('Custom Domain')?.count || 0;

    console.log('Priority Order for Deliverability Focus:');
    console.log('');
    
    if (gmailCount > 0) {
      console.log(`1. Gmail (${gmailCount} emails, ${((gmailCount/totalEmails)*100).toFixed(1)}%) - ✅ Working well`);
    }
    
    if (microsoftCount > 0) {
      console.log(`2. Microsoft/Outlook (${microsoftCount} emails, ${((microsoftCount/totalEmails)*100).toFixed(1)}%) - 🟡 Monitor closely`);
    }
    
    if (yahooCount > 0) {
      console.log(`3. Yahoo (${yahooCount} emails, ${((yahooCount/totalEmails)*100).toFixed(1)}%) - 🟡 Monitor closely`);
    }
    
    if (customCount > 0) {
      console.log(`4. Custom Domains (${customCount} emails, ${((customCount/totalEmails)*100).toFixed(1)}%) - 🟢 Usually good deliverability`);
    }
    
    if (icloudCount > 0) {
      console.log(`5. iCloud/Apple (${icloudCount} emails, ${((icloudCount/totalEmails)*100).toFixed(1)}%) - 🔴 Needs reputation building`);
    }

    console.log('\n💡 INSIGHTS:');
    console.log('─'.repeat(60));
    
    if (gmailCount > totalEmails * 0.3) {
      console.log('✅ Gmail is your largest provider - focus on maintaining good Gmail reputation');
    }
    
    if (customCount > totalEmails * 0.2) {
      console.log('✅ Good custom domain representation - these usually have excellent deliverability');
    }
    
    if (icloudCount > 0) {
      console.log('⚠️  iCloud emails need special attention - they\'re the most challenging for deliverability');
    }
    
    if (unsubscribedCount < totalEmails * 0.05) {
      console.log('✅ Low unsubscribe rate - good list quality');
    } else {
      console.log('⚠️  Higher unsubscribe rate - consider improving email content and targeting');
    }

  } catch (error) {
    console.error('❌ Error analyzing email domains:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the analysis
analyzeEmailDomains();
