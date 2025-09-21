'use client';

import { useState, useEffect } from 'react';
import { CampaignTemplate } from '@prisma/client';
import { generateEmailHTML, generateEmailText } from '@/lib/email-template';

interface TemplateEditorProps {
  template: CampaignTemplate;
  onSave: (updatedTemplate: Partial<CampaignTemplate>) => Promise<void>;
  onCancel: () => void;
}

export default function TemplateEditor({ template, onSave, onCancel }: TemplateEditorProps) {
  const [formData, setFormData] = useState({
    name: template.name,
    subject: template.subject,
    htmlBody: template.htmlBody,
    textBody: template.textBody || '',
  });
  
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'html' | 'text' | 'preview'>('html');
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');

  // Auto-refresh preview when content changes
  const [previewKey, setPreviewKey] = useState(0);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setPreviewKey(prev => prev + 1); // Force preview re-render
    }, 300); // Debounce updates
    return () => clearTimeout(timer);
  }, [formData.htmlBody, formData.subject]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave({
        name: formData.name,
        subject: formData.subject,
        htmlBody: formData.htmlBody,
        textBody: formData.textBody,
      });
    } catch (error) {
      console.error('Error saving template:', error);
      alert('Failed to save template');
    } finally {
      setIsSaving(false);
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

  const getPreviewHTML = () => {
    // Replace variables with sample data for preview
    let content = formData.htmlBody;
    content = content.replace(/\{\{business_name\}\}/g, 'Sample Business Name');
    content = content.replace(/\{\{business_id\}\}/g, 'sample-business-123');
    content = content.replace(/\{\{invite_link\}\}/g, 'https://rsvp.evergreenwebsolutions.ca/rsvp/sample-business-123');
    content = content.replace(/\{\{.*?\}\}/g, 'Sample Data');
    
    // Generate preview using global template
    return generateEmailHTML({
      subject: formData.subject,
      greeting: 'Hi Sample Business Name,',
      body: content,
      ctaText: 'View details & RSVP',
      ctaLink: 'https://rsvp.evergreenwebsolutions.ca/rsvp/sample-business-123',
    });
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
              disabled={isSaving}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 text-sm sm:text-base"
            >
              {isSaving && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
              <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
            </button>
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
              <button
                type="button"
                onClick={() => setActiveTab('preview')}
                className={`px-4 py-2 text-sm font-medium ${
                  activeTab === 'preview'
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Live Preview
              </button>
            </div>

            {/* Editor */}
            <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
              {activeTab === 'html' && (
                <>
                  {/* Variable Insertion */}
                  <div className="p-3 border-b border-gray-200 bg-gray-50 flex-shrink-0">
                    <div className="text-xs text-gray-500 mb-2">
                      💡 Write just the message content here. Use HTML tags like &lt;p&gt;, &lt;strong&gt;, &lt;em&gt;, etc. Styling and layout are handled automatically by the global template.
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <span className="text-sm text-gray-600 mr-2">Insert variables:</span>
                      {['{{business_name}}', '{{business_id}}', '{{invite_link}}'].map(variable => (
                        <button
                          key={variable}
                          type="button"
                          onClick={() => insertVariable(variable)}
                          className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
                        >
                          {variable}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {/* HTML Editor */}
                  <div className="flex-1 p-4 min-h-0 overflow-hidden">
                    <textarea
                      id="htmlBody"
                      value={formData.htmlBody}
                      onChange={(e) => setFormData(prev => ({ ...prev, htmlBody: e.target.value }))}
                      className="w-full h-full resize-none border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm text-gray-900 bg-white overflow-y-auto"
                      placeholder="<p>Write your email content here...</p><p>You can use HTML tags like <strong>bold</strong> and <em>italic</em>.</p>"
                    />
                  </div>
                </>
              )}

              {activeTab === 'text' && (
                <div className="flex-1 p-4 min-h-0 overflow-hidden">
                  <textarea
                    value={formData.textBody}
                    onChange={(e) => setFormData(prev => ({ ...prev, textBody: e.target.value }))}
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
              <div className={`mx-auto bg-white rounded-lg shadow-sm ${
                previewMode === 'mobile' ? 'max-w-sm' : 'max-w-2xl'
              }`}>
                {/* Email Header Preview */}
                <div className="p-4 border-b border-gray-200 bg-gray-50 text-sm text-gray-600">
                  <div><strong>To:</strong> sample@business.com</div>
                  <div><strong>From:</strong> Gabriel Lacroix &lt;gabriel@evergreenwebsolutions.ca&gt;</div>
                  <div><strong>Subject:</strong> {formData.subject}</div>
                </div>
                
                {/* Email Body Preview */}
                <div 
                  key={previewKey}
                  className="p-4"
                  dangerouslySetInnerHTML={{ __html: getPreviewHTML() }}
                />
              </div>
            </div>
          </div>
        </div>
        </form>
      </div>
    </div>
  );
}
