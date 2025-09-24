'use client';

import { useState, useEffect } from 'react';

interface HTMLEditorProps {
  initialHTML?: string;
  onSave?: (html: string) => void;
  onCancel?: () => void;
}

export default function HTMLEditor({ initialHTML = '', onSave, onCancel }: HTMLEditorProps) {
  const [html, setHtml] = useState(initialHTML);
  const [previewKey, setPreviewKey] = useState(0);
  const [activeTab, setActiveTab] = useState<'html' | 'preview'>('html');
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');

  // Auto-refresh preview when HTML changes
  useEffect(() => {
    const timer = setTimeout(() => {
      setPreviewKey(prev => prev + 1); // Force preview re-render
    }, 300); // Debounce updates
    return () => clearTimeout(timer);
  }, [html]);

  const handleSave = () => {
    if (onSave) {
      onSave(html);
    }
  };

  const insertSnippet = (snippet: string) => {
    const textarea = document.getElementById('htmlEditor') as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = textarea.value;
      const before = text.substring(0, start);
      const after = text.substring(end);
      const newText = before + snippet + after;
      
      setHtml(newText);
      
      // Restore cursor position
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + snippet.length, start + snippet.length);
      }, 0);
    }
  };

  const commonSnippets = [
    { name: 'Paragraph', code: '<p>Your text here</p>' },
    { name: 'Heading 1', code: '<h1>Your heading</h1>' },
    { name: 'Heading 2', code: '<h2>Your heading</h2>' },
    { name: 'Bold', code: '<strong>Bold text</strong>' },
    { name: 'Italic', code: '<em>Italic text</em>' },
    { name: 'Link', code: '<a href="https://example.com">Link text</a>' },
    { name: 'Button', code: '<a href="#" style="display:inline-block;padding:12px 20px;border-radius:999px;background:#22c55e;color:#ffffff;font-weight:600;text-decoration:none;">Button Text</a>' },
    { name: 'Div Container', code: '<div class="container">\n  <!-- Your content here -->\n</div>' },
    { name: 'Table', code: '<table border="1" cellpadding="10">\n  <tr>\n    <th>Header 1</th>\n    <th>Header 2</th>\n  </tr>\n  <tr>\n    <td>Cell 1</td>\n    <td>Cell 2</td>\n  </tr>\n</table>' },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center p-2 sm:p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-lg max-w-7xl w-full max-h-[98vh] sm:max-h-[95vh] overflow-hidden flex flex-col my-4 sm:my-8">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center flex-shrink-0">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">HTML Editor</h2>
            <p className="text-sm text-gray-600">Edit raw HTML code with live preview</p>
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
              Save HTML
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
            HTML Code
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
        <div className="flex-1 flex min-h-0">
          {activeTab === 'html' ? (
            <>
              {/* Left Panel - HTML Editor */}
              <div className="w-full lg:w-1/2 flex flex-col min-h-0">
                {/* Snippet Insertion */}
                <div className="p-3 border-b border-gray-200 bg-gray-50 flex-shrink-0">
                  <div className="text-xs text-gray-500 mb-2">
                    💡 Insert common HTML snippets:
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {commonSnippets.map((snippet) => (
                      <button
                        key={snippet.name}
                        type="button"
                        onClick={() => insertSnippet(snippet.code)}
                        className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
                      >
                        {snippet.name}
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
                    placeholder="Write your HTML code here...&#10;&#10;Example:&#10;&lt;h1&gt;Hello World&lt;/h1&gt;&#10;&lt;p&gt;This is a paragraph.&lt;/p&gt;&#10;&lt;a href='https://example.com'&gt;Visit our site&lt;/a&gt;"
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
                    // Mobile Preview
                    <div className="mx-auto max-w-sm bg-black rounded-lg shadow-sm overflow-hidden">
                      <div className="bg-gray-800 text-white p-3 text-sm flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 bg-blue-500 rounded-full"></div>
                          <span>Browser</span>
                        </div>
                        <div className="text-xs text-gray-300">10:30 AM</div>
                      </div>
                      <div 
                        key={previewKey}
                        className="p-3 text-sm bg-white"
                        dangerouslySetInnerHTML={{ __html: html }}
                      />
                    </div>
                  ) : (
                    // Desktop Preview
                    <div className="mx-auto max-w-4xl bg-white rounded-lg shadow-sm border border-gray-200">
                      <div className="bg-gray-100 border-b border-gray-200 p-3 flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-8 h-8 bg-blue-500 rounded-full"></div>
                          <div>
                            <div className="font-medium text-gray-800">Browser</div>
                            <div className="text-xs text-gray-600">Preview</div>
                          </div>
                        </div>
                        <div className="text-sm text-gray-500">10:30 AM</div>
                      </div>
                      <div 
                        key={previewKey}
                        className="p-6"
                        dangerouslySetInnerHTML={{ __html: html }}
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
                      dangerouslySetInnerHTML={{ __html: html }}
                    />
                  </div>
                ) : (
                  <div className="mx-auto max-w-6xl bg-white rounded-lg shadow-sm border border-gray-200">
                    <div 
                      key={previewKey}
                      className="p-8"
                      dangerouslySetInnerHTML={{ __html: html }}
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






