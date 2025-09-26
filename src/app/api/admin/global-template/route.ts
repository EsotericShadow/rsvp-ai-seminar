import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

const defaultGlobalTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>{{subject}}</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
    <style>
        /* Reset & base */
        html,body{margin:0;padding:0;width:100% !important;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;}
        body{background:#f0fdf4;font-family:'Inter',system-ui,-apple-system,"Segoe UI",Roboto,Arial,sans-serif;color:#222;}
        img{display:block;border:0;outline:none;text-decoration:none;}
        a{color:#10b981;text-decoration:none;}
        
        /* Wrapper */
        .evergreen-wrapper{width:100%;max-width:640px;margin:40px auto;box-sizing:border-box;padding:0;}
        .evergreen-table{width:100%;border-collapse:collapse;box-shadow:0 20px 48px rgba(16,185,129,0.15);border-radius:12px;overflow:hidden;background:#fff;}
        
        /* Typography */
        h1,h2,h3,h4,p{margin:0 0 12px 0;padding:0;line-height:1.3;}
        h1{font-size:28px;color:#10b981;font-weight:700;}
        h2{font-size:20px;color:#047857;font-weight:600;}
        h3{font-size:18px;color:#047857;font-weight:600;}
        p{font-size:16px;color:#374151;margin-bottom:12px;}
        
        /* Header / logo */
        .evergreen-header{padding:24px;text-align:center;}
        .evergreen-logo{max-width:240px;height:auto;margin:8px auto;display:block;}
        
        /* HERO nested table */
        .hero-inner{width:100%;border-radius:8px;overflow:hidden;}
        .hero-left{width:8px;background:#10b981;vertical-align:top;}
        .hero-right{vertical-align:middle;padding:18px 16px;background-color:#e6f9ef; /* fallback */ background-color:rgba(16,185,129,0.06); border-radius:0 8px 8px 0;}
        .hero-title{font-size:20px;color:#065f46;font-weight:700;margin-bottom:6px;}
        .hero-sub{font-size:14px;color:#065f46;margin:0;}
        
        /* Content blocks */
        .content-cell{padding:18px 24px;}
        .evergreen-signature{background:#f0fdf4;padding:14px;border-radius:8px;border-left:4px solid #10b981;margin:14px 0;}
        .btn{display:inline-block;padding:12px 28px;border-radius:10px;font-weight:700;color:#fff !important;background:linear-gradient(135deg,#10b981 0%,#059669 100%);text-decoration:none;box-shadow:0 4px 14px rgba(16,185,129,0.3);}
        
        /* Event details section */
        .event-details{background:#f8fafc;padding:16px;border-radius:8px;border:1px solid #e2e8f0;margin:14px 0;}
        .event-details h3{color:#1e293b;margin-bottom:8px;}
        .event-details p{margin-bottom:4px;color:#475569;}
        
        /* Divider & footer */
        .divider{border-top:1px solid #f0fdf4;margin:16px 0;}
        .footer{padding:12px 24px 28px 24px;text-align:center;color:#6b7280;font-size:13px;}
        .social-link{display:inline-block;margin:6px 10px;text-decoration:none;color:#065f46;font-weight:600;}
        .sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0;}
        
        @media (max-width:480px){
            h1{font-size:22px;}
            .hero-title{font-size:18px;}
            .content-cell{padding:12px 16px;}
            .evergreen-wrapper{margin:16px auto;}
            .social-link{display:block;padding:8px 0;}
        }
    </style>
</head>
<body>
    <div class="evergreen-wrapper">
        <table class="evergreen-table" role="presentation" cellpadding="0" cellspacing="0" aria-hidden="false">
            <tbody>
                <!-- Header -->
                <tr>
                    <td class="evergreen-header" style="padding-top:22px;padding-bottom:8px;">
                        <h1 style="margin-bottom:6px;">{{subject}}</h1>
                        <img src="https://www.evergreenwebsolutions.ca/_next/image?url=%2Flogo.png&w=640&q=75" alt="Evergreen Web Solutions" class="evergreen-logo" style="max-width:120px;height:auto;" />
                    </td>
                </tr>
                
                <!-- HERO (vertical bar + translucent fill) -->
                <tr>
                    <td style="padding:0 24px 0 24px;">
                        <table class="hero-inner" role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-collapse:collapse;">
                            <tr>
                                <td class="hero-left" width="8" style="background:#10b981;"></td>
                                <td class="hero-right" style="background-color:#e6f9ef; background-color:rgba(16,185,129,0.06);">
                                    <div>
                                        <div class="hero-title">{{global_hero_title}}</div>
                                        <p class="hero-sub">{{global_hero_message}}</p>
                                    </div>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
                
                <!-- Greeting Title -->
                <tr>
                    <td class="content-cell" style="padding-top:16px;">
                        <h2>{{greeting_title}}</h2>
                    </td>
                </tr>
                
                <!-- Main content title + body -->
                <tr>
                    <td class="content-cell">
                        <h2 style="margin-top:0;">{{main_content_title}}</h2>
                        <p style="margin-top:6px;margin-bottom:12px;">{{main_content_body}}</p>
                    </td>
                </tr>
                
                <!-- Button -->
                <tr>
                    <td class="content-cell" style="text-align:center;padding-bottom:12px;">
                        <a href="{{button_link}}" target="_blank" class="btn" style="display:inline-block;">{{button_text}}</a>
                    </td>
                </tr>
                
                <!-- Event Details -->
                <tr>
                    <td class="content-cell">
                        <div class="event-details">
                            <h3>{{global_event_title}}</h3>
                            <p><strong>Date:</strong> {{global_event_date}}</p>
                            <p><strong>Time:</strong> {{global_event_time}}</p>
                            <p><strong>Location:</strong> {{global_event_location}}</p>
                            <p><strong>Cost:</strong> {{global_event_cost}}</p>
                            <p><strong>Includes:</strong> {{global_event_includes}}</p>
                        </div>
                    </td>
                </tr>
                
                <!-- Additional info -->
                <tr>
                    <td class="content-cell">
                        <h3 style="margin-top:0;">{{additional_info_title}}</h3>
                        <p>{{additional_info_body}}</p>
                    </td>
                </tr>
                
                <!-- Signature block (uses global signature variables) -->
                <tr>
                    <td class="content-cell">
                        <div class="evergreen-signature">
                            <p style="margin:0;"><strong>{{global_signature_name}}</strong><br>
                            {{global_signature_title}}<br>
                            {{global_signature_company}}<br>
                            {{global_signature_location}}</p>
                        </div>
                    </td>
                </tr>
                
                <!-- Closing -->
                <tr>
                    <td class="content-cell">
                        <h3 style="margin-top:0;">{{closing_title}}</h3>
                        <p style="margin-bottom:6px;">{{closing_message}}</p>
                    </td>
                </tr>
                
                <!-- Divider and footer with unsubscribe (VISIBLE) -->
                <tr>
                    <td style="padding:12px 24px 18px 24px;">
                        <div class="divider"></div>
                        <div class="footer" role="contentinfo" aria-label="Footer">
                            <div style="margin-bottom:8px;">© 2025 Gabriel Lacroix - Evergreen Web Solutions, Terrace BC</div>
                            
                            <!-- Social links: LinkedIn / Facebook / X (label + icon) -->
                            <div style="margin-bottom:12px; text-align:center;">
                                <!-- LinkedIn -->
                                <a href="https://www.linkedin.com/in/gabriel-marko-6b7aaa357/" target="_blank" rel="noopener noreferrer" class="social-link" aria-label="LinkedIn – opens in a new tab">
                                    <img src="{{base_url}}/linkedin-logo.webp" alt="LinkedIn" style="width:48px;height:48px;display:block;" />
                                </a>
                                
                                <!-- Facebook -->
                                <a href="https://www.facebook.com/share/14Exmoytvrs/?mibextid=wwXIfr" target="_blank" rel="noopener noreferrer" class="social-link" aria-label="Facebook – opens in a new tab">
                                    <img src="{{base_url}}/facebook-logo.webp" alt="Facebook" style="width:48px;height:48px;display:block;" />
                                </a>
                                
                                <!-- X (Twitter) -->
                                <a href="https://x.com/Evergreenweb3D" target="_blank" rel="noopener noreferrer" class="social-link" aria-label="X (Twitter) – opens in a new tab">
                                    <img src="{{base_url}}/twitter-logo.webp" alt="X (Twitter)" style="width:48px;height:48px;display:block;" />
                                </a>
                            </div>
                            
                            <!-- Visible unsubscribe text (required & obvious) -->
                            <div style="font-size:13px;color:#6b7280;">
                                If you no longer wish to receive these emails, <a href="{{unsubscribe_link}}" style="color:#065f46;font-weight:600;" target="_blank" rel="noopener noreferrer">unsubscribe here</a>.
                            </div>
                        </div>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</body>
</html>`;

export async function GET() {
  try {
    // Get the active global HTML template from database
    let globalTemplate = await prisma.globalHTMLTemplate.findFirst({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' }
    });

    // If no template exists, create the default one
    if (!globalTemplate) {
      globalTemplate = await prisma.globalHTMLTemplate.create({
        data: {
          html: defaultGlobalTemplate,
          isActive: true
        }
      });
    }

    return NextResponse.json({ html: globalTemplate.html });
  } catch (error) {
    console.error('Error fetching global template:', error);
    return NextResponse.json({ error: 'Failed to fetch global template' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { html } = await req.json();
    
    if (!html) {
      return NextResponse.json({ error: 'HTML content is required' }, { status: 400 });
    }

    // Deactivate all existing templates
    await prisma.globalHTMLTemplate.updateMany({
      where: { isActive: true },
      data: { isActive: false }
    });

    // Create new active template
    const newTemplate = await prisma.globalHTMLTemplate.create({
      data: {
        html: html,
        isActive: true
      }
    });

    return NextResponse.json({ 
      message: 'Global template updated successfully',
      html: newTemplate.html,
      id: newTemplate.id
    });
  } catch (error) {
    console.error('Error updating global template:', error);
    return NextResponse.json({ error: 'Failed to update global template' }, { status: 500 });
  }
}
