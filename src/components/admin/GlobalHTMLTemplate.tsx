'use client';

import { useState, useEffect } from 'react';

interface GlobalHTMLTemplateProps {
  onSave?: (html: string) => void;
  onCancel?: () => void;
}

export default function GlobalHTMLTemplate({ onSave, onCancel }: GlobalHTMLTemplateProps) {
  const [html, setHtml] = useState('');
  const [previewKey, setPreviewKey] = useState(0);
  const [activeTab, setActiveTab] = useState<'html' | 'preview'>('html');
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');

  // Load current global template on mount
  useEffect(() => {
    const loadTemplate = async () => {
      try {
        const response = await fetch('/api/admin/global-template');
        if (response.ok) {
          const data = await response.json();
          setHtml(data.html || getDefaultTemplate());
        } else {
          setHtml(getDefaultTemplate());
        }
      } catch (error) {
        console.error('Failed to load global template:', error);
        setHtml(getDefaultTemplate());
      }
    };
    loadTemplate();
  }, []);

  // Auto-refresh preview when HTML changes
  useEffect(() => {
    const timer = setTimeout(() => {
      setPreviewKey(prev => prev + 1); // Force preview re-render
    }, 300); // Debounce updates
    return () => clearTimeout(timer);
  }, [html]);

  const getDefaultTemplate = () => {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{subject}}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            line-height: 1.6;
            color: #374151;
            background-color: #f8f8f8;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 20px auto;
            background-color: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
        .header {
            background: linear-gradient(to right, #10b981, #059669);
            color: #ffffff;
            padding: 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
        }
        .content {
            padding: 30px;
            color: #374151;
        }
        .content p {
            margin-bottom: 15px;
            color: #374151;
        }
        .button-container {
            text-align: center;
            margin: 30px 0;
        }
        .button {
            display: inline-block;
            background-color: #10b981;
            color: #ffffff;
            padding: 12px 25px;
            border-radius: 50px;
            text-decoration: none;
            font-weight: bold;
            font-size: 16px;
        }
        .footer {
            background-color: #f1f1f1;
            color: #6b7280;
            padding: 20px 30px;
            font-size: 12px;
            text-align: center;
            border-top: 1px solid #e5e7eb;
        }
        .footer a {
            color: #10b981;
            text-decoration: none;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Evergreen AI Seminar</h1>
        </div>
        <div class="content">
            {{content}}
            <div class="button-container">
                <a href="{{button_link}}" class="button">{{button_text}}</a>
            </div>
            <p>Looking forward to seeing you,</p>
            <p>Gabriel Lacroix<br>Evergreen Web Solutions</p>
        </div>
        <div class="footer">
            <p>You are receiving this email because you are a valued business in Northern BC.</p>
            <p>&copy; 2025 Evergreen Web Solutions. All rights reserved.</p>
            <p><a href="{{unsubscribe_link}}">Unsubscribe</a></p>
        </div>
    </div>
</body>
</html>`;
  };

  const handleSave = async () => {
    if (onSave) {
      onSave(html);
    } else {
      // Save to API
      try {
        const response = await fetch('/api/admin/global-template', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ html }),
        });
        
        if (response.ok) {
          alert('Global HTML template saved successfully!');
        } else {
          alert('Failed to save global template');
        }
      } catch (error) {
        console.error('Error saving global template:', error);
        alert('Failed to save global template');
      }
    }
  };

  const insertVariable = (variable: string) => {
    const textarea = document.getElementById('htmlEditor') as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = textarea.value;
      const before = text.substring(0, start);
      const after = text.substring(end);
      const newText = before + variable + after;
      
      setHtml(newText);
      
      // Restore cursor position
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + variable.length, start + variable.length);
      }, 0);
    }
  };

  const templateVariables = [
    { name: 'Subject', code: '{{subject}}', desc: 'Email subject line' },
    { name: 'Greeting Title', code: '{{greeting_title}}', desc: 'Greeting section title' },
    { name: 'Greeting Message', code: '{{greeting_message}}', desc: 'Greeting section content' },
    { name: 'Signature Name', code: '{{signature_name}}', desc: 'Your name (Gabriel Lacroix)' },
    { name: 'Signature Title', code: '{{signature_title}}', desc: 'Your title/role' },
    { name: 'Signature Company', code: '{{signature_company}}', desc: 'Company name' },
    { name: 'Signature Location', code: '{{signature_location}}', desc: 'Location (Terrace BC)' },
    { name: 'Main Content Title', code: '{{main_content_title}}', desc: 'Main content section title' },
    { name: 'Main Content Body', code: '{{main_content_body}}', desc: 'Main content section body' },
    { name: 'Button Text', code: '{{button_text}}', desc: 'Call-to-action button text' },
    { name: 'Button Link', code: '{{button_link}}', desc: 'Call-to-action button link' },
    { name: 'Additional Info Title', code: '{{additional_info_title}}', desc: 'Additional info section title' },
    { name: 'Additional Info Body', code: '{{additional_info_body}}', desc: 'Additional info section body' },
    { name: 'Closing Title', code: '{{closing_title}}', desc: 'Closing section title' },
    { name: 'Closing Message', code: '{{closing_message}}', desc: 'Closing message' },
    { name: 'Closing Signature', code: '{{closing_signature}}', desc: 'Closing signature' },
    { name: 'Unsubscribe Link', code: '{{unsubscribe_link}}', desc: 'Unsubscribe link' },
    // Global template variables
    { name: 'Global Hero Title', code: '{{global_hero_title}}', desc: 'Hero section title' },
    { name: 'Global Hero Message', code: '{{global_hero_message}}', desc: 'Hero section message' },
    { name: 'Global Signature Name', code: '{{global_signature_name}}', desc: 'Global signature name' },
    { name: 'Global Signature Title', code: '{{global_signature_title}}', desc: 'Global signature title' },
    { name: 'Global Signature Company', code: '{{global_signature_company}}', desc: 'Global signature company' },
    { name: 'Global Signature Location', code: '{{global_signature_location}}', desc: 'Global signature location' },
    { name: 'Global Event Title', code: '{{global_event_title}}', desc: 'Event details section title' },
    { name: 'Global Event Date', code: '{{global_event_date}}', desc: 'Event date' },
    { name: 'Global Event Time', code: '{{global_event_time}}', desc: 'Event time' },
    { name: 'Global Event Location', code: '{{global_event_location}}', desc: 'Event location' },
    { name: 'Global Event Cost', code: '{{global_event_cost}}', desc: 'Event cost' },
    { name: 'Global Event Includes', code: '{{global_event_includes}}', desc: 'What the event includes' },
  ];

  const getPreviewHTML = () => {
    return html
      .replace(/\{\{subject\}\}/g, 'Free AI Tools Session - October 23rd')
      // Individual template variables (these should be empty or minimal to avoid duplication)
      .replace(/\{\{greeting_title\}\}/g, '') // Empty to avoid duplication with global_hero_title
      .replace(/\{\{greeting_message\}\}/g, '') // Empty to avoid duplication with global_hero_message
      .replace(/\{\{signature_name\}\}/g, '') // Empty to avoid duplication with global_signature_name
      .replace(/\{\{signature_title\}\}/g, '') // Empty to avoid duplication with global_signature_title
      .replace(/\{\{signature_company\}\}/g, '') // Empty to avoid duplication with global_signature_company
      .replace(/\{\{signature_location\}\}/g, '') // Empty to avoid duplication with global_signature_location
      .replace(/\{\{main_content_title\}\}/g, 'What You\'ll Learn')
      .replace(/\{\{main_content_body\}\}/g, 'We\'ll cover practical AI tools that can help streamline your business operations, including spreadsheet automation, data analysis, and process optimization. All tools discussed are immediately actionable and cost-effective.')
      .replace(/\{\{button_text\}\}/g, 'RSVP for Free Session')
      .replace(/\{\{button_link\}\}/g, 'https://rsvp.evergreenwebsolutions.ca/rsvp?token=sample')
      .replace(/\{\{additional_info_title\}\}/g, '') // Empty to avoid duplication with global_event_title
      .replace(/\{\{additional_info_body\}\}/g, '') // Empty to avoid duplication with global event details
      .replace(/\{\{closing_title\}\}/g, 'Looking Forward')
      .replace(/\{\{closing_message\}\}/g, 'We\'re excited to share these practical AI solutions with you and help your business grow.')
      .replace(/\{\{closing_signature\}\}/g, '') // Empty to avoid duplication with global signature
      .replace(/\{\{unsubscribe_link\}\}/g, 'https://rsvp.evergreenwebsolutions.ca/unsubscribe?token=sample')
      // Global template variables (these are the primary content now)
      .replace(/\{\{global_hero_title\}\}/g, 'Welcome to Evergreen AI')
      .replace(/\{\{global_hero_message\}\}/g, 'Thank you for your interest in our upcoming informational session about practical AI tools for Northern BC businesses.')
      .replace(/\{\{global_signature_name\}\}/g, 'Gabriel Lacroix')
      .replace(/\{\{global_signature_title\}\}/g, 'AI Solutions Specialist')
      .replace(/\{\{global_signature_company\}\}/g, 'Evergreen Web Solutions')
      .replace(/\{\{global_signature_location\}\}/g, 'Terrace, BC')
      .replace(/\{\{global_event_title\}\}/g, 'Event Details')
      .replace(/\{\{global_event_date\}\}/g, 'October 23rd, 2025')
      .replace(/\{\{global_event_time\}\}/g, '6:00 PM - 8:00 PM')
      .replace(/\{\{global_event_location\}\}/g, 'Terrace, BC')
      .replace(/\{\{global_event_cost\}\}/g, 'Free')
      .replace(/\{\{global_event_includes\}\}/g, 'Coffee, refreshments, networking, and actionable AI insights');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center p-2 sm:p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-lg max-w-7xl w-full max-h-[98vh] sm:max-h-[95vh] overflow-y-auto flex flex-col my-4 sm:my-8">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center flex-shrink-0">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Global HTML Template</h2>
            <p className="text-sm text-gray-600">This template applies to ALL email templates. Individual templates only edit text content.</p>
          </div>
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Save Global Template
            </button>
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
            HTML Template
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

        {/* Main Content */}
        <div className="flex-1 flex min-h-0 overflow-y-auto">
          {activeTab === 'html' ? (
            <>
              {/* Left Panel - HTML Editor */}
              <div className="w-full lg:w-1/2 flex flex-col min-h-0">
                {/* Variable Insertion */}
                <div className="p-3 border-b border-gray-200 bg-gray-50 flex-shrink-0">
                  <div className="text-xs text-gray-500 mb-2">
                    💡 Insert template variables (these will be replaced when emails are sent):
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {templateVariables.map((variable) => (
                      <button
                        key={variable.name}
                        type="button"
                        onClick={() => insertVariable(variable.code)}
                        className="text-left p-2 text-xs bg-blue-100 text-blue-800 rounded hover:bg-blue-200 transition-colors"
                        title={variable.desc}
                      >
                        <div className="font-medium">{variable.name}</div>
                        <div className="text-blue-600 font-mono">{variable.code}</div>
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* HTML Editor */}
                <div className="flex-1 p-4 min-h-0 overflow-hidden">
                  <textarea
                    id="htmlEditor"
                    value={html}
                    onChange={(e) => setHtml(e.target.value)}
                    className="w-full h-full resize-none border border-gray-300 rounded-md p-3 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white overflow-y-auto"
                    placeholder="Write your global HTML template here...&#10;&#10;Use variables like {{content}} and {{button_text}} to insert dynamic content from individual email templates."
                  />
                </div>
              </div>

              {/* Right Panel - Preview */}
              <div className="w-full lg:w-1/2 flex flex-col min-h-0 border-l border-gray-200">
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
                      <div className="bg-gray-800 text-white p-3 text-sm flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 bg-blue-500 rounded-full"></div>
                          <span>Mail</span>
                        </div>
                        <div className="text-xs text-gray-300">10:30 AM</div>
                      </div>
                      
                      <div className="bg-white">
                        <div 
                          key={previewKey}
                          className="p-3 text-sm"
                          dangerouslySetInnerHTML={{ __html: getPreviewHTML() }}
                        />
                      </div>
                    </div>
                  ) : (
                    // Desktop Email Preview
                    <div className="mx-auto max-w-4xl bg-white rounded-lg shadow-sm border border-gray-200">
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
                      
                      <div 
                        key={previewKey}
                        className="p-6"
                        dangerouslySetInnerHTML={{ __html: getPreviewHTML() }}
                      />
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            // Full Preview Mode
            <div className="w-full flex flex-col min-h-0">
              {/* Preview Header */}
              <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center flex-shrink-0">
                <div className="flex items-center space-x-2">
                  <h3 className="font-medium">Full Preview</h3>
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

              {/* Full Preview Content */}
              <div className="flex-1 p-4 overflow-y-auto bg-gray-100 min-h-0">
                {previewMode === 'mobile' ? (
                  <div className="mx-auto max-w-sm bg-white rounded-lg shadow-sm overflow-hidden">
                    <div 
                      key={previewKey}
                      className="p-4"
                      dangerouslySetInnerHTML={{ __html: getPreviewHTML() }}
                    />
                  </div>
                ) : (
                  <div className="mx-auto max-w-6xl bg-white rounded-lg shadow-sm border border-gray-200">
                    <div 
                      key={previewKey}
                      className="p-8"
                      dangerouslySetInnerHTML={{ __html: getPreviewHTML() }}
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
