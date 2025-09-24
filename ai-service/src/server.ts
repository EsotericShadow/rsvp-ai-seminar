/**
 * AI Service Server for Juniper
 * Handles AI conversations and provides RSVP system assistance
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { ServerSideAIAgent } from './lib/agents/ServerSideAIAgent';
// import { ChatMessage } from './types/ai'; // Not used in this file

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 10000;

// Middleware
app.use(cors({
  origin: [
    'https://rsvp.evergreenwebsolutions.ca',
    'http://localhost:3000', // For local development
    'https://rsvp-ai-seminar.vercel.app' // Fallback domain
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-AI-API-Key', 'x-api-key']
}));
app.use(express.json());

// Authentication middleware for AI service
const authenticateRequest = (req: express.Request, res: express.Response, next: express.NextFunction): void => {
  const apiKey = req.headers['x-ai-api-key'] as string || req.headers['x-api-key'] as string || req.headers['authorization']?.toString().replace('Bearer ', '');
  const expectedApiKey = process.env.AI_SERVICE_API_KEY;
  
  if (!expectedApiKey) {
    console.error('AI_SERVICE_API_KEY not configured');
    res.status(500).json({ error: 'Service not configured' });
    return;
  }
  
  if (apiKey !== expectedApiKey) {
    console.warn('Unauthorized AI service access attempt from:', req.ip);
    res.status(401).json({ error: 'Unauthorized access' });
    return;
  }
  
  next();
};

// Initialize AI agent
const aiAgent = new ServerSideAIAgent();

// Health check endpoint (no auth required)
app.get('/health', (_req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Chat endpoint
app.post('/api/chat', authenticateRequest, async (req, res) => {
  try {
    const { message, conversationHistory = [], sessionId = 'default' } = req.body;
    
    if (!message) {
      res.status(400).json({ error: 'Message is required' });
      return;
    }
    
    console.log('🤖 Processing message:', message);
    console.log('💬 Session ID:', sessionId);
    console.log('📚 Conversation history length:', conversationHistory.length);
    
    const response = await aiAgent.processMessage(message, sessionId, conversationHistory);
    
    console.log('✅ AI Response:', response.message);
    
    res.json(response);
  } catch (error) {
    console.error('❌ Chat error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Direct template creation endpoint
app.post('/api/create-template', authenticateRequest, async (req, res) => {
  try {
    const { name, subject, htmlBody, textBody } = req.body;
    
    if (!name || !subject || !htmlBody) {
      res.status(400).json({ error: 'Name, subject, and htmlBody are required' });
      return;
    }
    
    const response = await fetch(`${process.env.MAIN_APP_URL}/api/internal/templates`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-AI-API-Key': process.env.AI_SERVICE_API_KEY || ''
      },
      body: JSON.stringify({ name, subject, htmlBody, textBody })
    });
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Template creation failed: ${response.status} - ${error}`);
    }
    
    const result = await response.json();
    res.json(result);
  } catch (error) {
    console.error('❌ Template creation error:', error);
    res.status(500).json({ 
      error: 'Failed to create template',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Direct campaign creation endpoint
app.post('/api/create-campaign', authenticateRequest, async (req, res) => {
  try {
    const { name, description, steps } = req.body;
    
    if (!name) {
      res.status(400).json({ error: 'Campaign name is required' });
      return;
    }
    
    const response = await fetch(`${process.env.MAIN_APP_URL}/api/internal/campaigns`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-AI-API-Key': process.env.AI_SERVICE_API_KEY || ''
      },
      body: JSON.stringify({ name, description, steps })
    });
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Campaign creation failed: ${response.status} - ${error}`);
    }
    
    const result = await response.json();
    res.json(result);
  } catch (error) {
    console.error('❌ Campaign creation error:', error);
    res.status(500).json({ 
      error: 'Failed to create campaign',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Direct audience group creation endpoint
app.post('/api/create-audience-group', authenticateRequest, async (req, res) => {
  try {
    const { name, description, criteria } = req.body;
    
    if (!name) {
      res.status(400).json({ error: 'Group name is required' });
      return;
    }
    
    const response = await fetch(`${process.env.MAIN_APP_URL}/api/internal/groups`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-AI-API-Key': process.env.AI_SERVICE_API_KEY || ''
      },
      body: JSON.stringify({ name, description, criteria })
    });
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Group creation failed: ${response.status} - ${error}`);
    }
    
    const result = await response.json();
    res.json(result);
  } catch (error) {
    console.error('❌ Group creation error:', error);
    res.status(500).json({ 
      error: 'Failed to create audience group',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Schedule campaign endpoint
app.post('/api/schedule-campaign', authenticateRequest, async (req, res) => {
  try {
    const { scheduleId, templateId, groupId, previewOnly = false, limit } = req.body;
    
    if (!scheduleId || !templateId || !groupId) {
      res.status(400).json({ error: 'scheduleId, templateId, and groupId are required' });
      return;
    }
    
    const response = await fetch(`${process.env.MAIN_APP_URL}/api/internal/schedules`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-AI-API-Key': process.env.AI_SERVICE_API_KEY || ''
      },
      body: JSON.stringify({ scheduleId, templateId, groupId, previewOnly, limit })
    });
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Schedule creation failed: ${response.status} - ${error}`);
    }
    
    const result = await response.json();
    res.json(result);
  } catch (error) {
    console.error('❌ Schedule error:', error);
    res.status(500).json({ 
      error: 'Failed to schedule campaign',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Send campaign endpoint
app.post('/api/send-campaign', authenticateRequest, async (req, res) => {
  try {
    const { scheduleId, templateId, groupId, previewOnly = false, limit } = req.body;
    
    if (!scheduleId || !templateId || !groupId) {
      res.status(400).json({ error: 'scheduleId, templateId, and groupId are required' });
      return;
    }
    
    const response = await fetch(`${process.env.MAIN_APP_URL}/api/internal/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-AI-API-Key': process.env.AI_SERVICE_API_KEY || ''
      },
      body: JSON.stringify({ scheduleId, templateId, groupId, previewOnly, limit })
    });
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Campaign send failed: ${response.status} - ${error}`);
    }
    
    const result = await response.json();
    res.json(result);
  } catch (error) {
    console.error('❌ Send error:', error);
    res.status(500).json({ 
      error: 'Failed to send campaign',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Start server
app.listen(port, () => {
  console.log(`🤖 AI Service running on port ${port}`);
  console.log(`🔗 Health check: http://localhost:${port}/health`);
  console.log(`💬 Chat endpoint: http://localhost:${port}/api/chat`);
});

export default app;