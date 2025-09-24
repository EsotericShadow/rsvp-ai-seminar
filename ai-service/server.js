const express = require('express');
const cors = require('cors');
const { ServerSideAIAgent } = require('./lib/agents/ServerSideAIAgent');

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize AI Agent
const aiAgent = new ServerSideAIAgent();

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'juniper-ai-service',
    timestamp: new Date().toISOString()
  });
});

// Authentication middleware
const authenticateRequest = (req, res, next) => {
  const apiKey = req.headers['x-api-key'] || req.headers['authorization']?.replace('Bearer ', '');
  const expectedApiKey = process.env.AI_SERVICE_API_KEY;
  
  if (!expectedApiKey) {
    console.error('AI_SERVICE_API_KEY not configured');
    return res.status(500).json({ error: 'Service not properly configured' });
  }
  
  if (!apiKey || apiKey !== expectedApiKey) {
    console.warn('Unauthorized AI service access attempt from:', req.ip);
    return res.status(401).json({ error: 'Unauthorized access' });
  }
  
  next();
};

// Main AI chat endpoint
app.post('/api/chat', authenticateRequest, async (req, res) => {
  try {
    const { message, context, conversationHistory = [], sessionId = 'default' } = req.body;
    
    if (!message || typeof message !== 'string') {
      return res.status(400).json({
        error: 'Message is required and must be a string'
      });
    }

    console.log('🤖 Processing message:', message);
    console.log('💬 Session ID:', sessionId);
    console.log('📚 Conversation history length:', conversationHistory.length);
    
    // Process message with AI agent including conversation history
    const response = await aiAgent.processMessage(message, sessionId, conversationHistory);
    
    console.log('✅ AI Response:', response.message);
    
    res.json({
      message: response.message,
      confidence: response.confidence,
      actions: response.actions || [],
      nextSteps: response.nextSteps || [],
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ AI Service Error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'I encountered an error processing your request. Please try again.',
      timestamp: new Date().toISOString()
    });
  }
});

// Template creation endpoint
app.post('/api/create-template', authenticateRequest, async (req, res) => {
  try {
    const { name, subject, htmlBody, textBody } = req.body;
    
    if (!name || !subject) {
      return res.status(400).json({
        error: 'Template name and subject are required'
      });
    }

    console.log('📧 Creating template via main app API:', { name, subject });
    
    // Call the main app's real API
    const mainAppUrl = process.env.MAIN_APP_URL || 'http://localhost:3000';
    const response = await fetch(`${mainAppUrl}/api/admin/campaign/templates`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        subject,
        htmlBody: htmlBody || `<h1>${subject}</h1><p>Your email content here</p>`,
        textBody: textBody || 'Your email content here'
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Main app API error: ${response.status} - ${error}`);
    }

    const result = await response.json();
    console.log('✅ Template created successfully:', result);
    
    res.json({
      success: true,
      templateId: result.template?.id,
      message: `Template "${name}" created successfully with ID ${result.template?.id}`,
      data: result.template
    });
    
  } catch (error) {
    console.error('❌ Template Creation Error:', error);
    res.status(500).json({
      error: 'Failed to create template',
      message: 'I encountered an error creating the template. Please try again.'
    });
  }
});

// Campaign creation endpoint
app.post('/api/create-campaign', authenticateRequest, async (req, res) => {
  try {
    const { name, description, steps, audienceGroupId } = req.body;
    
    if (!name) {
      return res.status(400).json({
        error: 'Campaign name is required'
      });
    }

    console.log('📢 Creating campaign via main app API:', { name, description });
    
    // Call the main app's real API
    const mainAppUrl = process.env.MAIN_APP_URL || 'http://localhost:3000';
    const response = await fetch(`${mainAppUrl}/api/admin/campaign/campaigns`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        description: description || `Campaign: ${name}`,
        steps: steps || [{
          type: 'email',
          templateId: 1,
          delay: 0
        }]
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Main app API error: ${response.status} - ${error}`);
    }

    const result = await response.json();
    console.log('✅ Campaign created successfully:', result);
    
    res.json({
      success: true,
      campaignId: result.campaign?.id,
      message: `Campaign "${name}" created successfully with ID ${result.campaign?.id}`,
      data: result.campaign
    });
    
  } catch (error) {
    console.error('❌ Campaign Creation Error:', error);
    res.status(500).json({
      error: 'Failed to create campaign',
      message: 'I encountered an error creating the campaign. Please try again.'
    });
  }
});

