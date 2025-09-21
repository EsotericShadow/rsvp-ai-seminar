'use client';

import { useState } from 'react';

interface PreviewContent {
  subject: string;
  greeting_title: string;
  greeting_message: string;
  signature_name: string;
  signature_title: string;
  signature_company: string;
  signature_location: string;
  main_content_title: string;
  main_content_body: string;
  button_text: string;
  button_link: string;
  additional_info_title: string;
  additional_info_body: string;
  closing_title: string;
  closing_message: string;
  closing_signature: string;
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

interface GlobalTemplateContentEditorProps {
  previewContent: PreviewContent;
  setPreviewContent: React.Dispatch<React.SetStateAction<PreviewContent>>;
}

export default function GlobalTemplateContentEditor({ 
  previewContent, 
  setPreviewContent 
}: GlobalTemplateContentEditorProps) {
  return (
    <div className="w-full flex flex-col min-h-0">
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h3 className="text-lg font-medium text-blue-900 mb-2">📝 Preview Content Editor</h3>
            <p className="text-sm text-blue-800">
              Edit the content that appears in the preview. These values are used to demonstrate how the template will look when filled with real data.
            </p>
          </div>

          {/* Basic Information */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject Line</label>
                <input
                  type="text"
                  value={previewContent.subject}
                  onChange={(e) => setPreviewContent(prev => ({ ...prev, subject: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                  placeholder="Email subject line"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Button Text</label>
                <input
                  type="text"
                  value={previewContent.button_text}
                  onChange={(e) => setPreviewContent(prev => ({ ...prev, button_text: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                  placeholder="e.g., RSVP for Free Session"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Button Link</label>
                <input
                  type="text"
                  value={previewContent.button_link}
                  onChange={(e) => setPreviewContent(prev => ({ ...prev, button_link: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                  placeholder="https://rsvp.evergreenwebsolutions.ca/rsvp?token=sample"
                />
              </div>
            </div>
          </div>

          {/* Hero Section */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Hero Section</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hero Title</label>
                <input
                  type="text"
                  value={previewContent.global_hero_title}
                  onChange={(e) => setPreviewContent(prev => ({ ...prev, global_hero_title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                  placeholder="Welcome to Evergreen AI"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hero Message</label>
                <textarea
                  value={previewContent.global_hero_message}
                  onChange={(e) => setPreviewContent(prev => ({ ...prev, global_hero_message: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                  rows={3}
                  placeholder="Thank you for your interest in our upcoming informational session..."
                />
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Main Content</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Content Title</label>
                <input
                  type="text"
                  value={previewContent.main_content_title}
                  onChange={(e) => setPreviewContent(prev => ({ ...prev, main_content_title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                  placeholder="e.g., What You'll Learn"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Content Body</label>
                <textarea
                  value={previewContent.main_content_body}
                  onChange={(e) => setPreviewContent(prev => ({ ...prev, main_content_body: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                  rows={4}
                  placeholder="Write your main message content here..."
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
                  value={previewContent.global_event_title}
                  onChange={(e) => setPreviewContent(prev => ({ ...prev, global_event_title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                  placeholder="Event Details"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Event Date</label>
                <input
                  type="text"
                  value={previewContent.global_event_date}
                  onChange={(e) => setPreviewContent(prev => ({ ...prev, global_event_date: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                  placeholder="October 23rd, 2025"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Event Time</label>
                <input
                  type="text"
                  value={previewContent.global_event_time}
                  onChange={(e) => setPreviewContent(prev => ({ ...prev, global_event_time: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                  placeholder="6:00 PM - 8:00 PM"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Event Location</label>
                <input
                  type="text"
                  value={previewContent.global_event_location}
                  onChange={(e) => setPreviewContent(prev => ({ ...prev, global_event_location: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                  placeholder="Terrace, BC"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Event Cost</label>
                <input
                  type="text"
                  value={previewContent.global_event_cost}
                  onChange={(e) => setPreviewContent(prev => ({ ...prev, global_event_cost: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                  placeholder="Free"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Event Includes</label>
                <input
                  type="text"
                  value={previewContent.global_event_includes}
                  onChange={(e) => setPreviewContent(prev => ({ ...prev, global_event_includes: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                  placeholder="Coffee, refreshments, networking, and actionable AI insights"
                />
              </div>
            </div>
          </div>

          {/* Signature */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Signature</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Signature Name</label>
                <input
                  type="text"
                  value={previewContent.global_signature_name}
                  onChange={(e) => setPreviewContent(prev => ({ ...prev, global_signature_name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                  placeholder="Gabriel Lacroix"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Signature Title</label>
                <input
                  type="text"
                  value={previewContent.global_signature_title}
                  onChange={(e) => setPreviewContent(prev => ({ ...prev, global_signature_title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                  placeholder="AI Solutions Specialist"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Signature Company</label>
                <input
                  type="text"
                  value={previewContent.global_signature_company}
                  onChange={(e) => setPreviewContent(prev => ({ ...prev, global_signature_company: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                  placeholder="Evergreen Web Solutions"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Signature Location</label>
                <input
                  type="text"
                  value={previewContent.global_signature_location}
                  onChange={(e) => setPreviewContent(prev => ({ ...prev, global_signature_location: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                  placeholder="Terrace, BC"
                />
              </div>
            </div>
          </div>

          {/* Closing */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Closing Section</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Closing Title</label>
                <input
                  type="text"
                  value={previewContent.closing_title}
                  onChange={(e) => setPreviewContent(prev => ({ ...prev, closing_title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                  placeholder="e.g., Looking Forward"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Closing Message</label>
                <textarea
                  value={previewContent.closing_message}
                  onChange={(e) => setPreviewContent(prev => ({ ...prev, closing_message: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                  rows={2}
                  placeholder="e.g., We're excited to share these practical AI solutions with you..."
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
