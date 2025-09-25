/**
 * RAG Integration System for Juniper AI Agent (TypeScript version)
 * Provides comprehensive knowledge retrieval and context generation
 */

import weaviate from 'weaviate-ts-client';

export interface RAGSearchResult {
  id: string;
  title: string;
  content: string;
  category: string;
  subcategory: string;
  score: number;
  distance: number;
  properties: Record<string, any>;
}

export interface RAGContext {
  trainingData: RAGSearchResult[];
  codebase: RAGSearchResult[];
  brandContext: RAGSearchResult[];
  processes: RAGSearchResult[];
  apis: RAGSearchResult[];
  combinedContext: string;
}

export interface RAGResponse {
  answer: string;
  sources: RAGSearchResult[];
  confidence: number;
  relatedComponents: string[];
  nextSteps: string[];
}

export class RAGIntegrationSystem {
  private weaviateUrl: string | undefined;
  private weaviateApiKey: string | undefined;
  private weaviateClient: any;
  // private _collections: Record<string, string>; // Not used currently
  
  constructor() {
    this.weaviateUrl = process.env.WEAVIATE_URL;
    this.weaviateApiKey = process.env.WEAVIATE_API_KEY;
    
    console.log('🔧 Initializing Weaviate client...');
    console.log('🔧 Weaviate URL:', this.weaviateUrl ? 'Set' : 'Not set');
    console.log('🔧 Weaviate API Key:', this.weaviateApiKey ? 'Set' : 'Not set');
    
    // Collections mapping (not used in current implementation)
    // this._collections = {
    //   trainingData: 'KnowledgeBase',
    //   codebase: 'KnowledgeBase', 
    //   brandContext: 'BusinessData',
    //   processes: 'KnowledgeBase',
    //   apis: 'KnowledgeBase'
    // };
  }

  async initializeKnowledgeBase(): Promise<void> {
    try {
      console.log('📚 Initializing Weaviate knowledge base...');
      
      // Check if Weaviate is configured
      if (!this.weaviateUrl || !this.weaviateApiKey) {
        console.log('⚠️ Weaviate not configured, skipping initialization');
        return;
      }
      
      // Initialize Weaviate client
      this.weaviateClient = weaviate.client({
        scheme: 'https',
        host: this.weaviateUrl.replace('https://', ''),
        apiKey: new weaviate.ApiKey(this.weaviateApiKey),
      });
      
      console.log('✅ Weaviate client initialized');
      
      // Check if collections exist and create if needed
      await this.ensureCollectionsExist();
      
      // Ingest knowledge data
      await this.ingestKnowledgeData();
      
      console.log('✅ Knowledge base initialization complete');
      
    } catch (error) {
      console.error('❌ Knowledge base initialization failed:', error);
      throw error;
    }
  }

  async ensureCollectionsExist(): Promise<void> {
    try {
      // Check if KnowledgeBase collection exists
      const collections = await this.weaviateClient.schema.getter().do();
      const collectionNames = collections.classes?.map((c: any) => c.class) || [];
      
      if (!collectionNames.includes('KnowledgeBase')) {
        console.log('📝 Creating KnowledgeBase collection...');
        await this.createKnowledgeBaseCollection();
      }
      
      if (!collectionNames.includes('BusinessData')) {
        console.log('📝 Creating BusinessData collection...');
        await this.createBusinessDataCollection();
      }
      
    } catch (error) {
      console.error('❌ Failed to ensure collections exist:', error);
      throw error;
    }
  }

  async createKnowledgeBaseCollection(): Promise<void> {
    const classDefinition = {
      class: 'KnowledgeBase',
      description: 'Knowledge base for AI agent with system documentation, business knowledge, and capabilities',
      vectorizer: 'text2vec-openai',
      moduleConfig: {
        'text2vec-openai': {
          model: 'ada',
          modelVersion: '002',
          type: 'text'
        }
      },
      properties: [
        {
          name: 'title',
          dataType: ['text'],
          description: 'Title of the knowledge entry'
        },
        {
          name: 'content',
          dataType: ['text'],
          description: 'Main content of the knowledge entry'
        },
        {
          name: 'category',
          dataType: ['text'],
          description: 'Category of the knowledge (database, api, business, etc.)'
        },
        {
          name: 'metadata',
          dataType: ['text'],
          description: 'JSON metadata for the entry'
        },
        {
          name: 'source',
          dataType: ['text'],
          description: 'Source of the knowledge'
        },
        {
          name: 'tags',
          dataType: ['text[]'],
          description: 'Tags for the knowledge entry'
        }
      ]
    };

    await this.weaviateClient.schema.classCreator().withClass(classDefinition).do();
    console.log('✅ KnowledgeBase collection created');
  }

