const fs = require('fs');
const path = require('path');

// Read the generated HTML
const htmlContent = fs.readFileSync(path.join(__dirname, 'user-manual.html'), 'utf8');

// Create a PDF-ready HTML with print styles
const pdfHtml = htmlContent.replace('</head>', `
    <style>
        @media print {
            body {
                margin: 0;
                padding: 0;
                font-size: 12px;
                line-height: 1.4;
            }
            
            .container {
                box-shadow: none;
                border-radius: 0;
            }
            
            .header {
                background: #2563eb !important;
                -webkit-print-color-adjust: exact;
                color-adjust: exact;
                page-break-after: avoid;
            }
            
            .content {
                padding: 1rem;
            }
            
            h1 {
                page-break-after: avoid;
                font-size: 1.5rem;
            }
            
            h2 {
                page-break-after: avoid;
                font-size: 1.25rem;
            }
            
            h3 {
                page-break-after: avoid;
                font-size: 1.1rem;
            }
            
            .section {
                page-break-inside: avoid;
                margin: 1rem 0;
            }
            
            .toc {
                page-break-after: always;
            }
            
            pre {
                page-break-inside: avoid;
                font-size: 10px;
            }
            
            .highlight, .step, .warning, .success {
                page-break-inside: avoid;
            }
            
            @page {
                margin: 0.5in;
                size: A4;
            }
        }
    </style>
</head>`);

// Write the PDF-ready HTML
fs.writeFileSync(path.join(__dirname, 'user-manual-pdf.html'), pdfHtml);

console.log('✅ PDF-ready HTML generated!');
console.log('📄 Open user-manual-pdf.html in your browser');
console.log('🖨️ Use Ctrl+P (Cmd+P on Mac) and select "Save as PDF"');
console.log('📱 The PDF will be mobile-friendly and properly formatted');



