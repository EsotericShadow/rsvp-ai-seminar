import { NextRequest, NextResponse } from 'next/server';

// Store global template in memory for now (in production, use database)
let globalTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge" />
    <title>{{subject}}</title>
    
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
    
    <style>
        .evergreen-body {
            display: block;
            padding: 0px;
            margin: 0px;
        }

        .evergreen-wrapper {
            width: 100%;
            display: block;
            overflow: hidden;
            box-sizing: border-box;
            color: #222;
            background: #f0fdf4;
            font-size: 18px;
            font-weight: normal;
            font-family: 'Inter', 'Open Sans', 'Roboto', 'Segoe UI', 'Helvetica Neue', Helvetica, Tahoma, Arial, monospace, sans-serif;
        }

        .evergreen-table {
            border-collapse: collapse;
            border-spacing: 0;
            border: 0px;
            width: 640px;
            max-width: 90%;
            margin: 40px auto;
            box-shadow: 0px 20px 48px rgba(16, 185, 129, 0.15);
            border-radius: 12px;
            overflow: hidden;
        }

        .evergreen-table tr {
            background: #ffffff;
        }

        .evergreen-table td,
        .evergreen-table th {
            border: 0px;
            border-spacing: 0;
            border-collapse: collapse;
        }

        .evergreen-table tr td {
            padding: 0px 40px;
            box-sizing: border-box;
        }

        .evergreen-margin {
            float: left;
            width: 100%;
            overflow: hidden;
            height: 40px;
            padding-bottom: 0px;
            box-sizing: border-box;
        }

        .evergreen-div {
            float: left;
            width: 100%;
            overflow: hidden;
            box-sizing: border-box;
        }

        .evergreen-table h1,
        .evergreen-table h2,
        .evergreen-table h3,
        .evergreen-table h4 {
            float: left;
            width: 100%;
            margin: 0px 0px 20px 0px !important;
            padding: 0px;
        }

        .evergreen-table h1 {
            font-size: 33px;
            color: #10b981;
        }

        .evergreen-table h2 {
            font-size: 26px;
            color: #059669;
        }

        .evergreen-table h3 {
            font-size: 23px;
            color: #047857;
        }

        .evergreen-table p {
            float: left;
            width: 100%;
            font-size: 18px;
            margin: 0px 0px 20px 0px !important;
            color: #374151;
        }

        .evergreen-table h4 {
            font-size: 20px;
            color: #047857;
        }

        .evergreen-table a {
            color: #10b981;
            font-weight: 600;
        }

        .evergreen-table a:hover {
            color: #059669;
        }

        .evergreen-table a:active {
            color: #047857;
        }

        .evergreen-table a:visited {
            color: #065f46;
        }

        .evergreen-table a.evergreen-link {
            display: inline-block;
            width: auto !important;
            outline: none !important;
            text-decoration: none !important;
        }

        .evergreen-table img,
        .evergreen-table a img {
            display: block;
            max-width: 100%;
            margin-bottom: 20px;
            border: 0px;
            border-radius: 10px;
            overflow: hidden;
        }

        .evergreen-table a.evergreen-button {
            display: inline-block;
            font-weight: 700;
            font-size: 17px;
            padding: 15px 40px;
            margin: 20px 0px;
            color: #ffffff !important;
            background: linear-gradient(135deg, #10b981 0%, #059669 100%) !important;
            border-radius: 10px;
            text-decoration: none;
            outline: none;
            box-shadow: 0 4px 14px rgba(16, 185, 129, 0.3);
        }

        .evergreen-table a.evergreen-button:hover {
            color: #ffffff !important;
            background: linear-gradient(135deg, #059669 0%, #047857 100%) !important;
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
        }

        .evergreen-code {
            float: left;
            width: 100%;
            overflow: hidden;
            box-sizing: border-box;
            padding: 15px 40px;
            margin: 20px 0px;
            border: 2px dashed #10b981;
            background: #f0fdf4;
            color: #059669;
            font-weight: 700;
            font-size: 23px;
            border-radius: 8px;
        }

        .evergreen-flex {
            float: left;
            width: 100%;
            text-align: center;
        }

        .evergreen-divider {
            float: left;
            width: 100%;
            overflow: hidden;
            margin: 20px 0px;
            border-top: 2px solid #f0fdf4;
        }

        .evergreen-logo {
            width: 80px;
            height: 80px;
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            border-radius: 50%;
            display: inline-block;
            margin: 20px 0;
            position: relative;
        }

        .evergreen-logo::before {
            content: "🌲";
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-size: 40px;
        }

        .evergreen-signature {
            background: #f0fdf4;
            padding: 20px;
            border-radius: 10px;
            border-left: 4px solid #10b981;
            margin: 20px 0;
        }

        .evergreen-social {
            display: inline-block;
            width: 40px;
            height: 40px;
            background: #10b981;
            border-radius: 50%;
            margin: 5px;
            position: relative;
        }

        .evergreen-social::before {
            content: "";
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 20px;
            height: 20px;
            background: #ffffff;
            border-radius: 3px;
        }

        @media (max-width: 640px) {
            .evergreen-table {
                width: 95%;
                margin: 20px auto;
            }
            
            .evergreen-table tr td {
                padding: 0px 20px;
            }
            
            .evergreen-table h1 {
                font-size: 28px;
            }
            
            .evergreen-table h2 {
                font-size: 22px;
            }
            
            .evergreen-table p {
                font-size: 16px;
            }
        }
    </style>
</head>

<body class="evergreen-body">
    <div class="evergreen-wrapper">
        <table class="evergreen-table">
            <tbody>
                <tr class="evergreen-tr">
                    <td class="evergreen-td" colspan="10" style="">
                        <div class="evergreen-margin"></div>
                        <center>
                            <h1>{{subject}}</h1>
                            <div class="evergreen-logo"></div>
                        </center>
                        
                        <h2>{{greeting_title}}</h2>
                        <p>{{greeting_message}}</p>
                        
                        <div class="evergreen-signature">
                            <p><strong>{{signature_name}}</strong><br>
                            {{signature_title}}<br>
                            {{signature_company}}<br>
                            {{signature_location}}</p>
                        </div>
                    </td>
                </tr>

                <tr class="evergreen-tr">
                    <td class="evergreen-td" colspan="10" style="">
                        <h2>{{main_content_title}}</h2>
                        <p>{{main_content_body}}</p>
                    </td>
                </tr>

                <tr class="evergreen-tr">
                    <td class="evergreen-td" colspan="10" style="">
                        <center>
                            <a href="{{button_link}}" class="evergreen-button" target="_blank">{{button_text}}</a>
                        </center>
                    </td>
                </tr>

                <tr class="evergreen-tr">
                    <td class="evergreen-td" colspan="10" style="">
                        <h2>{{additional_info_title}}</h2>
                        <p>{{additional_info_body}}</p>
                    </td>
                </tr>

                <tr class="evergreen-tr">
                    <td class="evergreen-td" colspan="10" style="">
                        <br />
                        <h3>{{closing_title}}</h3>
                        <p>
                            {{closing_message}}<br />
                            {{closing_signature}}
                        </p>
                    </td>
                </tr>

                <tr class="evergreen-tr">
                    <td class="evergreen-td" colspan="10" style="">
                        <div class="evergreen-divider"></div>
                        <center>
                            <span style="color: #6b7280">© 2025 Gabriel Lacroix - Evergreen Web Solutions, Terrace BC</span>
                        </center>
                        <div class="evergreen-flex">
                            <a href="mailto:gabriel@evergreenwebsolutions.ca" class="evergreen-link">
                                <div class="evergreen-social"></div>
                            </a>
                            <a href="https://evergreenwebsolutions.ca" class="evergreen-link">
                                <div class="evergreen-social"></div>
                            </a>
                            <a href="{{unsubscribe_link}}" class="evergreen-link">
                                <div class="evergreen-social"></div>
                            </a>
                        </div>
                        <div class="evergreen-margin"></div>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</body>
</html>`;

export async function GET() {
  try {
    return NextResponse.json({ html: globalTemplate });
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

    // Update global template
    globalTemplate = html;

    return NextResponse.json({ 
      message: 'Global template updated successfully',
      html: globalTemplate 
    });
  } catch (error) {
    console.error('Error updating global template:', error);
    return NextResponse.json({ error: 'Failed to update global template' }, { status: 500 });
  }
}