  async createBusinessDataCollection(): Promise<void> {
    const classDefinition = {
      class: 'BusinessData',
      description: 'Business data for AI agent including company information and audience data',
      vectorizer: 'text2vec-openai',
      moduleConfig: {
        'text2vec-openai': {
          model: 'ada',
          modelVersion: '002',
          type: 'text'
        }
      },
      properties: [
        {
          name: 'businessName',
          dataType: ['text'],
          description: 'Name of the business'
        },
        {
          name: 'industry',
          dataType: ['text'],
          description: 'Industry of the business'
        },
        {
          name: 'description',
          dataType: ['text'],
          description: 'Description of the business'
        },
        {
          name: 'audienceGroup',
          dataType: ['text'],
          description: 'Audience group the business belongs to'
        }
      ]
    };

    await this.weaviateClient.schema.classCreator().withClass(classDefinition).do();
    console.log('✅ BusinessData collection created');
  }

  async ingestKnowledgeData(): Promise<void> {
    try {
      console.log('📚 Ingesting knowledge data...');
      
      const knowledgeData = [
        {
          title: 'Evergreen Web Solutions - Company Branding',
          content: `# Evergreen Web Solutions - Company Branding

## Company Overview
- **Company Name**: Evergreen Web Solutions
- **Owner**: Gabe Lacroix
- **Business Type**: Web development and digital solutions company
- **Location**: Terrace, British Columbia, Canada

## Brand Identity
- **Logo**: Evergreen logo with professional design
- **Color Scheme**: Professional green and white branding
- **Brand Values**: Innovation, reliability, growth, sustainability

## Services Offered
- Web development and design
- Digital marketing solutions
- AI integration and automation
- Business intelligence and analytics
- Custom software development
- E-commerce solutions

## Target Market
- Local businesses in Terrace, BC
- Small to medium-sized businesses
- Companies looking for digital transformation
- Businesses needing web presence and online marketing

## Company Philosophy
- Focus on sustainable, long-term solutions
- Client-centered approach
- Innovation in web technologies
- Local community support and engagement`,
          category: 'branding',
          metadata: JSON.stringify({ type: 'company-branding', version: '1.0' }),
          source: 'evergreen-branding',
          tags: ['branding', 'company', 'evergreen', 'web-solutions', 'gabe-lacroix']
        },
        {
          title: 'AI in Terrace - Business Event Information',
          content: `# AI in Terrace - Business Event Information

## Event Overview
- **Event Name**: AI in Terrace
- **Event Type**: Business informational seminar
- **Target Audience**: Local business owners and professionals
- **Location**: Terrace, British Columbia
- **Organizer**: Evergreen Web Solutions (Gabe Lacroix)

## Event Purpose
- Educate local businesses about AI opportunities
- Demonstrate practical AI applications for business
- Provide AI needs assessment for attendees
- Showcase AI tools and solutions for small businesses

## Event Content
- AI seminar presentation
- Business needs assessment workshop
- Practical AI demonstrations
- Q&A sessions with AI experts
- Networking opportunities for local businesses

## Target Industries
- Healthcare practices
- Construction companies
- Retail businesses
- Professional services
- Manufacturing companies
- Technology companies
- Hospitality businesses

## Event Benefits for Attendees
- Understanding AI applications for their business
- Personalized AI needs assessment
- Access to AI tools and resources
- Networking with other business owners
- Follow-up consultation opportunities

## Marketing Approach
- Press release distribution
- Local business outreach
- Digital marketing campaigns
- Community engagement
- Professional networking`,
          category: 'events',
          metadata: JSON.stringify({ type: 'event-information', version: '1.0' }),
          source: 'ai-terrace-event',
          tags: ['event', 'ai', 'terrace', 'business', 'seminar', 'education']
        },
        {
          title: 'RSVP System Capabilities',
          content: `# RSVP System Capabilities

## Campaign Management
- Create, edit, and delete email campaigns
- Schedule campaigns for specific times
- Pause and resume campaigns
- Monitor campaign performance
- A/B testing capabilities

## Template Management
- Create and edit email templates
- HTML and text versions
- Personalization tokens like {{businessName}}
- Template testing and validation
- Template performance analytics

## Audience Management
- Create audience groups
- Segment by industry, behavior, demographics
- Import/export audience data
- Clean and validate email addresses
- Track audience engagement

## Analytics & Reporting
- Real-time campaign performance
- Open rates, click rates, RSVP rates
- Geographic distribution analysis
- ROI calculations
- Monthly and campaign-specific reports

## Automation
- Workflow automation rules
- Trigger-based campaigns
- Automated follow-ups
- Smart audience segmentation
- Performance-based optimization`,
          category: 'capabilities',
          metadata: JSON.stringify({ type: 'system-capabilities', version: '1.0' }),
          source: 'rsvp-system',
          tags: ['capabilities', 'features', 'automation', 'analytics', 'rsvp']
        },
        {
          title: 'Email Template Structure and Variables',
          content: `# Email Template Structure and Variables

## Template Fields (Required)
- **name**: Template identifier/name (required)
- **subject**: Email subject line (required)
- **htmlBody**: HTML email content (required)
- **textBody**: Plain text version (optional)

## Template Variables (Database Fields)
- **greeting_title**: Welcome/greeting title
- **greeting_message**: Welcome message content
- **signature_name**: Sender's name
- **signature_title**: Sender's title/position
- **signature_company**: Company name
- **signature_location**: Company location
- **main_content_title**: Main content heading
- **main_content_body**: Main content text
- **button_text**: Call-to-action button text
- **additional_info_title**: Additional info heading
- **additional_info_body**: Additional info content
- **closing_title**: Closing message heading
- **closing_message**: Closing message content

## Dynamic Variables (Runtime)
- **{{businessName}}**: Recipient business name
- **{{primaryEmail}}**: Recipient email address
- **{{inviteToken}}**: Unique invitation token
- **{{invite_link}}**: Generated tracking link
- **{{businessId}}**: Unique business identifier
- **{{groupId}}**: Audience group identifier

## Template Rendering
- Uses {{variable}} syntax for dynamic content
- Automatic token replacement during sending
- Support for both HTML and text versions
- Tracking links generated automatically
- Personalization based on recipient data

## Campaign Integration
- Templates linked to campaign steps
- Multiple templates per campaign
- Step-by-step email sequences
- Scheduling and timing controls
- Performance tracking per template`,
          category: 'templates',
          metadata: JSON.stringify({ type: 'template-structure', version: '1.0' }),
          source: 'template-system',
          tags: ['templates', 'email', 'variables', 'structure', 'personalization']
        },
        {
          title: 'Campaign Structure and Management',
          content: `# Campaign Structure and Management

## Campaign Fields
- **name**: Campaign identifier (required)
- **description**: Campaign description (optional)
- **status**: Campaign status (DRAFT, SCHEDULED, PAUSED, COMPLETED, CANCELLED)
- **meta**: Additional metadata (JSON)

## Campaign Steps/Schedules
- **templateId**: Email template to use (required)
- **groupId**: Target audience group (required)
- **sendAt**: Scheduled send time (optional)
- **throttlePerMinute**: Send rate limiting (optional)
- **repeatIntervalMins**: Repeat interval for recurring campaigns (optional)
- **stepOrder**: Order of execution (1, 2, 3, etc.)
- **smartWindowStart**: Smart send window start time (optional)
- **smartWindowEnd**: Smart send window end time (optional)
- **timeZone**: Timezone for scheduling (default: America/Vancouver)
- **status**: Step status (DRAFT, SCHEDULED, PAUSED, COMPLETED, CANCELLED)

## Campaign Operations
- Create new campaigns with steps
- Edit existing campaigns and steps
- Delete campaigns and individual steps
- Schedule campaigns for specific times
- Pause and resume campaigns
- Monitor campaign performance
- Duplicate campaigns and steps
- Reorder campaign steps

## Campaign Status Management
- **DRAFT**: Campaign being created/edited
- **SCHEDULED**: Campaign scheduled for future sending
- **PAUSED**: Campaign temporarily stopped
- **COMPLETED**: Campaign finished successfully
- **CANCELLED**: Campaign cancelled before completion

## Performance Tracking
- Track email delivery and opens
- Monitor click-through rates
- Measure RSVP response rates
- Analyze audience engagement
- Generate performance reports`,
          category: 'campaigns',
          metadata: JSON.stringify({ type: 'campaign-structure', version: '1.0' }),
          source: 'campaign-system',
          tags: ['campaigns', 'scheduling', 'steps', 'management', 'performance']
        },
        {
          title: 'Audience Management System',
          content: `# Audience Management System

## Audience Groups
- **name**: Group identifier (required)
- **description**: Group description (optional)
- **color**: Visual identifier color (default: #10b981)
- **criteria**: Selection criteria (JSON)
- **meta**: Additional metadata (JSON)

## Audience Members
- **businessId**: Unique business identifier
- **businessName**: Business name
- **primaryEmail**: Primary email address
- **inviteToken**: Unique invitation token
- **meta**: Member metadata (JSON)

## Member Data Sources
- **Manual Entry**: Manually added members
- **LeadMine Integration**: Imported from LeadMine service
- **Import/Export**: CSV file uploads
- **API Integration**: Programmatic additions

## Group Operations
- Create new audience groups
- Edit group details and criteria
- Delete groups and members
- Import/export member data
- Segment by industry, location, behavior
- Clean and validate email addresses
- Track member engagement

## Member Management
- Add individual members
- Bulk import from CSV
- Update member information
- Remove members from groups
- Generate invitation tokens
- Track member interactions
- Manage unsubscribe requests

## Audience Segmentation
- Industry-based segmentation
- Geographic segmentation
- Behavioral segmentation
- Engagement-based segmentation
- Custom criteria segmentation
- Dynamic audience updates

## Data Validation
- Email format validation
- Duplicate detection and removal
- Bounce handling
- Unsubscribe management
- GDPR compliance features
- Data privacy controls`,
          category: 'audiences',
          metadata: JSON.stringify({ type: 'audience-management', version: '1.0' }),
          source: 'audience-system',
          tags: ['audiences', 'groups', 'members', 'segmentation', 'management']
        }
      ];

      // Insert knowledge data
      for (const data of knowledgeData) {
        await this.weaviateClient.data.creator()
          .withClassName('KnowledgeBase')
          .withProperties(data)
          .do();
      }
      
      console.log(`✅ Ingested ${knowledgeData.length} knowledge entries`);
      
    } catch (error) {
      console.error('❌ Failed to ingest knowledge data:', error);
      throw error;
    }
  }

