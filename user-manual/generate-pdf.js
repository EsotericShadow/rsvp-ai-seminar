const fs = require('fs');
const path = require('path');

// Read all markdown files
const readmeContent = fs.readFileSync(path.join(__dirname, 'README.md'), 'utf8');
const quickStartContent = fs.readFileSync(path.join(__dirname, 'QUICK-START-GUIDE.md'), 'utf8');
const adminFeaturesContent = fs.readFileSync(path.join(__dirname, 'ADMIN-FEATURES-GUIDE.md'), 'utf8');
const rsvpGuideContent = fs.readFileSync(path.join(__dirname, 'RSVP-GUIDE.md'), 'utf8');

// Convert markdown to HTML with mobile-friendly styling
function markdownToHtml(markdown) {
  return markdown
    // Headers
    .replace(/^# (.*$)/gim, '<h1 style="color: #2563eb; font-size: 2rem; margin: 2rem 0 1rem 0; border-bottom: 3px solid #2563eb; padding-bottom: 0.5rem;">$1</h1>')
    .replace(/^## (.*$)/gim, '<h2 style="color: #1e40af; font-size: 1.5rem; margin: 1.5rem 0 0.75rem 0; border-left: 4px solid #2563eb; padding-left: 1rem;">$1</h2>')
    .replace(/^### (.*$)/gim, '<h3 style="color: #1e3a8a; font-size: 1.25rem; margin: 1.25rem 0 0.5rem 0;">$1</h3>')
    .replace(/^#### (.*$)/gim, '<h4 style="color: #1e3a8a; font-size: 1.1rem; margin: 1rem 0 0.5rem 0;">$1</h4>')
    
    // Bold text
    .replace(/\*\*(.*?)\*\*/g, '<strong style="color: #1e40af; font-weight: 600;">$1</strong>')
    
    // Italic text
    .replace(/\*(.*?)\*/g, '<em style="color: #64748b;">$1</em>')
    
    // Code blocks
    .replace(/```([\s\S]*?)```/g, '<pre style="background: #f1f5f9; border: 1px solid #e2e8f0; border-radius: 0.5rem; padding: 1rem; margin: 1rem 0; overflow-x: auto; font-family: monospace; font-size: 0.875rem;"><code>$1</code></pre>')
    
    // Inline code
    .replace(/`([^`]+)`/g, '<code style="background: #f1f5f9; border: 1px solid #e2e8f0; border-radius: 0.25rem; padding: 0.125rem 0.25rem; font-family: monospace; font-size: 0.875rem;">$1</code>')
    
    // Lists
    .replace(/^\* (.*$)/gim, '<li style="margin: 0.25rem 0; padding-left: 0.5rem;">$1</li>')
    .replace(/^- (.*$)/gim, '<li style="margin: 0.25rem 0; padding-left: 0.5rem;">$1</li>')
    .replace(/^\d+\. (.*$)/gim, '<li style="margin: 0.25rem 0; padding-left: 0.5rem;">$1</li>')
    
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" style="color: #2563eb; text-decoration: underline;">$1</a>')
    
    // Horizontal rules
    .replace(/^---$/gim, '<hr style="border: none; border-top: 2px solid #e2e8f0; margin: 2rem 0;">')
    
    // Blockquotes
    .replace(/^> (.*$)/gim, '<blockquote style="border-left: 4px solid #2563eb; padding-left: 1rem; margin: 1rem 0; color: #64748b; font-style: italic;">$1</blockquote>')
    
    // Line breaks
    .replace(/\n\n/g, '</p><p style="margin: 0.75rem 0;">')
    .replace(/\n/g, '<br>');
}

// Create the complete HTML document
const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>RSVP AI Seminar - Complete User Manual</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            color: #1f2937;
            background: #ffffff;
            padding: 1rem;
            max-width: 800px;
            margin: 0 auto;
        }
        
        .container {
            background: white;
            border-radius: 0.5rem;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }
        
        .header {
            background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
            color: white;
            padding: 2rem;
            text-align: center;
        }
        
        .header h1 {
            font-size: 2.5rem;
            margin-bottom: 0.5rem;
            font-weight: 700;
        }
        
        .header p {
            font-size: 1.125rem;
            opacity: 0.9;
        }
        
        .content {
            padding: 2rem;
        }
        
        h1 {
            color: #2563eb;
            font-size: 2rem;
            margin: 2rem 0 1rem 0;
            border-bottom: 3px solid #2563eb;
            padding-bottom: 0.5rem;
        }
        
        h2 {
            color: #1e40af;
            font-size: 1.5rem;
            margin: 1.5rem 0 0.75rem 0;
            border-left: 4px solid #2563eb;
            padding-left: 1rem;
        }
        
        h3 {
            color: #1e3a8a;
            font-size: 1.25rem;
            margin: 1.25rem 0 0.5rem 0;
        }
        
        h4 {
            color: #1e3a8a;
            font-size: 1.1rem;
            margin: 1rem 0 0.5rem 0;
        }
        
        p {
            margin: 0.75rem 0;
            line-height: 1.7;
        }
        
        ul, ol {
            margin: 1rem 0;
            padding-left: 1.5rem;
        }
        
        li {
            margin: 0.25rem 0;
            padding-left: 0.5rem;
        }
        
        strong {
            color: #1e40af;
            font-weight: 600;
        }
        
        em {
            color: #64748b;
        }
        
        code {
            background: #f1f5f9;
            border: 1px solid #e2e8f0;
            border-radius: 0.25rem;
            padding: 0.125rem 0.25rem;
            font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
            font-size: 0.875rem;
        }
        
        pre {
            background: #f1f5f9;
            border: 1px solid #e2e8f0;
            border-radius: 0.5rem;
            padding: 1rem;
            margin: 1rem 0;
            overflow-x: auto;
            font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
            font-size: 0.875rem;
        }
        
        blockquote {
            border-left: 4px solid #2563eb;
            padding-left: 1rem;
            margin: 1rem 0;
            color: #64748b;
            font-style: italic;
        }
        
        hr {
            border: none;
            border-top: 2px solid #e2e8f0;
            margin: 2rem 0;
        }
        
        .toc {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 0.5rem;
            padding: 1.5rem;
            margin: 2rem 0;
        }
        
        .toc h2 {
            margin-top: 0;
            border: none;
            padding: 0;
        }
        
        .toc ul {
            list-style: none;
            padding-left: 0;
        }
        
        .toc li {
            margin: 0.5rem 0;
            padding-left: 0;
        }
        
        .toc a {
            color: #2563eb;
            text-decoration: none;
            font-weight: 500;
        }
        
        .toc a:hover {
            text-decoration: underline;
        }
        
        .section {
            margin: 3rem 0;
            padding: 2rem 0;
            border-top: 1px solid #e2e8f0;
        }
        
        .section:first-child {
            border-top: none;
        }
        
        .highlight {
            background: #fef3c7;
            border: 1px solid #f59e0b;
            border-radius: 0.5rem;
            padding: 1rem;
            margin: 1rem 0;
        }
        
        .highlight strong {
            color: #92400e;
        }
        
        .step {
            background: #f0f9ff;
            border: 1px solid #0ea5e9;
            border-radius: 0.5rem;
            padding: 1rem;
            margin: 1rem 0;
        }
        
        .step strong {
            color: #0c4a6e;
        }
        
        .warning {
            background: #fef2f2;
            border: 1px solid #ef4444;
            border-radius: 0.5rem;
            padding: 1rem;
            margin: 1rem 0;
        }
        
        .warning strong {
            color: #991b1b;
        }
        
        .success {
            background: #f0fdf4;
            border: 1px solid #22c55e;
            border-radius: 0.5rem;
            padding: 1rem;
            margin: 1rem 0;
        }
        
        .success strong {
            color: #166534;
        }
        
        .emoji {
            font-size: 1.2em;
            margin-right: 0.5rem;
        }
        
        @media (max-width: 768px) {
            body {
                padding: 0.5rem;
            }
            
            .header {
                padding: 1.5rem;
            }
            
            .header h1 {
                font-size: 2rem;
            }
            
            .content {
                padding: 1.5rem;
            }
            
            h1 {
                font-size: 1.75rem;
            }
            
            h2 {
                font-size: 1.375rem;
            }
            
            h3 {
                font-size: 1.125rem;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>RSVP AI Seminar</h1>
            <p>Complete User Manual</p>
        </div>
        
        <div class="content">
            <div class="toc">
                <h2>📋 Table of Contents</h2>
                <ul>
                    <li><a href="#getting-started">Getting Started</a></li>
                    <li><a href="#quick-start">Quick Start Guide</a></li>
                    <li><a href="#admin-features">Admin Features Guide</a></li>
                    <li><a href="#rsvp-guide">RSVP Guide for Attendees</a></li>
                    <li><a href="#troubleshooting">Troubleshooting</a></li>
                    <li><a href="#faq">Frequently Asked Questions</a></li>
                </ul>
            </div>
            
            <div class="section" id="getting-started">
                ${markdownToHtml(readmeContent)}
            </div>
            
            <div class="section" id="quick-start">
                <h1>🚀 Quick Start Guide</h1>
                ${markdownToHtml(quickStartContent)}
            </div>
            
            <div class="section" id="admin-features">
                <h1>🎛️ Admin Features Guide</h1>
                ${markdownToHtml(adminFeaturesContent)}
            </div>
            
            <div class="section" id="rsvp-guide">
                <h1>🎯 RSVP Guide for Attendees</h1>
                ${markdownToHtml(rsvpGuideContent)}
            </div>
            
            <div class="section" id="troubleshooting">
                <h1>🚨 Troubleshooting</h1>
                <p>For detailed troubleshooting information, see the individual guides above.</p>
            </div>
            
            <div class="section" id="faq">
                <h1>❓ Frequently Asked Questions</h1>
                <p>Comprehensive FAQ sections are included in each guide above.</p>
            </div>
        </div>
    </div>
</body>
</html>
`;

// Write the HTML file
fs.writeFileSync(path.join(__dirname, 'user-manual.html'), htmlContent);

console.log('✅ HTML user manual generated successfully!');
console.log('📱 Mobile-optimized and ready for PDF conversion');
console.log('📄 Open user-manual.html in your browser to preview');
console.log('🖨️ Use "Print to PDF" in your browser for the final PDF');




