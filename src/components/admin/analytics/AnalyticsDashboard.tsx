'use client';

import { useState } from 'react';
import { 
  ChartBarIcon, 
  UsersIcon, 
  EnvelopeIcon, 
  CogIcon,
  CalendarIcon,
  DevicePhoneMobileIcon,
  GlobeAltIcon,
  ClockIcon,
  LinkIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';

interface Tab {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

const tabs: Tab[] = [
  {
    id: 'overview',
    name: 'Overview',
    icon: ChartBarIcon,
    description: 'Key metrics and performance summary'
  },
  {
    id: 'rsvps',
    name: 'RSVPs',
    icon: UsersIcon,
    description: 'RSVP submissions and attendee data'
  },
  {
    id: 'visitors',
    name: 'Visitors',
    icon: GlobeAltIcon,
    description: 'Website traffic and visitor analytics'
  },
  {
    id: 'visitors-business',
    name: 'Visitors + Business',
    icon: BuildingOfficeIcon,
    description: 'Visitors connected to businesses and tracking'
  },
  {
    id: 'tracking-links',
    name: 'Tracking Links',
    icon: LinkIcon,
    description: 'Email tracking links and performance metrics'
  },
  {
    id: 'campaigns',
    name: 'Campaigns',
    icon: EnvelopeIcon,
    description: 'Email campaign performance and metrics'
  },
  {
    id: 'devices',
    name: 'Devices',
    icon: DevicePhoneMobileIcon,
    description: 'Device and browser analytics'
  },
  {
    id: 'timeline',
    name: 'Timeline',
    icon: ClockIcon,
    description: 'Time-based trends and patterns'
  },
  {
    id: 'settings',
    name: 'Settings',
    icon: CogIcon,
    description: 'Dashboard configuration and preferences'
  }
];

interface AnalyticsDashboardProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export default function AnalyticsDashboard({ children, activeTab, onTabChange }: AnalyticsDashboardProps) {
  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Sidebar Navigation */}
      <div className="lg:w-64 flex-shrink-0">
        <nav className="space-y-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`
                  group flex w-full items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200
                  ${isActive 
                    ? 'bg-primary-900/30 text-primary-300 shadow-lg border border-primary-700/30' 
                    : 'text-neutral-300 hover:bg-secondary-800/30 hover:text-white border border-transparent'
                  }
                `}
              >
                <Icon className={`mr-3 h-5 w-5 ${isActive ? 'text-primary-400' : 'text-neutral-400'}`} />
                <div className="flex-1 text-left">
                  <div className="font-medium">{tab.name}</div>
                  <div className="text-xs text-neutral-400 mt-0.5">{tab.description}</div>
                </div>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 min-w-0">
        {children}
      </div>
    </div>
  );
}