  async generateRAGResponse(query: string): Promise<RAGResponse> {
    try {
      console.log('🔍 Generating RAG response for query:', query);
      
      // Search all collections
      const context = await this.searchRAG(query);
      
      if (!context || Object.keys(context).length === 0) {
        console.log('⚠️ No RAG context found, using fallback');
        return this.getFallbackResponse(query);
      }
      
      // Generate response based on context
      const answer = this.generateAnswerFromContext(query, context);
      
      return {
        answer: answer,
        sources: this.extractSources(context),
        confidence: 0.8,
        relatedComponents: this.extractRelatedComponents(context),
        nextSteps: this.generateNextSteps(query, context)
      };
      
    } catch (error) {
      console.error('❌ RAG system error:', error);
      return this.getFallbackResponse(query);
    }
  }

  async searchRAG(query: string): Promise<RAGContext> {
    try {
      if (!this.weaviateUrl || !this.weaviateApiKey) {
        console.log('⚠️ Weaviate credentials not configured');
        return {
          trainingData: [],
          codebase: [],
          brandContext: [],
          processes: [],
          apis: [],
          combinedContext: ''
        };
      }

      const results: RAGContext = {
        trainingData: [],
        codebase: [],
        brandContext: [],
        processes: [],
        apis: [],
        combinedContext: ''
      };
      
      // Search KnowledgeBase collection
      const knowledgeResults = await this.searchCollection('KnowledgeBase', query, 3);
      results.trainingData = knowledgeResults;
      results.codebase = knowledgeResults;
      results.processes = knowledgeResults;
      results.apis = knowledgeResults;
      
      // Search BusinessData collection
      const businessResults = await this.searchCollection('BusinessData', query, 2);
      results.brandContext = businessResults;
      
      // Combine all results into a single context string
      results.combinedContext = this.combineContext(results);
      
      return results;
      
    } catch (error) {
      console.error('❌ RAG search error:', error);
      return {
        trainingData: [],
        codebase: [],
        brandContext: [],
        processes: [],
        apis: [],
        combinedContext: ''
      };
    }
  }