// Real audience group creation endpoint - calls main app API
app.post('/api/create-audience-group', authenticateRequest, async (req, res) => {
  try {
    const { name, description, members } = req.body;
    
    if (!name || !Array.isArray(members) || members.length === 0) {
      return res.status(400).json({
        error: 'Group name and at least one member are required'
      });
    }

    console.log('👥 Creating audience group via main app API:', { name, memberCount: members.length });
    
    // Call the main app's real API
    const mainAppUrl = process.env.MAIN_APP_URL || 'http://localhost:3000';
    const response = await fetch(`${mainAppUrl}/api/admin/campaign/groups`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        description: description || `Audience group: ${name}`,
        members: members.map(member => ({
          businessId: String(member.businessId),
          businessName: member.businessName ? String(member.businessName) : undefined,
          primaryEmail: String(member.primaryEmail),
          secondaryEmail: member.secondaryEmail ? String(member.secondaryEmail) : undefined,
          inviteToken: member.inviteToken ? String(member.inviteToken) : undefined,
          tags: Array.isArray(member.tags) ? member.tags.map(String) : undefined,
          meta: member.meta ?? undefined,
        }))
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Main app API error: ${response.status} - ${error}`);
    }

    const result = await response.json();
    console.log('✅ Audience group created successfully:', result);
    
    res.json({
      success: true,
      groupId: result.group?.id,
      message: `Audience group "${name}" created successfully with ID ${result.group?.id}`,
      data: result.group
    });
    
  } catch (error) {
    console.error('❌ Audience Group Creation Error:', error);
    res.status(500).json({
      error: 'Failed to create audience group',
      message: `Audience group creation failed: ${error.message}`
    });
  }
});

// Real campaign scheduling endpoint - calls main app API
app.post('/api/schedule-campaign', authenticateRequest, async (req, res) => {
  try {
    const { name, templateId, groupId, sendAt, campaignId } = req.body;
    
    if (!name || !templateId || !groupId) {
      return res.status(400).json({
        error: 'Schedule name, templateId, and groupId are required'
      });
    }

    console.log('📅 Creating campaign schedule via main app API:', { name, templateId, groupId });
    
    // Call the main app's real API
    const mainAppUrl = process.env.MAIN_APP_URL || 'http://localhost:3000';
    const response = await fetch(`${mainAppUrl}/api/admin/campaign/schedules`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        templateId: String(templateId),
        groupId: String(groupId),
        campaignId: campaignId ? String(campaignId) : null,
        sendAt: sendAt ? new Date(sendAt).toISOString() : null,
        throttlePerMinute: 10, // Default rate limiting
        status: 'scheduled'
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Main app API error: ${response.status} - ${error}`);
    }

    const result = await response.json();
    console.log('✅ Campaign schedule created successfully:', result);
    
    res.json({
      success: true,
      scheduleId: result.schedule?.id,
      message: `Campaign schedule "${name}" created successfully with ID ${result.schedule?.id}`,
      data: result.schedule
    });
    
  } catch (error) {
    console.error('❌ Campaign Schedule Creation Error:', error);
    res.status(500).json({
      error: 'Failed to create campaign schedule',
      message: `Campaign schedule creation failed: ${error.message}`
    });
  }
});

// Real email sending endpoint - calls main app API
app.post('/api/send-campaign', authenticateRequest, async (req, res) => {
  try {
    const { scheduleId, templateId, groupId, previewOnly = false, limit } = req.body;
    
    if (!scheduleId && (!templateId || !groupId)) {
      return res.status(400).json({
        error: 'Either scheduleId or both templateId and groupId are required'
      });
    }

    console.log('📧 Sending campaign via main app API:', { scheduleId, templateId, groupId, previewOnly });
    
    // Call the main app's real API
    const mainAppUrl = process.env.MAIN_APP_URL || 'http://localhost:3000';
    const response = await fetch(`${mainAppUrl}/api/admin/campaign/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        scheduleId: scheduleId ? String(scheduleId) : undefined,
        templateId: templateId ? String(templateId) : undefined,
        groupId: groupId ? String(groupId) : undefined,
        previewOnly: Boolean(previewOnly),
        limit: limit ? Number(limit) : undefined
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Main app API error: ${response.status} - ${error}`);
    }

    const result = await response.json();
    console.log('✅ Campaign sent successfully:', result);
    
    res.json({
      success: true,
      message: `Campaign sent successfully. Processed: ${result.result?.processed || 0}, Sent: ${result.result?.sent || 0}`,
      data: result.result
    });
    
  } catch (error) {
    console.error('❌ Campaign Send Error:', error);
    res.status(500).json({
      error: 'Failed to send campaign',
      message: `Campaign send failed: ${error.message}`
    });
  }
});

// Start server
app.listen(port, () => {
  console.log(`🚀 Juniper AI Service running on port ${port}`);
  console.log(`📡 Health check: http://localhost:${port}/health`);
  console.log(`🤖 Chat endpoint: http://localhost:${port}/api/chat`);
});

