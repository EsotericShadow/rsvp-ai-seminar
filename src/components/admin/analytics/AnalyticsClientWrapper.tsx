'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import AnalyticsDashboard from './AnalyticsDashboard';
import OverviewTab from './OverviewTab';
import RSVPsTab from './RSVPsTab';
import VisitorsTab from './VisitorsTab';
import VisitorsWithBusiness from './VisitorsWithBusiness';
import TrackingLinksPerformance from './TrackingLinksPerformance';
import CampaignsTab from './CampaignsTab';
import DevicesTab from './DevicesTab';
import TimelineTab from './TimelineTab';
import SettingsTab from './SettingsTab';

interface AnalyticsClientWrapperProps {
  initialTab: string;
  overviewStats: any;
  rsvps: any[];
  visitors: any[];
  campaigns: any[];
  audienceGroups: any[];
}

export default function AnalyticsClientWrapper({ 
  initialTab, 
  overviewStats, 
  rsvps, 
  visitors,
  campaigns,
  audienceGroups
}: AnalyticsClientWrapperProps) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    
    // Update URL without page refresh
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', tabId);
    router.push(`/admin/analytics?${params.toString()}`, { scroll: false });
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewTab stats={overviewStats} />;
      case 'rsvps':
        return <RSVPsTab rsvps={rsvps} />;
      case 'visitors':
        return <VisitorsTab visitors={visitors} />;
      case 'visitors-business':
        return <VisitorsWithBusiness />;
      case 'tracking-links':
        return <TrackingLinksPerformance />;
      case 'campaigns':
        return <CampaignsTab campaigns={campaigns} audienceGroups={audienceGroups} />;
      case 'devices':
        return <DevicesTab 
          deviceBreakdown={overviewStats.deviceBreakdown}
          platformBreakdown={overviewStats.platformBreakdown}
          topBrowsers={overviewStats.topBrowsers}
        />;
      case 'timeline':
        return <TimelineTab 
          visitsTrend={overviewStats.visitsTrend}
          rsvpsTrend={overviewStats.rsvpsTrend}
          hourlyData={overviewStats.hourlyData}
          dailyData={overviewStats.dailyData}
        />;
      case 'settings':
        return <SettingsTab />;
      default:
        return <OverviewTab stats={overviewStats} />;
    }
  };

  return (
    <AnalyticsDashboard activeTab={activeTab} onTabChange={handleTabChange}>
      {renderTabContent()}
    </AnalyticsDashboard>
  );
}