  async searchCollection(collectionName: string, query: string, limit: number = 5): Promise<RAGSearchResult[]> {
    try {
      if (!this.weaviateClient) {
        console.log('⚠️ Weaviate client not initialized');
        return [];
      }

      // Use different field names for different collections
      let fields: string;
      if (collectionName === 'BusinessData') {
        fields = 'businessName industry description audienceGroup _additional { id score distance }';
      } else {
        fields = 'title content category metadata source tags _additional { id score distance }';
      }

      // Use correct API for weaviate-ts-client 1.6.0
      const results = await this.weaviateClient.graphql
        .get()
        .withClassName(collectionName)
        .withFields(fields)
        .withBm25({ query })
        .withLimit(limit)
        .do();

      const objects = results.data.Get[collectionName] || [];
      return objects.map((obj: any) => {
        if (collectionName === 'BusinessData') {
          return {
            id: obj._additional?.id || '',
            title: obj.businessName || '',
            content: `${obj.industry || ''} - ${obj.description || ''}`,
            category: 'business',
            subcategory: obj.audienceGroup || '',
            score: obj._additional?.score || 0,
            distance: obj._additional?.distance || 0,
            properties: {
              businessName: obj.businessName,
              industry: obj.industry,
              description: obj.description,
              audienceGroup: obj.audienceGroup
            }
          };
        } else {
          return {
            id: obj._additional?.id || '',
            title: obj.title || '',
            content: obj.content || '',
            category: obj.category || '',
            subcategory: '',
            score: obj._additional?.score || 0,
            distance: obj._additional?.distance || 0,
            properties: {
              metadata: obj.metadata,
              source: obj.source,
              tags: obj.tags
            }
          };
        }
      });
      
    } catch (error) {
      console.error(`❌ Error searching ${collectionName}:`, error);
      return [];
    }
  }

