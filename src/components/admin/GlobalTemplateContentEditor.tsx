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
  // Global content will be loaded separately from Global Template Settings
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
              Edit the individual template content that appears in the preview. Global content (hero, event details, signature) is managed separately in Global Template Settings.
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
