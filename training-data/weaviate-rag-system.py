#!/usr/bin/env python3
"""
Comprehensive Weaviate RAG System for RSVP Application
Integrates vectorized training data with Evergreen brand context and codebase knowledge
"""

import json
import os
import re
from typing import Dict, List, Any, Optional, Tuple
from dataclasses import dataclass, asdict
from pathlib import Path
import weaviate
from weaviate.classes.config import Configure, Property, DataType
import openai
from datetime import datetime

@dataclass
class RAGDocument:
    """Structured document for RAG system"""
    id: str
    title: str
    content: str
    category: str
    subcategory: str
    code_snippets: List[Dict[str, str]]
    processes: List[Dict[str, str]]
    interconnections: List[str]
    usage_examples: List[str]
    troubleshooting: List[str]
    related_apis: List[str]
    related_components: List[str]
    tags: List[str]
    complexity_level: str
    evergreen_brand_context: Dict[str, Any]
    vector_embedding: Optional[List[float]] = None
    created_at: str = ""
    updated_at: str = ""

class WeaviateRAGSystem:
    def __init__(self, weaviate_url: str, weaviate_api_key: str, openai_api_key: str):
        self.weaviate_url = weaviate_url
        self.weaviate_api_key = weaviate_api_key
        self.openai_api_key = openai_api_key
        
        # Initialize clients
        self.weaviate_client = weaviate.connect_to_weaviate_cloud(
            cluster_url=weaviate_url,
            auth_credentials=weaviate.auth.AuthApiKey(weaviate_api_key)
        )
        
        openai.api_key = openai_api_key
        
        # Collection names
        self.collections = {
            "training_data": "RSVPTrainingData",
            "codebase": "RSVPCodebase", 
            "brand_context": "EvergreenBrandContext",
            "processes": "RSVPProcesses",
            "apis": "RSVPAPIs"
        }
        
    def create_schemas(self):
        """Create Weaviate schemas for all collections"""
        print("Creating Weaviate schemas...")
        
        # Training Data Collection
        self.weaviate_client.collections.create(
            name=self.collections["training_data"],
            properties=[
                Property(name="title", data_type=DataType.TEXT),
                Property(name="content", data_type=DataType.TEXT),
                Property(name="category", data_type=DataType.TEXT),
                Property(name="subcategory", data_type=DataType.TEXT),
                Property(name="code_snippets", data_type=DataType.TEXT),
                Property(name="processes", data_type=DataType.TEXT),
                Property(name="interconnections", data_type=DataType.TEXT),
                Property(name="usage_examples", data_type=DataType.TEXT),
                Property(name="troubleshooting", data_type=DataType.TEXT),
                Property(name="related_apis", data_type=DataType.TEXT),
                Property(name="related_components", data_type=DataType.TEXT),
                Property(name="tags", data_type=DataType.TEXT),
                Property(name="complexity_level", data_type=DataType.TEXT),
                Property(name="evergreen_brand_context", data_type=DataType.TEXT),
                Property(name="created_at", data_type=DataType.DATE),
                Property(name="updated_at", data_type=DataType.DATE)
            ],
            vectorizer_config=Configure.Vectorizer.text2vec_openai(
                model="text-embedding-3-small",
                dimensions=1536
            )
        )
        
        # Codebase Collection
        self.weaviate_client.collections.create(
            name=self.collections["codebase"],
            properties=[
                Property(name="file_path", data_type=DataType.TEXT),
                Property(name="file_type", data_type=DataType.TEXT),
                Property(name="content", data_type=DataType.TEXT),
                Property(name="functions", data_type=DataType.TEXT),
                Property(name="classes", data_type=DataType.TEXT),
                Property(name="imports", data_type=DataType.TEXT),
                Property(name="exports", data_type=DataType.TEXT),
                Property(name="dependencies", data_type=DataType.TEXT),
                Property(name="purpose", data_type=DataType.TEXT),
                Property(name="usage_context", data_type=DataType.TEXT),
                Property(name="created_at", data_type=DataType.DATE)
            ],
            vectorizer_config=Configure.Vectorizer.text2vec_openai(
                model="text-embedding-3-small",
                dimensions=1536
            )
        )
        
        # Brand Context Collection
        self.weaviate_client.collections.create(
            name=self.collections["brand_context"],
            properties=[
                Property(name="company_name", data_type=DataType.TEXT),
                Property(name="owner", data_type=DataType.TEXT),
                Property(name="location", data_type=DataType.TEXT),
                Property(name="business_focus", data_type=DataType.TEXT),
                Property(name="target_audience", data_type=DataType.TEXT),
                Property(name="services", data_type=DataType.TEXT),
                Property(name="event_context", data_type=DataType.TEXT),
                Property(name="venue", data_type=DataType.TEXT),
                Property(name="event_date", data_type=DataType.TEXT),
                Property(name="regional_focus", data_type=DataType.TEXT),
                Property(name="technology_focus", data_type=DataType.TEXT),
                Property(name="target_market", data_type=DataType.TEXT),
                Property(name="brand_guidelines", data_type=DataType.TEXT),
                Property(name="created_at", data_type=DataType.DATE)
            ],
            vectorizer_config=Configure.Vectorizer.text2vec_openai(
                model="text-embedding-3-small",
                dimensions=1536
            )
        )
        
        # Processes Collection
        self.weaviate_client.collections.create(
            name=self.collections["processes"],
            properties=[
                Property(name="process_name", data_type=DataType.TEXT),
                Property(name="description", data_type=DataType.TEXT),
                Property(name="steps", data_type=DataType.TEXT),
                Property(name="inputs", data_type=DataType.TEXT),
                Property(name="outputs", data_type=DataType.TEXT),
                Property(name="dependencies", data_type=DataType.TEXT),
                Property(name="error_handling", data_type=DataType.TEXT),
                Property(name="performance_notes", data_type=DataType.TEXT),
                Property(name="related_components", data_type=DataType.TEXT),
                Property(name="created_at", data_type=DataType.DATE)
            ],
            vectorizer_config=Configure.Vectorizer.text2vec_openai(
                model="text-embedding-3-small",
                dimensions=1536
            )
        )
        
        # APIs Collection
        self.weaviate_client.collections.create(
            name=self.collections["apis"],
            properties=[
                Property(name="endpoint", data_type=DataType.TEXT),
                Property(name="method", data_type=DataType.TEXT),
                Property(name="description", data_type=DataType.TEXT),
                Property(name="parameters", data_type=DataType.TEXT),
                Property(name="response_format", data_type=DataType.TEXT),
                Property(name="authentication", data_type=DataType.TEXT),
                Property(name="rate_limits", data_type=DataType.TEXT),
                Property(name="error_codes", data_type=DataType.TEXT),
                Property(name="usage_examples", data_type=DataType.TEXT),
                Property(name="related_endpoints", data_type=DataType.TEXT),
                Property(name="created_at", data_type=DataType.DATE)
            ],
            vectorizer_config=Configure.Vectorizer.text2vec_openai(
                model="text-embedding-3-small",
                dimensions=1536
            )
        )
        
        print("Schemas created successfully!")
    
    def load_vectorized_training_data(self, file_path: str) -> List[RAGDocument]:
        """Load and convert vectorized training data to RAG documents"""
        print(f"Loading vectorized training data from {file_path}...")
        
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        documents = []
        for item in data:
            # Create comprehensive content for vectorization
            content_parts = [
                f"Title: {item['title']}",
                f"Description: {item['description']}",
                f"Category: {item['category']}",
                f"Subcategory: {item['subcategory']}"
            ]
            
            # Add code snippets
            if item['code_snippets']:
                content_parts.append("Code Snippets:")
                for snippet in item['code_snippets']:
                    content_parts.append(f"- {snippet['purpose']}: {snippet['code'][:500]}...")
            
            # Add processes
            if item['processes']:
                content_parts.append("Processes:")
                for process in item['processes']:
                    content_parts.append(f"- {process['description']}")
            
            # Add interconnections
            if item['interconnections']:
                content_parts.append(f"Interconnections: {', '.join(item['interconnections'])}")
            
            # Add usage examples
            if item['usage_examples']:
                content_parts.append("Usage Examples:")
                for example in item['usage_examples']:
                    content_parts.append(f"- {example}")
            
            # Add troubleshooting
            if item['troubleshooting']:
                content_parts.append("Troubleshooting:")
                for issue in item['troubleshooting']:
                    content_parts.append(f"- {issue}")
            
            # Add related APIs and components
            if item['related_apis']:
                content_parts.append(f"Related APIs: {', '.join(item['related_apis'])}")
            
            if item['related_components']:
                content_parts.append(f"Related Components: {', '.join(item['related_components'])}")
            
            # Add tags
            if item['tags']:
                content_parts.append(f"Tags: {', '.join(item['tags'])}")
            
            # Add Evergreen brand context
            if item['evergreen_brand_context']:
                brand_context = item['evergreen_brand_context']
                content_parts.append("Evergreen Brand Context:")
                for key, value in brand_context.items():
                    content_parts.append(f"- {key}: {value}")
            
            document = RAGDocument(
                id=item['id'],
                title=item['title'],
                content="\n".join(content_parts),
                category=item['category'],
                subcategory=item['subcategory'],
                code_snippets=item['code_snippets'],
                processes=item['processes'],
                interconnections=item['interconnections'],
                usage_examples=item['usage_examples'],
                troubleshooting=item['troubleshooting'],
                related_apis=item['related_apis'],
                related_components=item['related_components'],
                tags=item['tags'],
                complexity_level=item['complexity_level'],
                evergreen_brand_context=item['evergreen_brand_context'],
                created_at=datetime.now().isoformat(),
                updated_at=datetime.now().isoformat()
            )
            
            documents.append(document)
        
        print(f"Loaded {len(documents)} training documents")
        return documents
    
    def extract_codebase_knowledge(self, codebase_path: str) -> List[RAGDocument]:
        """Extract knowledge from the codebase"""
        print(f"Extracting codebase knowledge from {codebase_path}...")
        
        documents = []
        codebase_path = Path(codebase_path)
        
        # File patterns to analyze
        patterns = {
            "typescript": ["**/*.ts", "**/*.tsx"],
            "javascript": ["**/*.js", "**/*.jsx"],
            "json": ["**/*.json"],
            "markdown": ["**/*.md"],
            "sql": ["**/*.sql"]
        }
        
        for file_type, file_patterns in patterns.items():
            for pattern in file_patterns:
                for file_path in codebase_path.glob(pattern):
                    if self._should_skip_file(file_path):
                        continue
                    
                    try:
                        content = file_path.read_text(encoding='utf-8')
                        
                        # Extract structured information
                        functions = self._extract_functions(content, file_type)
                        classes = self._extract_classes(content, file_type)
                        imports = self._extract_imports(content, file_type)
                        exports = self._extract_exports(content, file_type)
                        purpose = self._infer_file_purpose(content, file_path.name)
                        
                        # Create comprehensive content
                        content_parts = [
                            f"File: {file_path.relative_to(codebase_path)}",
                            f"Type: {file_type}",
                            f"Purpose: {purpose}",
                            f"Content: {content[:2000]}..." if len(content) > 2000 else f"Content: {content}"
                        ]
                        
                        if functions:
                            content_parts.append(f"Functions: {', '.join(functions)}")
                        
                        if classes:
                            content_parts.append(f"Classes: {', '.join(classes)}")
                        
                        if imports:
                            content_parts.append(f"Imports: {', '.join(imports[:10])}")  # Limit imports
                        
                        if exports:
                            content_parts.append(f"Exports: {', '.join(exports)}")
                        
                        document = RAGDocument(
                            id=f"codebase_{file_path.stem}",
                            title=f"{file_path.name} - {purpose}",
                            content="\n".join(content_parts),
                            category="Codebase",
                            subcategory=file_type,
                            code_snippets=[{"language": file_type, "code": content, "purpose": purpose}],
                            processes=[],
                            interconnections=imports + exports,
                            usage_examples=[],
                            troubleshooting=[],
                            related_apis=[],
                            related_components=[],
                            tags=[file_type, "codebase"],
                            complexity_level="intermediate",
                            evergreen_brand_context={},
                            created_at=datetime.now().isoformat(),
                            updated_at=datetime.now().isoformat()
                        )
                        
                        documents.append(document)
                        
                    except Exception as e:
                        print(f"Error processing {file_path}: {e}")
                        continue
        
        print(f"Extracted {len(documents)} codebase documents")
        return documents
    
    def _should_skip_file(self, file_path: Path) -> bool:
        """Determine if file should be skipped"""
        skip_patterns = [
            "node_modules",
            ".git",
            ".next",
            "dist",
            "build",
            ".env",
            "package-lock.json",
            "tsconfig.tsbuildinfo"
        ]
        
        return any(pattern in str(file_path) for pattern in skip_patterns)
    
    def _extract_functions(self, content: str, file_type: str) -> List[str]:
        """Extract function names from content"""
        functions = []
        
        if file_type in ["typescript", "javascript"]:
            # Extract function declarations
            function_patterns = [
                r'function\s+(\w+)\s*\(',
                r'const\s+(\w+)\s*=\s*(?:async\s+)?\([^)]*\)\s*=>',
                r'export\s+(?:async\s+)?function\s+(\w+)\s*\(',
                r'export\s+const\s+(\w+)\s*=\s*(?:async\s+)?\([^)]*\)\s*=>'
            ]
            
            for pattern in function_patterns:
                matches = re.findall(pattern, content)
                functions.extend(matches)
        
        return list(set(functions))  # Remove duplicates
    
    def _extract_classes(self, content: str, file_type: str) -> List[str]:
        """Extract class names from content"""
        classes = []
        
        if file_type in ["typescript", "javascript"]:
            class_patterns = [
                r'class\s+(\w+)',
                r'export\s+class\s+(\w+)'
            ]
            
            for pattern in class_patterns:
                matches = re.findall(pattern, content)
                classes.extend(matches)
        
        return list(set(classes))
    
    def _extract_imports(self, content: str, file_type: str) -> List[str]:
        """Extract import statements"""
        imports = []
        
        if file_type in ["typescript", "javascript"]:
            import_patterns = [
                r'import\s+.*?\s+from\s+[\'"]([^\'"]+)[\'"]',
                r'import\s+[\'"]([^\'"]+)[\'"]'
            ]
            
            for pattern in import_patterns:
                matches = re.findall(pattern, content)
                imports.extend(matches)
        
        return list(set(imports))
    
    def _extract_exports(self, content: str, file_type: str) -> List[str]:
        """Extract export statements"""
        exports = []
        
        if file_type in ["typescript", "javascript"]:
            export_patterns = [
                r'export\s+(?:const|function|class)\s+(\w+)',
                r'export\s*{\s*([^}]+)\s*}'
            ]
            
            for pattern in export_patterns:
                matches = re.findall(pattern, content)
                for match in matches:
                    if ',' in match:
                        exports.extend([item.strip() for item in match.split(',')])
                    else:
                        exports.append(match.strip())
        
        return list(set(exports))
    
    def _infer_file_purpose(self, content: str, filename: str) -> str:
        """Infer the purpose of a file based on content and filename"""
        content_lower = content.lower()
        filename_lower = filename.lower()
        
        if "api" in filename_lower or "route" in filename_lower:
            return "API endpoint"
        elif "component" in filename_lower or "tsx" in filename_lower:
            return "React component"
        elif "schema" in filename_lower or "model" in filename_lower:
            return "Database schema"
        elif "middleware" in filename_lower:
            return "Middleware"
        elif "config" in filename_lower:
            return "Configuration"
        elif "test" in filename_lower:
            return "Test file"
        elif "prisma" in content_lower:
            return "Database operations"
        elif "zod" in content_lower:
            return "Validation schema"
        elif "resend" in content_lower or "sendgrid" in content_lower:
            return "Email service"
        elif "weaviate" in content_lower:
            return "Vector database"
        else:
            return "General utility"
    
    def create_evergreen_brand_context(self) -> List[RAGDocument]:
        """Create comprehensive Evergreen brand context documents"""
        print("Creating Evergreen brand context documents...")
        
        brand_documents = [
            RAGDocument(
                id="evergreen_company_overview",
                title="Evergreen Web Solutions - Company Overview",
                content="""
                Evergreen Web Solutions is a web development and AI automation company based in Terrace, BC, Canada.
                Founded and operated by Gabriel Lacroix, the company specializes in providing AI solutions and web development
                services specifically tailored for Northern BC businesses.
                
                Company Details:
                - Owner: Gabriel Lacroix
                - Location: Terrace, BC, Canada
                - Business Focus: AI automation and web solutions for Northern BC businesses
                - Target Audience: Northern BC businesses seeking AI implementation
                - Services: AI implementation, Web development, Business automation
                - Regional Focus: Northern BC
                - Technology Focus: AI and automation
                - Target Market: Businesses
                
                The company is hosting an "AI in Northern BC: Information Session" event on October 23, 2025,
                at the Sunshine Inn Terrace — Jasmine Room, located at 4812 Hwy 16, Terrace, BC, Canada.
                """,
                category="Brand Context",
                subcategory="Company Overview",
                code_snippets=[],
                processes=[],
                interconnections=[],
                usage_examples=[],
                troubleshooting=[],
                related_apis=[],
                related_components=[],
                tags=["evergreen", "company", "brand", "northern-bc"],
                complexity_level="simple",
                evergreen_brand_context={
                    "company": "Evergreen Web Solutions",
                    "owner": "Gabriel Lacroix",
                    "location": "Terrace, BC, Canada",
                    "business_focus": "AI automation and web solutions for Northern BC businesses",
                    "target_audience": "Northern BC businesses",
                    "services": ["AI implementation", "Web development", "Business automation"],
                    "regional_focus": "Northern BC",
                    "technology_focus": "AI and automation",
                    "target_market": "Businesses"
                },
                created_at=datetime.now().isoformat(),
                updated_at=datetime.now().isoformat()
            ),
            
            RAGDocument(
                id="evergreen_event_context",
                title="AI in Northern BC: Information Session - Event Details",
                content="""
                Event: AI in Northern BC: Information Session
                Date: Thursday, October 23, 2025
                Time: 6:00 PM - 8:30 PM (Doors open at 6:00 PM)
                Venue: Sunshine Inn Terrace — Jasmine Room
                Address: 4812 Hwy 16, Terrace, BC, Canada
                Host: Gabriel Lacroix • Evergreen Web Solutions
                
                Event Description:
                A plain-language evening for Northern BC businesses: real local examples and clear first steps for adopting AI.
                
                What attendees will learn:
                - Real local examples of AI automation, machine learning, and custom AI integrations that worked — and what they cost
                - Clear first steps for adopting AI in your business, tailored to Northern BC's unique challenges and opportunities
                - Networking with other local business owners who are exploring AI solutions
                - Q&A session with Gabriel Lacroix, who has implemented AI solutions for Northern BC businesses
                
                RSVP Information:
                - Limited seats available
                - RSVP closes Thursday, October 16, 2025
                - Free event
                - Business-focused content
                """,
                category="Brand Context",
                subcategory="Event Information",
                code_snippets=[],
                processes=[],
                interconnections=[],
                usage_examples=[],
                troubleshooting=[],
                related_apis=[],
                related_components=[],
                tags=["evergreen", "event", "ai", "northern-bc", "information-session"],
                complexity_level="simple",
                evergreen_brand_context={
                    "event_context": "AI in Northern BC: Information Session",
                    "venue": "Sunshine Inn Terrace — Jasmine Room",
                    "event_date": "October 23, 2025",
                    "event_time": "6:00 PM - 8:30 PM",
                    "event_address": "4812 Hwy 16, Terrace, BC, Canada",
                    "event_host": "Gabriel Lacroix • Evergreen Web Solutions",
                    "rsvp_deadline": "October 16, 2025"
                },
                created_at=datetime.now().isoformat(),
                updated_at=datetime.now().isoformat()
            ),
            
            RAGDocument(
                id="evergreen_technical_context",
                title="Evergreen Web Solutions - Technical Stack and Approach",
                content="""
                Technical Stack and Approach:
                
                Frontend:
                - Next.js 14 with App Router
                - React 18 with TypeScript
                - Tailwind CSS for styling
                - Framer Motion for animations
                
                Backend:
                - Next.js API routes
                - Prisma ORM with PostgreSQL
                - Server-side rendering and static generation
                
                Email Services:
                - Resend for campaign emails
                - SendGrid for transactional emails (RSVP confirmations)
                - ImprovMX for email receiving
                
                AI and Vector Database:
                - Weaviate for vector storage and RAG
                - OpenAI GPT models for AI agent
                - Custom SLM fine-tuning with Qwen2.5-3B
                
                Security:
                - CSRF protection
                - Rate limiting
                - Input sanitization
                - JWT session management
                - Security headers
                
                Analytics:
                - Custom analytics system
                - UTM tracking
                - Visitor session management
                - LeadMine integration for business data
                
                Development Approach:
                - TypeScript-first development
                - Comprehensive validation with Zod
                - Security-first mindset
                - Performance optimization
                - Accessibility compliance
                """,
                category="Brand Context",
                subcategory="Technical Stack",
                code_snippets=[],
                processes=[],
                interconnections=[],
                usage_examples=[],
                troubleshooting=[],
                related_apis=[],
                related_components=[],
                tags=["evergreen", "technical", "stack", "architecture"],
                complexity_level="intermediate",
                evergreen_brand_context={
                    "frontend_tech": ["Next.js", "React", "TypeScript", "Tailwind CSS"],
                    "backend_tech": ["Next.js API", "Prisma", "PostgreSQL"],
                    "email_services": ["Resend", "SendGrid", "ImprovMX"],
                    "ai_services": ["Weaviate", "OpenAI", "Qwen2.5-3B"],
                    "security_features": ["CSRF", "Rate Limiting", "JWT", "Input Sanitization"],
                    "analytics": ["Custom Analytics", "UTM Tracking", "LeadMine"]
                },
                created_at=datetime.now().isoformat(),
                updated_at=datetime.now().isoformat()
            )
        ]
        
        print(f"Created {len(brand_documents)} brand context documents")
        return brand_documents
    
    def index_documents(self, documents: List[RAGDocument], collection_name: str):
        """Index documents in Weaviate"""
        print(f"Indexing {len(documents)} documents in {collection_name}...")
        
        collection = self.weaviate_client.collections.get(collection_name)
        
        for i, doc in enumerate(documents):
            try:
                # Convert document to Weaviate format
                weaviate_doc = {
                    "title": doc.title,
                    "content": doc.content,
                    "category": doc.category,
                    "subcategory": doc.subcategory,
                    "code_snippets": json.dumps(doc.code_snippets),
                    "processes": json.dumps(doc.processes),
                    "interconnections": json.dumps(doc.interconnections),
                    "usage_examples": json.dumps(doc.usage_examples),
                    "troubleshooting": json.dumps(doc.troubleshooting),
                    "related_apis": json.dumps(doc.related_apis),
                    "related_components": json.dumps(doc.related_components),
                    "tags": json.dumps(doc.tags),
                    "complexity_level": doc.complexity_level,
                    "evergreen_brand_context": json.dumps(doc.evergreen_brand_context),
                    "created_at": doc.created_at,
                    "updated_at": doc.updated_at
                }
                
                # Insert document
                collection.data.insert(
                    properties=weaviate_doc,
                    uuid=doc.id
                )
                
                if (i + 1) % 10 == 0:
                    print(f"  Indexed {i + 1}/{len(documents)} documents...")
                    
            except Exception as e:
                print(f"Error indexing document {doc.id}: {e}")
                continue
        
        print(f"Successfully indexed {len(documents)} documents in {collection_name}")
    
    def search_documents(self, query: str, collection_name: str, limit: int = 5) -> List[Dict[str, Any]]:
        """Search documents in Weaviate"""
        collection = self.weaviate_client.collections.get(collection_name)
        
        response = collection.query.near_text(
            query=query,
            limit=limit,
            return_metadata=["score", "distance"]
        )
        
        results = []
        for obj in response.objects:
            results.append({
                "id": obj.uuid,
                "title": obj.properties.get("title", ""),
                "content": obj.properties.get("content", ""),
                "category": obj.properties.get("category", ""),
                "subcategory": obj.properties.get("subcategory", ""),
                "score": obj.metadata.score,
                "distance": obj.metadata.distance,
                "properties": obj.properties
            })
        
        return results
    
    def comprehensive_search(self, query: str, limit_per_collection: int = 3) -> Dict[str, List[Dict[str, Any]]]:
        """Search across all collections"""
        results = {}
        
        for collection_name in self.collections.values():
            try:
                results[collection_name] = self.search_documents(query, collection_name, limit_per_collection)
            except Exception as e:
                print(f"Error searching {collection_name}: {e}")
                results[collection_name] = []
        
        return results
    
    def generate_rag_response(self, query: str, context_documents: List[Dict[str, Any]]) -> str:
        """Generate a comprehensive response using RAG context"""
        
        # Prepare context
        context_parts = []
        for doc in context_documents:
            context_parts.append(f"Title: {doc['title']}")
            context_parts.append(f"Content: {doc['content'][:1000]}...")
            context_parts.append(f"Category: {doc['category']}")
            context_parts.append("---")
        
        context = "\n".join(context_parts)
        
        # Generate response using OpenAI
        prompt = f"""
        You are Juniper, an AI assistant for Evergreen Web Solutions, helping Gabriel Lacroix manage email campaigns and analyze data.
        
        Context from the RSVP application knowledge base:
        {context}
        
        User Query: {query}
        
        Please provide a comprehensive, accurate response based on the context above. Include:
        1. Direct answers to the user's question
        2. Relevant code examples if applicable
        3. Step-by-step processes if needed
        4. Related components or APIs
        5. Troubleshooting tips if relevant
        6. Evergreen brand context when appropriate
        
        Be specific, actionable, and maintain the professional tone of Evergreen Web Solutions.
        """
        
        try:
            response = openai.ChatCompletion.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": "You are Juniper, an AI assistant for Evergreen Web Solutions."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=2000,
                temperature=0.7
            )
            
            return response.choices[0].message.content
            
        except Exception as e:
            return f"Error generating response: {e}"
    
    def close(self):
        """Close Weaviate connection"""
        self.weaviate_client.close()

