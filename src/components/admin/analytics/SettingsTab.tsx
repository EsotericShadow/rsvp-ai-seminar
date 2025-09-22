'use client';

import { useState } from 'react';
import { ThemeToggle } from '../../ui/ThemeToggle';

interface SettingsTabProps {
  // Add any settings props here
}

export default function SettingsTab({}: SettingsTabProps) {
  const [settings, setSettings] = useState({
    // Dashboard settings
    refreshInterval: 30,
    showRealTimeUpdates: true,
    defaultTimeRange: '7d',
    itemsPerPage: 50,
    
    // Display settings
    theme: 'dark',
    compactMode: false,
    showAdvancedMetrics: false,
    showDataLabels: true,
    chartAnimation: true,
    
    // Export settings
    exportFormat: 'csv',
    includeMetadata: true,
    exportTimezone: 'local',
    
    // Data retention
    dataRetentionDays: 365,
    autoDeleteOldData: false,
    backupFrequency: 'weekly',
    
    // Notifications
    emailNotifications: false,
    notificationThreshold: 100,
    slackNotifications: false,
    webhookUrl: '',
    
    // Privacy & Security
    anonymizeData: false,
    trackUserBehavior: true,
    respectDoNotTrack: true,
    
    // Performance
    enableCaching: true,
    cacheTimeout: 300,
    maxConcurrentRequests: 10,
  });

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSaveSettings = () => {
    // Save settings to localStorage or API
    localStorage.setItem('analytics-settings', JSON.stringify(settings));
    alert('Settings saved successfully!');
  };

  const handleResetSettings = () => {
    if (confirm('Are you sure you want to reset all settings to defaults?')) {
      setSettings({
        refreshInterval: 30,
        showRealTimeUpdates: true,
        defaultTimeRange: '7d',
        itemsPerPage: 50,
        theme: 'dark',
        compactMode: false,
        showAdvancedMetrics: false,
        showDataLabels: true,
        chartAnimation: true,
        exportFormat: 'csv',
        includeMetadata: true,
        exportTimezone: 'local',
        dataRetentionDays: 365,
        autoDeleteOldData: false,
        backupFrequency: 'weekly',
        emailNotifications: false,
        notificationThreshold: 100,
        slackNotifications: false,
        webhookUrl: '',
        anonymizeData: false,
        trackUserBehavior: true,
        respectDoNotTrack: true,
        enableCaching: true,
        cacheTimeout: 300,
        maxConcurrentRequests: 10,
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Dashboard Settings</h2>
          <p className="text-neutral-300 mt-1">Configure your analytics dashboard preferences</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleResetSettings}
            className="px-4 py-2 text-sm font-medium text-neutral-300 bg-secondary-700/50 hover:bg-secondary-700 rounded-lg transition-colors"
          >
            Reset to Defaults
          </button>
          <button
            onClick={handleSaveSettings}
            className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors"
          >
            Save Settings
          </button>
        </div>
      </div>

      {/* Settings Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* Dashboard Settings */}
        <div className="glass rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Dashboard Preferences</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Refresh Interval (seconds)
              </label>
              <select
                value={settings.refreshInterval}
                onChange={(e) => handleSettingChange('refreshInterval', parseInt(e.target.value))}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={10}>10 seconds</option>
                <option value={30}>30 seconds</option>
                <option value={60}>1 minute</option>
                <option value={300}>5 minutes</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Default Time Range
              </label>
              <select
                value={settings.defaultTimeRange}
                onChange={(e) => handleSettingChange('defaultTimeRange', e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="1d">Last 24 hours</option>
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Items Per Page
              </label>
              <select
                value={settings.itemsPerPage}
                onChange={(e) => handleSettingChange('itemsPerPage', parseInt(e.target.value))}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={25}>25 items</option>
                <option value={50}>50 items</option>
                <option value={100}>100 items</option>
                <option value={200}>200 items</option>
              </select>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="realTimeUpdates"
                checked={settings.showRealTimeUpdates}
                onChange={(e) => handleSettingChange('showRealTimeUpdates', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-600 rounded bg-gray-800"
              />
              <label htmlFor="realTimeUpdates" className="ml-2 text-sm text-gray-300">
                Enable real-time updates
              </label>
            </div>
          </div>
        </div>

        {/* Display Settings */}
        <div className="glass rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Display Options</h3>
          <div className="space-y-4">
            <ThemeToggle />

            <div className="flex items-center">
              <input
                type="checkbox"
                id="compactMode"
                checked={settings.compactMode}
                onChange={(e) => handleSettingChange('compactMode', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-600 rounded bg-gray-800"
              />
              <label htmlFor="compactMode" className="ml-2 text-sm text-gray-300">
                Compact mode (smaller spacing)
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="advancedMetrics"
                checked={settings.showAdvancedMetrics}
                onChange={(e) => handleSettingChange('showAdvancedMetrics', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-600 rounded bg-gray-800"
              />
              <label htmlFor="advancedMetrics" className="ml-2 text-sm text-gray-300">
                Show advanced metrics
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="dataLabels"
                checked={settings.showDataLabels}
                onChange={(e) => handleSettingChange('showDataLabels', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-600 rounded bg-gray-800"
              />
              <label htmlFor="dataLabels" className="ml-2 text-sm text-gray-300">
                Show data labels on charts
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="chartAnimation"
                checked={settings.chartAnimation}
                onChange={(e) => handleSettingChange('chartAnimation', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-600 rounded bg-gray-800"
              />
              <label htmlFor="chartAnimation" className="ml-2 text-sm text-gray-300">
                Enable chart animations
              </label>
            </div>
          </div>
        </div>

        {/* Export Settings */}
        <div className="glass rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Export Options</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Default Export Format
              </label>
              <select
                value={settings.exportFormat}
                onChange={(e) => handleSettingChange('exportFormat', e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="csv">CSV</option>
                <option value="json">JSON</option>
                <option value="xlsx">Excel</option>
              </select>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="includeMetadata"
                checked={settings.includeMetadata}
                onChange={(e) => handleSettingChange('includeMetadata', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-600 rounded bg-gray-800"
              />
              <label htmlFor="includeMetadata" className="ml-2 text-sm text-gray-300">
                Include metadata in exports
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Export Timezone
              </label>
              <select
                value={settings.exportTimezone}
                onChange={(e) => handleSettingChange('exportTimezone', e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="local">Local Time</option>
                <option value="utc">UTC</option>
                <option value="pst">Pacific Time</option>
                <option value="est">Eastern Time</option>
              </select>
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="glass rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Notifications</h3>
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="emailNotifications"
                checked={settings.emailNotifications}
                onChange={(e) => handleSettingChange('emailNotifications', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-600 rounded bg-gray-800"
              />
              <label htmlFor="emailNotifications" className="ml-2 text-sm text-gray-300">
                Email notifications for important events
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Notification Threshold (RSVPs)
              </label>
              <input
                type="number"
                value={settings.notificationThreshold}
                onChange={(e) => handleSettingChange('notificationThreshold', parseInt(e.target.value))}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="1"
                max="1000"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="glass rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center justify-center px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export All Data
          </button>
          
          <button className="flex items-center justify-center px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh Data
          </button>
          
          <button className="flex items-center justify-center px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Generate Report
          </button>
        </div>
      </div>
    </div>
  );
}
