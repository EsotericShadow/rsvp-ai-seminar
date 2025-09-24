"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RAGIntegrationSystem = void 0;
const weaviate_ts_client_1 = __importDefault(require("weaviate-ts-client"));
class RAGIntegrationSystem {
    constructor() {
        this.weaviateUrl = process.env.WEAVIATE_URL;
        this.weaviateApiKey = process.env.WEAVIATE_API_KEY;
        console.log('🔧 Initializing Weaviate client...');
        console.log('🔧 Weaviate URL:', this.weaviateUrl ? 'Set' : 'Not set');
        console.log('🔧 Weaviate API Key:', this.weaviateApiKey ? 'Set' : 'Not set');
    }
    async initializeKnowledgeBase() {
        try {
            console.log('📚 Initializing Weaviate knowledge base...');
            if (!this.weaviateUrl || !this.weaviateApiKey) {
                console.log('⚠️ Weaviate not configured, skipping initialization');
                return;
            }
            this.weaviateClient = weaviate_ts_client_1.default.client({
                scheme: 'https',
                host: this.weaviateUrl.replace('https://', ''),
                apiKey: new weaviate_ts_client_1.default.ApiKey(this.weaviateApiKey),
            });
            console.log('✅ Weaviate client initialized');
            await this.ensureCollectionsExist();
            await this.ingestKnowledgeData();
            console.log('✅ Knowledge base initialization complete');
        }
        catch (error) {
            console.error('❌ Knowledge base initialization failed:', error);
            throw error;
        }
    }
    async ensureCollectionsExist() {
        try {
            const collections = await this.weaviateClient.schema.getter().do();
            const collectionNames = collections.classes?.map((c) => c.class) || [];
            if (!collectionNames.includes('KnowledgeBase')) {
                console.log('📝 Creating KnowledgeBase collection...');
                await this.createKnowledgeBaseCollection();
            }
            if (!collectionNames.includes('BusinessData')) {
                console.log('📝 Creating BusinessData collection...');
                await this.createBusinessDataCollection();
            }
        }
        catch (error) {
            console.error('❌ Failed to ensure collections exist:', error);
            throw error;
        }
    }
    async createKnowledgeBaseCollection() {
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
    async createBusinessDataCollection() {
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
    async ingestKnowledgeData() {
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
                }
            ];
            for (const data of knowledgeData) {
                await this.weaviateClient.data.creator()
                    .withClassName('KnowledgeBase')
                    .withProperties(data)
                    .do();
            }
            console.log(`✅ Ingested ${knowledgeData.length} knowledge entries`);
        }
        catch (error) {
            console.error('❌ Failed to ingest knowledge data:', error);
            throw error;
        }
    }
    async generateRAGResponse(query) {
        try {
            console.log('🔍 Generating RAG response for query:', query);
            const context = await this.searchRAG(query);
            if (!context || Object.keys(context).length === 0) {
                console.log('⚠️ No RAG context found, using fallback');
                return this.getFallbackResponse(query);
            }
            const answer = this.generateAnswerFromContext(query, context);
            return {
                answer: answer,
                sources: this.extractSources(context),
                confidence: 0.8,
                relatedComponents: this.extractRelatedComponents(context),
                nextSteps: this.generateNextSteps(query, context)
            };
        }
        catch (error) {
            console.error('❌ RAG system error:', error);
            return this.getFallbackResponse(query);
        }
    }
    async searchRAG(query) {
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
            const results = {
                trainingData: [],
                codebase: [],
                brandContext: [],
                processes: [],
                apis: [],
                combinedContext: ''
            };
            const knowledgeResults = await this.searchCollection('KnowledgeBase', query, 3);
            results.trainingData = knowledgeResults;
            results.codebase = knowledgeResults;
            results.processes = knowledgeResults;
            results.apis = knowledgeResults;
            const businessResults = await this.searchCollection('BusinessData', query, 2);
            results.brandContext = businessResults;
            results.combinedContext = this.combineContext(results);
            return results;
        }
        catch (error) {
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
    async searchCollection(collectionName, query, limit = 5) {
        try {
            if (!this.weaviateClient) {
                console.log('⚠️ Weaviate client not initialized');
                return [];
            }
            let fields;
            if (collectionName === 'BusinessData') {
                fields = 'businessName industry description audienceGroup _additional { id score distance }';
            }
            else {
                fields = 'title content category metadata source tags _additional { id score distance }';
            }
            const results = await this.weaviateClient.graphql
                .get()
                .withClassName(collectionName)
                .withFields(fields)
                .withBm25({ query })
                .withLimit(limit)
                .do();
            const objects = results.data.Get[collectionName] || [];
            return objects.map((obj) => {
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
                }
                else {
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
        }
        catch (error) {
            console.error(`❌ Error searching ${collectionName}:`, error);
            return [];
        }
    }
    generateAnswerFromContext(query, _context) {
        const queryLower = query.toLowerCase();
        if (queryLower.includes('template')) {
            return "I can help you create email templates! Based on your system, I can create templates with custom HTML content, subject lines, and styling. What would you like to name your template?";
        }
        if (queryLower.includes('campaign')) {
            return "I can help you create and manage email campaigns! I can assist with campaign setup, audience targeting, scheduling, and performance tracking. What would you like to name your campaign?";
        }
        if (queryLower.includes('evergreen') || queryLower.includes('company') || queryLower.includes('business')) {
            return "Evergreen Web Solutions is your web development and digital solutions company, owned by Gabe Lacroix and based in Terrace, BC. We specialize in web development, AI integration, digital marketing, and custom software solutions for local businesses.";
        }
        if (queryLower.includes('event') || queryLower.includes('terrace') || queryLower.includes('ai in terrace')) {
            return "The AI in Terrace event is a business informational seminar organized by Evergreen Web Solutions. It's designed to educate local businesses about AI opportunities, demonstrate practical AI applications, and provide personalized AI needs assessments for attendees.";
        }
        if (queryLower.includes('system') || queryLower.includes('capabilities') || queryLower.includes('features')) {
            return "The RSVP system offers comprehensive campaign management, template creation, audience segmentation, analytics, and automation features. I can help you create templates, set up campaigns, manage audiences, and analyze performance.";
        }
        return "I'm here to help with your RSVP system and Evergreen Web Solutions services. I can assist with creating email templates, managing campaigns, organizing audiences, and providing information about your business and the AI in Terrace event. What would you like to work on?";
    }
    combineContext(_context) {
        const allResults = [
            ..._context.trainingData,
            ..._context.codebase,
            ..._context.brandContext,
            ..._context.processes,
            ..._context.apis
        ];
        return allResults.map(result => `${result.title}: ${result.content}`).join('\n\n');
    }
    extractSources(_context) {
        const allResults = [
            ..._context.trainingData,
            ..._context.codebase,
            ..._context.brandContext,
            ..._context.processes,
            ..._context.apis
        ];
        return allResults.slice(0, 5);
    }
    extractRelatedComponents(_context) {
        const components = new Set();
        _context.trainingData.forEach((result) => {
            if (result.properties.tags) {
                result.properties.tags.forEach((tag) => components.add(tag));
            }
        });
        return Array.from(components).slice(0, 5);
    }
    generateNextSteps(query, _context) {
        const queryLower = query.toLowerCase();
        if (queryLower.includes('template')) {
            return ['Create email template', 'Design template content', 'Set up personalization tokens'];
        }
        if (queryLower.includes('campaign')) {
            return ['Create email campaign', 'Select target audience', 'Schedule campaign delivery'];
        }
        return ['Explore system capabilities', 'Create templates or campaigns', 'Set up audience groups'];
    }
    getFallbackResponse(_query) {
        return {
            answer: "I'm here to help with your RSVP system! I can assist with creating email templates, managing campaigns, organizing audiences, and providing information about Evergreen Web Solutions and the AI in Terrace event. What would you like to work on?",
            sources: [],
            confidence: 0.5,
            relatedComponents: [],
            nextSteps: ['Ask for specific help', 'Create templates or campaigns', 'Explore system features']
        };
    }
}
exports.RAGIntegrationSystem = RAGIntegrationSystem;
//# sourceMappingURL=rag-integration.js.map