def main():
    """Main function to set up the RAG system"""
    
    # Configuration
    WEAVIATE_URL = os.getenv("WEAVIATE_URL", "https://your-cluster.weaviate.network")
    WEAVIATE_API_KEY = os.getenv("WEAVIATE_API_KEY", "your-api-key")
    OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "your-openai-key")
    
    # Initialize RAG system
    rag_system = WeaviateRAGSystem(WEAVIATE_URL, WEAVIATE_API_KEY, OPENAI_API_KEY)
    
    try:
        # Create schemas
        rag_system.create_schemas()
        
        # Load and index training data
        training_docs = rag_system.load_vectorized_training_data("vectorized-training-data.json")
        rag_system.index_documents(training_docs, rag_system.collections["training_data"])
        
        # Extract and index codebase knowledge
        codebase_docs = rag_system.extract_codebase_knowledge("../src")
        rag_system.index_documents(codebase_docs, rag_system.collections["codebase"])
        
        # Create and index brand context
        brand_docs = rag_system.create_evergreen_brand_context()
        rag_system.index_documents(brand_docs, rag_system.collections["brand_context"])
        
        print("RAG system setup complete!")
        
        # Example search
        print("\nExample search:")
        results = rag_system.comprehensive_search("How does RSVP form validation work?")
        
        for collection, docs in results.items():
            print(f"\n{collection}:")
            for doc in docs:
                print(f"  - {doc['title']} (score: {doc['score']:.3f})")
        
    except Exception as e:
        print(f"Error setting up RAG system: {e}")
    
    finally:
        rag_system.close()

if __name__ == "__main__":
    main()