  generateAnswerFromContext(query: string, _context: RAGContext): string {
    const queryLower = query.toLowerCase();
    
    // DELETE operations
    if (queryLower.includes('delete') && queryLower.includes('campaign')) {
      return "I can help you delete campaigns! However, I need to clarify what you'd like to delete:\n\n• **All campaigns** - Remove all existing campaigns\n• **Specific campaign** - Delete a particular campaign by name\n• **Draft campaigns** - Remove only unpublished campaigns\n\n⚠️ **Warning**: Deleting campaigns will permanently remove them and their data. This action cannot be undone.\n\nWhich campaigns would you like to delete?";
    }
    
    if (queryLower.includes('delete') && queryLower.includes('template')) {
      return "I can help you delete templates! However, I need to clarify what you'd like to delete:\n\n• **All templates** - Remove all existing templates\n• **Specific template** - Delete a particular template by name\n• **Unused templates** - Remove templates that aren't used in any campaigns\n\n⚠️ **Warning**: Deleting templates will permanently remove them. Make sure they're not being used in active campaigns.\n\nWhich templates would you like to delete?";
    }
    
    // LIST/VIEW operations
    if ((queryLower.includes('list') || queryLower.includes('show') || queryLower.includes('view')) && queryLower.includes('campaign')) {
      return "I can show you your current campaigns! Let me retrieve the list of campaigns for you:\n\n• **Active campaigns** - Currently running or scheduled\n• **Draft campaigns** - Created but not yet sent\n• **Completed campaigns** - Finished campaigns with results\n\nWould you like me to list all campaigns or filter by status?";
    }
    
    if ((queryLower.includes('list') || queryLower.includes('show') || queryLower.includes('view')) && queryLower.includes('template')) {
      return "I can show you your email templates! Let me retrieve the list of templates for you:\n\n• **All templates** - Complete list of available templates\n• **Active templates** - Templates used in campaigns\n• **Draft templates** - Templates not yet used\n\nWould you like me to list all templates or show specific details?";
    }
    
    // CREATE operations
    if (queryLower.includes('create') && queryLower.includes('template')) {
      return "I can help you create email templates! Here's what I need to know:\n\n**Required Fields:**\n• **Template name** - What should we call it?\n• **Subject line** - Email subject text\n• **HTML content** - Main email body (HTML format)\n• **Text content** - Plain text version (optional)\n\n**Available Variables:**\n• `{{businessName}}` - Recipient business name\n• `{{primaryEmail}}` - Recipient email\n• `{{invite_link}}` - Tracking link\n• Plus 12 template-specific fields for greeting, content, signature, etc.\n\nWhat would you like to name your template?";
    }
    
    if (queryLower.includes('create') && queryLower.includes('campaign')) {
      return "I can help you create email campaigns! Here's what I need to know:\n\n**Required Fields:**\n• **Campaign name** - What should we call it?\n• **Target audience** - Which group should receive it?\n• **Email template** - Which template to use?\n• **Scheduling** - When should it be sent?\n\n**Campaign Options:**\n• Single send or recurring campaigns\n• Smart send windows (optimal timing)\n• Rate limiting (throttle per minute)\n• Multiple steps/sequences\n• Performance tracking\n\nWhat would you like to name your campaign?";
    }
    
    if (queryLower.includes('create') && queryLower.includes('audience')) {
      return "I can help you create audience groups! Here's what I need to know:\n\n**Required Fields:**\n• **Group name** - What should we call this audience?\n• **Description** - What describes this group?\n• **Criteria** - How should members be selected?\n\n**Group Options:**\n• Industry-based segmentation\n• Geographic targeting\n• Behavioral criteria\n• Custom selection rules\n• Import from CSV files\n• LeadMine integration\n\n**Member Management:**\n• Add individual members\n• Bulk import capabilities\n• Email validation\n• Unsubscribe handling\n\nWhat would you like to name your audience group?";
    }
    
    // General campaign queries (without specific action)
    if (queryLower.includes('campaign') && !queryLower.includes('create') && !queryLower.includes('delete') && !queryLower.includes('list')) {
      return "I can help you with campaign management! Here's what I can do:\n\n• **Create campaigns** - Set up new email campaigns\n• **List campaigns** - Show existing campaigns\n• **Delete campaigns** - Remove campaigns\n• **Schedule campaigns** - Set up campaign timing\n• **Monitor performance** - Track campaign results\n\nWhat would you like to do with campaigns?";
    }
    
    // Template variables and structure queries
    if (queryLower.includes('template') && (queryLower.includes('variable') || queryLower.includes('field') || queryLower.includes('structure'))) {
      return "Here are the available template variables and structure:\n\n**Required Template Fields:**\n• `name` - Template identifier\n• `subject` - Email subject line\n• `htmlBody` - HTML email content\n• `textBody` - Plain text version (optional)\n\n**Template Variables (Database Fields):**\n• `greeting_title` - Welcome/greeting title\n• `greeting_message` - Welcome message content\n• `signature_name` - Sender's name\n• `signature_title` - Sender's title/position\n• `signature_company` - Company name\n• `signature_location` - Company location\n• `main_content_title` - Main content heading\n• `main_content_body` - Main content text\n• `button_text` - Call-to-action button text\n• `additional_info_title` - Additional info heading\n• `additional_info_body` - Additional info content\n• `closing_title` - Closing message heading\n• `closing_message` - Closing message content\n\n**Dynamic Variables (Runtime):**\n• `{{businessName}}` - Recipient business name\n• `{{primaryEmail}}` - Recipient email address\n• `{{inviteToken}}` - Unique invitation token\n• `{{invite_link}}` - Generated tracking link\n• `{{businessId}}` - Unique business identifier\n• `{{groupId}}` - Audience group identifier\n\n**Template Rendering:**\n• Uses `{{variable}}` syntax for dynamic content\n• Automatic token replacement during sending\n• Support for both HTML and text versions\n• Tracking links generated automatically";
    }
    
    // General template queries (without specific action)
    if (queryLower.includes('template') && !queryLower.includes('create') && !queryLower.includes('delete') && !queryLower.includes('list') && !queryLower.includes('variable') && !queryLower.includes('field') && !queryLower.includes('structure')) {
      return "I can help you with template management! Here's what I can do:\n\n• **Create templates** - Design new email templates\n• **List templates** - Show existing templates\n• **Delete templates** - Remove templates\n• **Edit templates** - Modify existing templates\n• **Preview templates** - See how templates look\n• **Template variables** - Show available variables and structure\n\nWhat would you like to do with templates?";
    }
    
    // Audience management queries
    if (queryLower.includes('audience') && !queryLower.includes('create') && !queryLower.includes('delete') && !queryLower.includes('list')) {
      return "I can help you with audience management! Here's what I can do:\n\n• **Create audience groups** - Set up new target audiences\n• **List audiences** - Show existing audience groups\n• **Delete audiences** - Remove audience groups\n• **Manage members** - Add/remove individual members\n• **Import/export** - Bulk member management\n• **Segmentation** - Create targeted segments\n\n**Audience Features:**\n• Industry-based segmentation\n• Geographic targeting\n• Behavioral criteria\n• Custom selection rules\n• LeadMine integration\n• Email validation\n• Unsubscribe handling\n\nWhat would you like to do with audiences?";
    }
    
    // Company/branding queries
    if (queryLower.includes('evergreen') || queryLower.includes('company') || queryLower.includes('business')) {
      return "Evergreen Web Solutions is your web development and digital solutions company, owned by Gabe Lacroix and based in Terrace, BC. We specialize in web development, AI integration, digital marketing, and custom software solutions for local businesses.";
    }
    
    // Event queries
    if (queryLower.includes('event') || queryLower.includes('terrace') || queryLower.includes('ai in terrace')) {
      return "The AI in Terrace event is a business informational seminar organized by Evergreen Web Solutions. It's designed to educate local businesses about AI opportunities, demonstrate practical AI applications, and provide personalized AI needs assessments for attendees.";
    }
    
    // System capability queries
    if (queryLower.includes('system') || queryLower.includes('capabilities') || queryLower.includes('features')) {
      return "The RSVP system offers comprehensive campaign management, template creation, audience segmentation, analytics, and automation features. I can help you create templates, set up campaigns, manage audiences, and analyze performance.";
    }
    
    // General fallback
    return "I'm here to help with your RSVP system and Evergreen Web Solutions services. I can assist with creating email templates, managing campaigns, organizing audiences, and providing information about your business and the AI in Terrace event. What would you like to work on?";
  }

