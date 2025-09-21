'use client';

import { useState, useEffect } from 'react';

interface GlobalTemplateSettingsProps {
  onSave: (settings: GlobalTemplateSettings) => Promise<void>;
  onCancel: () => void;
}

interface GlobalTemplateSettings {
  global_hero_title: string;
  global_hero_message: string;
  global_signature_name: string;
  global_signature_title: string;
  global_signature_company: string;
  global_signature_location: string;
  global_event_title: string;
  global_event_date: string;
  global_event_time: string;
  global_event_location: string;
  global_event_cost: string;
  global_event_includes: string;
}

export default function GlobalTemplateSettings({ onSave, onCancel }: GlobalTemplateSettingsProps) {
  const [settings, setSettings] = useState<GlobalTemplateSettings>({
    global_hero_title: 'Welcome to Evergreen AI',
    global_hero_message: 'Thank you for your interest in our upcoming informational session about practical AI tools for Northern BC businesses.',
    global_signature_name: 'Gabriel Lacroix',
    global_signature_title: 'AI Solutions Specialist',
    global_signature_company: 'Evergreen Web Solutions',
    global_signature_location: 'Terrace, BC',
    global_event_title: 'Event Details',
    global_event_date: 'October 23rd, 2025',
    global_event_time: '6:00 PM - 8:00 PM',
    global_event_location: 'Terrace, BC',
    global_event_cost: 'Free',
    global_event_includes: 'Coffee, refreshments, networking, and actionable AI insights',
  });

  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load existing settings when component mounts
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await fetch('/api/admin/global-template-settings');
        if (response.ok) {
          const data = await response.json();
          setSettings(data);
        }
      } catch (error) {
        console.error('Error loading global template settings:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(settings);
    } catch (error) {
      console.error('Error saving global template settings:', error);
      alert('Failed to save global template settings');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="text-gray-600">Loading settings...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Global Template Settings</h2>
          <p className="text-sm text-gray-600 mt-1">
            Configure the global template variables that apply to all email templates.
          </p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Hero Section */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Hero Section</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hero Title</label>
                <input
                  type="text"
                  value={settings.global_hero_title}
                  onChange={(e) => setSettings(prev => ({ ...prev, global_hero_title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                  placeholder="Welcome to Evergreen AI"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hero Message</label>
                <textarea
                  value={settings.global_hero_message}
                  onChange={(e) => setSettings(prev => ({ ...prev, global_hero_message: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                  rows={3}
                  placeholder="Thank you for your interest in our upcoming informational session..."
                />
              </div>
            </div>
          </div>

          {/* Event Details */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Event Details</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Event Title</label>
                <input
                  type="text"
                  value={settings.global_event_title}
                  onChange={(e) => setSettings(prev => ({ ...prev, global_event_title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                  placeholder="Event Details"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Event Date</label>
                <input
                  type="text"
                  value={settings.global_event_date}
                  onChange={(e) => setSettings(prev => ({ ...prev, global_event_date: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                  placeholder="October 23rd, 2025"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Event Time</label>
                <input
                  type="text"
                  value={settings.global_event_time}
                  onChange={(e) => setSettings(prev => ({ ...prev, global_event_time: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                  placeholder="6:00 PM - 8:00 PM"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Event Location</label>
                <input
                  type="text"
                  value={settings.global_event_location}
                  onChange={(e) => setSettings(prev => ({ ...prev, global_event_location: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                  placeholder="Terrace, BC"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Event Cost</label>
                <input
                  type="text"
                  value={settings.global_event_cost}
                  onChange={(e) => setSettings(prev => ({ ...prev, global_event_cost: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                  placeholder="Free"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Event Includes</label>
                <input
                  type="text"
                  value={settings.global_event_includes}
                  onChange={(e) => setSettings(prev => ({ ...prev, global_event_includes: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                  placeholder="Coffee, refreshments, networking, and actionable AI insights"
                />
              </div>
            </div>
          </div>

          {/* Global Signature */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Global Signature</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Signature Name</label>
                <input
                  type="text"
                  value={settings.global_signature_name}
                  onChange={(e) => setSettings(prev => ({ ...prev, global_signature_name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                  placeholder="Gabriel Lacroix"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Signature Title</label>
                <input
                  type="text"
                  value={settings.global_signature_title}
                  onChange={(e) => setSettings(prev => ({ ...prev, global_signature_title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                  placeholder="AI Solutions Specialist"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Signature Company</label>
                <input
                  type="text"
                  value={settings.global_signature_company}
                  onChange={(e) => setSettings(prev => ({ ...prev, global_signature_company: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                  placeholder="Evergreen Web Solutions"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Signature Location</label>
                <input
                  type="text"
                  value={settings.global_signature_location}
                  onChange={(e) => setSettings(prev => ({ ...prev, global_signature_location: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                  placeholder="Terrace, BC"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>
    </div>
  );
}
