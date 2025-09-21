'use client';

import { useState, useEffect, useCallback } from 'react';
import { CampaignTemplate } from '@prisma/client';
import { generateEmailHTML, generateEmailText } from '@/lib/email-template';
import { TemplateEditorErrorBoundary } from './EditorErrorBoundary';
import { LoadingButton, LoadingOverlay, useLoadingState } from '../LoadingStates';
import { useErrorLogger } from '@/lib/error-logger';
import { validateTemplate } from '@/lib/validation';

interface TemplateEditorProps {
  template: CampaignTemplate;
  onSave: (updatedTemplate: Partial<CampaignTemplate>) => Promise<void>;
  onCancel: () => void;
}

// Extended form data interface for all template variables
interface TemplateFormData {
  name: string;
  subject: string;
  htmlBody: string;
  textBody: string;
  // Template variables
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
}

function TemplateEditor({ template, onSave, onCancel }: TemplateEditorProps) {
  const { logError, logInfo } = useErrorLogger('TemplateEditor');
  const { isLoading, error, startLoading, stopLoading, setLoadingError } = useLoadingState();
  
  const [formData, setFormData] = useState<TemplateFormData>({
    name: template.name,
    subject: template.subject,
    htmlBody: template.htmlBody,
    textBody: template.textBody || '',
    // Initialize template variables with saved values or defaults
    greeting_title: template.greeting_title || '',
    greeting_message: template.greeting_message || '',
    signature_name: template.signature_name || 'Gabriel Lacroix',
    signature_title: template.signature_title || 'AI Solutions Specialist',
    signature_company: template.signature_company || 'Evergreen Web Solutions',
    signature_location: template.signature_location || 'Terrace, BC',
    main_content_title: template.main_content_title || '',
    main_content_body: template.main_content_body || template.htmlBody, // Use saved content or existing htmlBody
    button_text: template.button_text || 'View details & RSVP',
    button_link: template.button_link || '{{invite_link}}',
    additional_info_title: template.additional_info_title || '',
    additional_info_body: template.additional_info_body || '',
    closing_title: template.closing_title || '',
    closing_message: template.closing_message || '',
  });
  const [activeTab, setActiveTab] = useState<'html' | 'text'>('html');
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [previewHTML, setPreviewHTML] = useState('');

  // Auto-refresh preview when content changes
  const [previewKey, setPreviewKey] = useState(0);
  
  const getPreviewHTML = useCallback(async () => {
    // Replace variables with sample data for preview
    let content = formData.main_content_body;
    content = content.replace(/\{\{business_name\}\}/g, 'Sample Business Name');
    content = content.replace(/\{\{business_id\}\}/g, 'sample-business-123');
    content = content.replace(/\{\{invite_link\}\}/g, 'https://rsvp.evergreenwebsolutions.ca/rsvp/sample-business-123');
    content = content.replace(/\{\{.*?\}\}/g, 'Sample Data');
    
    // Generate preview using global template with all the individual template variables
    return await generateEmailHTML({
      subject: formData.subject,
      greeting_title: formData.greeting_title,
      greeting_message: formData.greeting_message,
      signature_name: formData.signature_name,
      signature_title: formData.signature_title,
      signature_company: formData.signature_company,
      signature_location: formData.signature_location,
      main_content_title: formData.main_content_title,
      body: content, // This is the main content body
      ctaText: formData.button_text,
      ctaLink: formData.button_link.replace('{{invite_link}}', 'https://rsvp.evergreenwebsolutions.ca/rsvp/sample-business-123'),
      additional_info_title: formData.additional_info_title,
      additional_info_body: formData.additional_info_body,
      closing_title: formData.closing_title,
      closing_message: formData.closing_message,
      businessName: 'Sample Business Name',
      businessId: 'sample-business-123',
      // Global template variables (will use defaults from email-template.ts)
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
  }, [formData]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPreviewKey(prev => prev + 1); // Force preview re-render
    }, 300); // Debounce updates
    return () => clearTimeout(timer);
  }, [formData.htmlBody, formData.subject]);

  // Update preview HTML when preview key changes
  useEffect(() => {
    const updatePreview = async () => {
      try {
        const html = await getPreviewHTML();
        setPreviewHTML(html);
      } catch (error) {
        console.error('Failed to generate preview:', error);
        setPreviewHTML('<p>Error generating preview</p>');
      }
    };
    updatePreview();
  }, [previewKey, getPreviewHTML]);

  // Initial preview generation when component mounts
  useEffect(() => {
    const generateInitialPreview = async () => {
      try {
        const html = await getPreviewHTML();
        setPreviewHTML(html);
      } catch (error) {
        console.error('Failed to generate initial preview:', error);
        setPreviewHTML('<p>Error generating preview</p>');
      }
    };
    generateInitialPreview();
  }, [getPreviewHTML]);

  const handleSave = async () => {
    startLoading();
    logInfo('Starting template save operation', { metadata: { templateId: template.id } });

    try {
      // Validate form data
      const templateData = {
        name: formData.name,
        subject: formData.subject,
        htmlBody: formData.htmlBody,
        textBody: formData.textBody,
        // Save all template variables
        greeting_title: formData.greeting_title,
        greeting_message: formData.greeting_message,
        signature_name: formData.signature_name,
        signature_title: formData.signature_title,
        signature_company: formData.signature_company,
        signature_location: formData.signature_location,
        main_content_title: formData.main_content_title,
        main_content_body: formData.main_content_body,
        button_text: formData.button_text,
        button_link: formData.button_link,
        additional_info_title: formData.additional_info_title,
        additional_info_body: formData.additional_info_body,
        closing_title: formData.closing_title,
        closing_message: formData.closing_message,
      };

      const validation = validateTemplate(templateData);
      if (!validation.success) {
        throw new Error(`Validation failed: ${JSON.stringify(validation.error)}`);
      }

      await onSave(validation.data as Partial<CampaignTemplate>);
      logInfo('Template saved successfully', { metadata: { templateId: template.id } });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logError('Failed to save template', error instanceof Error ? error : new Error(errorMessage));
      setLoadingError(errorMessage);
      alert(`Failed to save template: ${errorMessage}`);
    } finally {
      stopLoading();
    }
  };

  const insertVariable = (variable: string) => {
    const textarea = document.getElementById('htmlBody') as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = textarea.value;
      const before = text.substring(0, start);
      const after = text.substring(end);
      const newText = before + variable + after;
      
      setFormData(prev => ({
        ...prev,
        htmlBody: newText
      }));
      
      // Restore cursor position
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + variable.length, start + variable.length);
      }, 0);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center p-2 sm:p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-lg max-w-7xl w-full max-h-[98vh] sm:max-h-[95vh] overflow-y-auto flex flex-col my-4 sm:my-8">
        <form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
        {/* Header */}
        <div className="p-3 sm:p-6 border-b border-gray-200 flex flex-col sm:flex-row sm:justify-between sm:items-center bg-gray-50 gap-3">
          <h2 className="text-lg sm:text-xl font-semibold">Edit Template</h2>
          <div className="flex space-x-2 sm:space-x-3">
            <button
              onClick={onCancel}
              className="px-3 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50 text-sm sm:text-base"
              disabled={isLoading}
            >
              Cancel
            </button>
            <LoadingButton
              type="submit"
              isLoading={isLoading}
              loadingText="Saving..."
              className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 text-sm sm:text-base"
            >
              Save Changes
            </LoadingButton>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col lg:flex-row min-h-0">
          {/* Left Panel - Editor */}
          <div className="w-full lg:w-1/2 flex flex-col border-b lg:border-b-0 lg:border-r border-gray-200 min-h-0">
            {/* Template Info */}
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Template Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subject Line
                  </label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200">
              <button
                type="button"
                onClick={() => setActiveTab('html')}
                className={`px-4 py-2 text-sm font-medium ${
                  activeTab === 'html'
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Content Editor
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('text')}
                className={`px-4 py-2 text-sm font-medium ${
                  activeTab === 'text'
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Text Version
              </button>
            </div>

            {/* Editor */}
            <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
              {activeTab === 'html' && (
                <div className="flex-1 p-4 min-h-0 overflow-y-auto">
                  <div className="space-y-6">
                    {/* Basic Info */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="text-sm font-medium text-gray-900 mb-3">Basic Information</h3>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Subject Line</label>
                          <input
                            type="text"
                            value={formData.subject}
                            onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                            placeholder="Email subject line"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Button Text</label>
                          <input
                            type="text"
                            value={formData.button_text}
                            onChange={(e) => setFormData(prev => ({ ...prev, button_text: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                            placeholder="e.g., View details & RSVP"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Button Link</label>
                          <input
                            type="text"
                            value={formData.button_link}
                            onChange={(e) => setFormData(prev => ({ ...prev, button_link: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                            placeholder="e.g., {{invite_link}}"
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
                            value={formData.main_content_title}
                            onChange={(e) => setFormData(prev => ({ ...prev, main_content_title: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                            placeholder="e.g., What You'll Learn"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Main Content Body</label>
                          <div className="text-xs text-gray-500 mb-2">
                            💡 Use HTML tags like &lt;p&gt;, &lt;strong&gt;, &lt;em&gt;. Available variables: {`{{business_name}}`}, {`{{business_id}}`}, {`{{invite_link}}`}
                          </div>
                          <textarea
                            value={formData.main_content_body}
                            onChange={(e) => setFormData(prev => ({ ...prev, main_content_body: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                            rows={6}
                            placeholder="Write your main message content here..."
                          />
                        </div>
                      </div>
                    </div>

                    {/* Additional Info */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="text-sm font-medium text-gray-900 mb-3">Additional Information</h3>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Additional Info Title</label>
                          <input
                            type="text"
                            value={formData.additional_info_title}
                            onChange={(e) => setFormData(prev => ({ ...prev, additional_info_title: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                            placeholder="e.g., Event Details"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Additional Info Body</label>
                          <textarea
                            value={formData.additional_info_body}
                            onChange={(e) => setFormData(prev => ({ ...prev, additional_info_body: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                            rows={3}
                            placeholder="e.g., Date: October 23rd, 2025<br>Time: 6:00 PM - 8:00 PM<br>Location: Terrace, BC"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Closing Section */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="text-sm font-medium text-gray-900 mb-3">Closing Section</h3>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Closing Title</label>
                          <input
                            type="text"
                            value={formData.closing_title}
                            onChange={(e) => setFormData(prev => ({ ...prev, closing_title: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                            placeholder="e.g., Looking Forward"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Closing Message</label>
                          <textarea
                            value={formData.closing_message}
                            onChange={(e) => setFormData(prev => ({ ...prev, closing_message: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                            rows={2}
                            placeholder="e.g., We're excited to share these practical AI solutions with you..."
                          />
                        </div>
                      </div>
                    </div>

                    {/* Note about Global Signature */}
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <h3 className="text-sm font-medium text-blue-900 mb-2">📝 Signature Information</h3>
                      <p className="text-sm text-blue-800">
                        Signature details are managed globally in the Global Template Settings. 
                        The global signature will be used for all emails to maintain consistency.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'text' && (
                <div className="flex-1 p-4 min-h-0 overflow-hidden">
                  <textarea
                    value={formData.textBody}
                    onChange={(e) => setFormData(prev => ({ ...prev, textBody: e.target.value }))}
                    onKeyDown={(e) => {
                      // Allow Shift+Enter for new lines, prevent Enter from submitting form
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        return false;
                      }
                    }}
                    className="w-full h-full resize-none border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white overflow-y-auto"
                    placeholder="Enter plain text content..."
                  />
                </div>
              )}
            </div>
          </div>

          {/* Right Panel - Preview */}
          <div className="w-full lg:w-1/2 flex flex-col min-h-0">
            {/* Preview Header */}
            <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center flex-shrink-0">
              <div className="flex items-center space-x-2">
                <h3 className="font-medium">Live Preview</h3>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs text-green-600">Live</span>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => setPreviewMode('desktop')}
                  className={`px-3 py-1 text-sm rounded ${
                    previewMode === 'desktop'
                      ? 'bg-blue-100 text-blue-800'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Desktop
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewMode('mobile')}
                  className={`px-3 py-1 text-sm rounded ${
                    previewMode === 'mobile'
                      ? 'bg-blue-100 text-blue-800'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Mobile
                </button>
              </div>
            </div>

            {/* Preview Content */}
            <div className="flex-1 p-4 overflow-y-auto bg-gray-100 min-h-0">
              {previewMode === 'mobile' ? (
                // Mobile Email Preview
                <div className="mx-auto max-w-sm bg-black rounded-lg shadow-sm overflow-hidden">
                  {/* Mobile Email Client Header */}
                  <div className="bg-gray-800 text-white p-3 text-sm flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-blue-500 rounded-full"></div>
                      <span>Mail</span>
                    </div>
                    <div className="text-xs text-gray-300">10:30 AM</div>
                  </div>
                  
                  {/* Mobile Email Header */}
                  <div className="bg-gray-50 p-3 border-b border-gray-200 text-xs">
                    <div className="font-semibold text-gray-800">{formData.subject}</div>
                    <div className="text-gray-600 mt-1">Gabriel Lacroix &lt;gabriel@evergreenwebsolutions.ca&gt;</div>
                    <div className="text-gray-500">to me</div>
                  </div>
                  
                  {/* Mobile Email Body */}
                  <div 
                    key={previewKey}
                    className="p-3 text-sm"
                    dangerouslySetInnerHTML={{ __html: previewHTML }}
                  />
                </div>
              ) : (
                // Desktop Email Preview
                <div className="mx-auto max-w-4xl bg-white rounded-lg shadow-sm border border-gray-200">
                  {/* Desktop Email Client Header */}
                  <div className="bg-gray-100 border-b border-gray-200 p-3 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-8 h-8 bg-blue-500 rounded-full"></div>
                      <div>
                        <div className="font-medium text-gray-800">Gmail</div>
                        <div className="text-xs text-gray-600">Inbox (1)</div>
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">10:30 AM</div>
                  </div>
                  
                  {/* Desktop Email Header */}
                  <div className="bg-gray-50 p-4 border-b border-gray-200">
                    <div className="flex items-start justify-between mb-2">
                      <div className="text-lg font-semibold text-gray-800">{formData.subject}</div>
                      <div className="text-sm text-gray-500">Today 10:30 AM</div>
                    </div>
                    <div className="text-sm text-gray-600">
                      <div><strong>From:</strong> Gabriel Lacroix &lt;gabriel@evergreenwebsolutions.ca&gt;</div>
                      <div><strong>To:</strong> me</div>
                    </div>
                  </div>
                  
                  {/* Desktop Email Body */}
                  <div 
                    key={previewKey}
                    className="p-6"
                    dangerouslySetInnerHTML={{ __html: previewHTML }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
        </form>
      </div>
    </div>
  );
}

// Export the component wrapped with error boundary
export default function TemplateEditorWithErrorBoundary(props: TemplateEditorProps) {
  return (
    <TemplateEditorErrorBoundary>
      <TemplateEditor {...props} />
    </TemplateEditorErrorBoundary>
  );
}