  combineContext(_context: RAGContext): string {
    const allResults = [
      ..._context.trainingData,
      ..._context.codebase,
      ..._context.brandContext,
      ..._context.processes,
      ..._context.apis
    ];
    
    return allResults.map(result => `${result.title}: ${result.content}`).join('\n\n');
  }

  extractSources(_context: RAGContext): RAGSearchResult[] {
    const allResults = [
      ..._context.trainingData,
      ..._context.codebase,
      ..._context.brandContext,
      ..._context.processes,
      ..._context.apis
    ];
    
    return allResults.slice(0, 5); // Return top 5 sources
  }

  extractRelatedComponents(_context: RAGContext): string[] {
    const components = new Set<string>();
    
    _context.trainingData.forEach((result: RAGSearchResult) => {
      if (result.properties.tags) {
        result.properties.tags.forEach((tag: string) => components.add(tag));
      }
    });
    
    return Array.from(components).slice(0, 5);
  }

  generateNextSteps(query: string, _context: RAGContext): string[] {
    const queryLower = query.toLowerCase();
    
    if (queryLower.includes('template')) {
      return ['Create email template', 'Design template content', 'Set up personalization tokens'];
    }
    
    if (queryLower.includes('campaign')) {
      return ['Create email campaign', 'Select target audience', 'Schedule campaign delivery'];
    }
    
    return ['Explore system capabilities', 'Create templates or campaigns', 'Set up audience groups'];
  }

  getFallbackResponse(_query: string): RAGResponse {
    return {
      answer: "I'm here to help with your RSVP system! I can assist with creating email templates, managing campaigns, organizing audiences, and providing information about Evergreen Web Solutions and the AI in Terrace event. What would you like to work on?",
      sources: [],
      confidence: 0.5,
      relatedComponents: [],
      nextSteps: ['Ask for specific help', 'Create templates or campaigns', 'Explore system features']
    };
  }
}
