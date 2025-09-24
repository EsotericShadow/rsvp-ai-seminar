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

// Main AI chat endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { message, context } = req.body;
    
    if (!message || typeof message !== 'string') {
      return res.status(400).json({
        error: 'Message is required and must be a string'
      });
    }

    console.log('🤖 Processing message:', message);
    
    // Process message with AI agent
    const response = await aiAgent.processMessage(message);
    
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
app.post('/api/create-template', async (req, res) => {
  try {
    const { name, subject, htmlBody, textBody } = req.body;
    
    if (!name || !subject) {
      return res.status(400).json({
        error: 'Template name and subject are required'
      });
    }

    // Here you would call your main app's API to create the template
    // For now, we'll simulate success
    const templateId = Math.floor(Math.random() * 10000);
    
    res.json({
      success: true,
      templateId,
      message: `Template "${name}" created successfully with ID ${templateId}`,
      data: {
        id: templateId,
        name,
        subject,
        htmlBody: htmlBody || `<h1>${subject}</h1><p>Your email content here</p>`,
        textBody: textBody || 'Your email content here'
      }
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
app.post('/api/create-campaign', async (req, res) => {
  try {
    const { name, description, steps, audienceGroupId } = req.body;
    
    if (!name) {
      return res.status(400).json({
        error: 'Campaign name is required'
      });
    }

    // Here you would call your main app's API to create the campaign
    // For now, we'll simulate success
    const campaignId = Math.floor(Math.random() * 10000);
    
    res.json({
      success: true,
      campaignId,
      message: `Campaign "${name}" created successfully with ID ${campaignId}`,
      data: {
        id: campaignId,
        name,
        description: description || `Campaign: ${name}`,
        status: 'draft',
        steps: steps || [{
          type: 'email',
          templateId: 1,
          delay: 0
        }],
        audienceGroupId: audienceGroupId || 1
      }
    });
    
  } catch (error) {
    console.error('❌ Campaign Creation Error:', error);
    res.status(500).json({
      error: 'Failed to create campaign',
      message: 'I encountered an error creating the campaign. Please try again.'
    });
  }
});

// Start server
app.listen(port, () => {
  console.log(`🚀 Juniper AI Service running on port ${port}`);
  console.log(`📡 Health check: http://localhost:${port}/health`);
  console.log(`🤖 Chat endpoint: http://localhost:${port}/api/chat`);
});
