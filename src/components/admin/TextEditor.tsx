'use client';

import { useState, useEffect } from 'react';

interface TextEditorProps {
  initialText?: string;
  onSave?: (text: string) => void;
  onCancel?: () => void;
}

export default function TextEditor({ initialText = '', onSave, onCancel }: TextEditorProps) {
  const [text, setText] = useState(initialText);
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);

  // Update counts when text changes
  useEffect(() => {
    const words = text.trim().split(/\s+/).filter(word => word.length > 0).length;
    const chars = text.length;
    setWordCount(words);
    setCharCount(chars);
  }, [text]);

  const handleSave = () => {
    if (onSave) {
      onSave(text);
    }
  };

  const insertVariable = (variable: string) => {
    const textarea = document.getElementById('textEditor') as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const currentText = textarea.value;
      const before = currentText.substring(0, start);
      const after = currentText.substring(end);
      const newText = before + variable + after;
      
      setText(newText);
      
      // Restore cursor position
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + variable.length, start + variable.length);
      }, 0);
    }
  };

  const commonVariables = [
    '{{business_name}}',
    '{{business_id}}',
    '{{invite_link}}',
    '{{event_date}}',
    '{{event_time}}',
    '{{event_location}}',
  ];

  const textTemplates = [
    {
      name: 'Welcome Message',
      content: `Hi {{business_name}},

Thank you for your interest in our upcoming event.

We're excited to share that we'll be hosting a free informational session about AI tools for businesses on {{event_date}} at {{event_time}}.

This session will cover:
- Practical AI tools you can use immediately
- Real examples from local businesses
- Q&A session with industry experts

To RSVP, please visit: {{invite_link}}

Best regards,
Gabriel Lacroix
Evergreen Web Solutions`
    },
    {
      name: 'Reminder Message',
      content: `Hi {{business_name}},

This is a friendly reminder about our upcoming AI tools session on {{event_date}} at {{event_time}}.

We still have spots available and would love to see you there. The session will cover practical AI applications that can help streamline your business operations.

RSVP here: {{invite_link}}

Looking forward to seeing you!

Gabriel Lacroix
Evergreen Web Solutions`
    },
    {
      name: 'Follow-up Message',
      content: `Hi {{business_name}},

Thank you for attending our AI tools session. We hope you found the information valuable and practical for your business.

If you have any questions or would like to discuss how these tools could work specifically for your business, please don't hesitate to reach out.

We're here to help you implement these solutions and see real results.

Best regards,
Gabriel Lacroix
Evergreen Web Solutions`
    }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center p-2 sm:p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[98vh] sm:max-h-[95vh] overflow-hidden flex flex-col my-4 sm:my-8">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center flex-shrink-0">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Text Editor</h2>
            <p className="text-sm text-gray-600">Edit plain text content with variable insertion</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-600">
              <span className="font-medium">{wordCount}</span> words, <span className="font-medium">{charCount}</span> characters
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
                Save Text
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex min-h-0">
          {/* Left Panel - Editor */}
          <div className="w-full lg:w-2/3 flex flex-col min-h-0">
            {/* Variable Insertion */}
            <div className="p-3 border-b border-gray-200 bg-gray-50 flex-shrink-0">
              <div className="text-xs text-gray-500 mb-2">
                💡 Insert variables:
              </div>
              <div className="flex flex-wrap gap-2">
                {commonVariables.map((variable) => (
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
            
            {/* Text Editor */}
            <div className="flex-1 p-4 min-h-0 overflow-hidden">
              <textarea
                id="textEditor"
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="w-full h-full resize-none border border-gray-300 rounded-md p-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white overflow-y-auto font-mono"
                placeholder="Write your plain text content here...&#10;&#10;You can use variables like {{business_name}} and {{invite_link}} to personalize your messages.&#10;&#10;Tips:&#10;- Keep paragraphs short and scannable&#10;- Use bullet points for lists&#10;- Include a clear call-to-action&#10;- Personalize with business names and relevant details"
              />
            </div>
          </div>

          {/* Right Panel - Templates & Tools */}
          <div className="w-full lg:w-1/3 flex flex-col min-h-0 border-l border-gray-200 bg-gray-50">
            {/* Text Templates */}
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Text Templates</h3>
              <div className="space-y-2">
                {textTemplates.map((template) => (
                  <button
                    key={template.name}
                    type="button"
                    onClick={() => setText(template.content)}
                    className="w-full text-left p-3 text-xs bg-white border border-gray-200 rounded-md hover:bg-gray-50 hover:border-blue-300 transition-colors"
                  >
                    <div className="font-medium text-gray-900">{template.name}</div>
                    <div className="text-gray-600 mt-1 line-clamp-2">
                      {template.content.substring(0, 100)}...
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Text Statistics */}
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Text Statistics</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Words:</span>
                  <span className="font-medium">{wordCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Characters:</span>
                  <span className="font-medium">{charCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Lines:</span>
                  <span className="font-medium">{text.split('\n').length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Avg. words/line:</span>
                  <span className="font-medium">{text.split('\n').length > 0 ? Math.round(wordCount / text.split('\n').length) : 0}</span>
                </div>
              </div>
            </div>

            {/* Writing Tips */}
            <div className="p-4">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Writing Tips</h3>
              <div className="space-y-2 text-xs text-gray-600">
                <div className="flex items-start space-x-2">
                  <div className="w-1 h-1 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Keep paragraphs short (2-3 sentences)</span>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-1 h-1 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Use bullet points for lists</span>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-1 h-1 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Include clear call-to-action</span>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-1 h-1 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Personalize with {`{{business_name}}`}</span>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-1 h-1 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Aim for 50-200 words for emails</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
