#!/usr/bin/env python3
"""
SLM-Friendly RAG System Configuration
Configures Weaviate with comprehensive SLM training data for optimal AI understanding
"""

import json
import os
import weaviate
from typing import Dict, List, Any
from datetime import datetime

def connect_to_weaviate() -> weaviate.Client:
    """Connect to Weaviate instance"""
    try:
        # Try to connect to local Weaviate first
        client = weaviate.Client("http://localhost:8080")
        client.schema.get()  # Test connection
        print("✅ Connected to local Weaviate instance")
        return client
    except:
        try:
            # Try to connect to cloud Weaviate
            client = weaviate.Client(
                url="https://your-cluster-url.weaviate.network",
                auth_client_secret=weaviate.AuthApiKey(api_key="your-api-key")
            )
            client.schema.get()  # Test connection
            print("✅ Connected to cloud Weaviate instance")
            return client
        except Exception as e:
            print(f"❌ Failed to connect to Weaviate: {e}")
            print("Please ensure Weaviate is running or configure cloud connection")
            return None

def create_slm_knowledge_schema(client: weaviate.Client) -> None:
    """Create comprehensive schema for SLM knowledge base"""
    
    schema = {
        "class": "SLMKnowledge",
        "description": "Comprehensive knowledge base for Small Language Model training on RSVP application",
        "vectorizer": "text2vec-transformers",
        "moduleConfig": {
            "text2vec-transformers": {
                "model": "sentence-transformers/all-MiniLM-L6-v2",
                "options": {
                    "waitForModel": True
                }
            }
        },
        "properties": [
            {
                "name": "instruction",
                "dataType": ["text"],
                "description": "The instruction or question for the AI"
            },
            {
                "name": "input",
                "dataType": ["text"],
                "description": "The input context or parameters"
            },
            {
                "name": "output",
                "dataType": ["text"],
                "description": "The expected output or response"
            },
            {
                "name": "category",
                "dataType": ["text"],
                "description": "The category of knowledge (database, API, UI, etc.)"
            },
            {
                "name": "complexity",
                "dataType": ["text"],
                "description": "The complexity level (beginner, intermediate, advanced)"
            },
            {
                "name": "explanation_type",
                "dataType": ["text"],
                "description": "Type of explanation (conceptual, procedural, technical)"
            },
            {
                "name": "business_context",
                "dataType": ["text"],
                "description": "Business context and real-world usage scenarios"
            },
            {
                "name": "code_blocks",
                "dataType": ["text[]"],
                "description": "Extracted code blocks and examples"
            },
            {
                "name": "api_endpoints",
                "dataType": ["text[]"],
                "description": "API endpoints and methods"
            },
            {
                "name": "database_operations",
                "dataType": ["text[]"],
                "description": "Database operations and entities"
            },
            {
                "name": "business_concepts",
                "dataType": ["text[]"],
                "description": "Business concepts and workflows"
            },
            {
                "name": "learning_objectives",
                "dataType": ["text[]"],
                "description": "Learning objectives and goals"
            },
            {
                "name": "practical_applications",
                "dataType": ["text[]"],
                "description": "Practical applications and use cases"
            },
            {
                "name": "system_interconnections",
                "dataType": ["text"],
                "description": "How this knowledge connects to other system components"
            },
            {
                "name": "user_queries",
                "dataType": ["text[]"],
                "description": "Example user queries this knowledge can answer"
            },
            {
                "name": "ai_capabilities",
                "dataType": ["text[]"],
                "description": "AI capabilities enabled by this knowledge"
            },
            {
                "name": "created_at",
                "dataType": ["date"],
                "description": "When this knowledge was created"
            },
            {
                "name": "source_file",
                "dataType": ["text"],
                "description": "Source file of this knowledge"
            }
        ]
    }
    
    try:
        # Delete existing schema if it exists
        try:
            client.schema.delete_class("SLMKnowledge")
            print("🗑️  Deleted existing SLMKnowledge schema")
        except:
            pass
        
        # Create new schema
        client.schema.create_class(schema)
        print("✅ Created SLMKnowledge schema")
        
    except Exception as e:
        print(f"❌ Error creating schema: {e}")

def load_vectorized_data() -> List[Dict[str, Any]]:
    """Load the vectorized training data"""
    try:
        with open('slm-friendly-vectorized-data.json', 'r', encoding='utf-8') as f:
            data = json.load(f)
            return data['training_data']
    except FileNotFoundError:
        print("❌ Vectorized data file not found. Please run vectorize-slm-friendly-data.py first")
        return []
    except Exception as e:
        print(f"❌ Error loading vectorized data: {e}")
        return []

def prepare_knowledge_objects(training_data: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Prepare training data for Weaviate insertion"""
    knowledge_objects = []
    
    for item in training_data:
        # Extract components
        components = item.get('extracted_components', {})
        
        # Prepare the knowledge object
        knowledge_obj = {
            "instruction": item.get('instruction', ''),
            "input": item.get('input', ''),
            "output": item.get('output', ''),
            "category": item.get('source_file', '').replace('-slm-friendly.jsonl', ''),
            "complexity": "comprehensive",
            "explanation_type": "detailed",
            "business_context": item.get('context_explanation', {}).get('what_this_teaches', ''),
            "code_blocks": [block.get('code', '') for block in components.get('code_blocks', [])],
            "api_endpoints": [f"{ep.get('method', '')} {ep.get('endpoint', '')}" for ep in components.get('api_endpoints', [])],
            "database_operations": [f"{op.get('operation', '')} {op.get('entity', '')}" for op in components.get('database_operations', [])],
            "business_concepts": [concept.get('concept', '') for concept in components.get('business_concepts', [])],
            "learning_objectives": [
                item.get('learning_objectives', {}).get('primary', ''),
                item.get('learning_objectives', {}).get('secondary', ''),
                item.get('learning_objectives', {}).get('tertiary', '')
            ],
            "practical_applications": item.get('practical_applications', {}).get('user_queries', []),
            "system_interconnections": item.get('system_interconnections', {}).get('data_flow', ''),
            "user_queries": item.get('practical_applications', {}).get('user_queries', []),
            "ai_capabilities": item.get('practical_applications', {}).get('ai_capabilities', []),
            "created_at": datetime.now().isoformat(),
            "source_file": item.get('source_file', '')
        }
        
        # Clean up empty values
        for key, value in knowledge_obj.items():
            if isinstance(value, list) and not value:
                knowledge_obj[key] = []
            elif isinstance(value, str) and not value:
                knowledge_obj[key] = ""
        
        knowledge_objects.append(knowledge_obj)
    
    return knowledge_objects

def insert_knowledge_objects(client: weaviate.Client, knowledge_objects: List[Dict[str, Any]]) -> None:
    """Insert knowledge objects into Weaviate"""
    
    print(f"📥 Inserting {len(knowledge_objects)} knowledge objects...")
    
    # Batch insert for better performance
    batch_size = 10
    total_inserted = 0
    
    for i in range(0, len(knowledge_objects), batch_size):
        batch = knowledge_objects[i:i + batch_size]
        
        with client.batch as batch_client:
            for obj in batch:
                batch_client.add_data_object(
                    data_object=obj,
                    class_name="SLMKnowledge"
                )
        
        total_inserted += len(batch)
        print(f"   ✅ Inserted {total_inserted}/{len(knowledge_objects)} objects")
    
    print(f"🎉 Successfully inserted {total_inserted} knowledge objects")

def create_search_configurations(client: weaviate.Client) -> None:
    """Create optimized search configurations for different query types"""
    
    search_configs = {
        "conceptual_search": {
            "description": "Search for conceptual understanding and explanations",
            "properties": ["instruction", "output", "business_context", "learning_objectives"],
            "weights": [0.3, 0.4, 0.2, 0.1]
        },
        "procedural_search": {
            "description": "Search for step-by-step procedures and workflows",
            "properties": ["instruction", "output", "practical_applications", "system_interconnections"],
            "weights": [0.2, 0.3, 0.3, 0.2]
        },
        "technical_search": {
            "description": "Search for technical implementation details",
            "properties": ["code_blocks", "api_endpoints", "database_operations", "output"],
            "weights": [0.3, 0.2, 0.2, 0.3]
        },
        "business_search": {
            "description": "Search for business context and use cases",
            "properties": ["business_concepts", "business_context", "practical_applications", "user_queries"],
            "weights": [0.3, 0.3, 0.2, 0.2]
        }
    }
    
    # Save search configurations
    with open('slm-search-configurations.json', 'w', encoding='utf-8') as f:
        json.dump(search_configs, f, indent=2, ensure_ascii=False)
    
    print("✅ Created search configurations")

def test_rag_system(client: weaviate.Client) -> None:
    """Test the RAG system with sample queries"""
    
    test_queries = [
        "How do I create a new email campaign?",
        "How does the database work in this application?",
        "What are the main UI components?",
        "How do I handle errors in the application?",
        "How do I optimize performance?",
        "How do I test the application?",
        "How do I deploy the application?"
    ]
    
    print("\n🧪 Testing RAG system with sample queries...")
    
    for query in test_queries:
        print(f"\n❓ Query: {query}")
        
        try:
            # Perform vector search
            result = client.query.get(
                "SLMKnowledge",
                ["instruction", "output", "category", "business_context"]
            ).with_near_text({
                "concepts": [query]
            }).with_limit(3).do()
            
            if result['data']['Get']['SLMKnowledge']:
                for i, item in enumerate(result['data']['Get']['SLMKnowledge']):
                    print(f"   {i+1}. Category: {item['category']}")
                    print(f"      Instruction: {item['instruction'][:100]}...")
                    print(f"      Context: {item['business_context'][:100]}...")
            else:
                print("   No results found")
                
        except Exception as e:
            print(f"   ❌ Error: {e}")
    
    print("\n✅ RAG system testing complete")

def create_rag_integration_guide() -> None:
    """Create integration guide for the RAG system"""
    
    guide = {
        "title": "SLM-Friendly RAG System Integration Guide",
        "description": "How to integrate the comprehensive RAG system with your SLM",
        "created_at": datetime.now().isoformat(),
        "components": {
            "weaviate_knowledge_base": {
                "class_name": "SLMKnowledge",
                "description": "Comprehensive knowledge base with 7 categories of training data",
                "total_objects": "7 comprehensive examples",
                "search_types": ["conceptual", "procedural", "technical", "business"]
            },
            "search_configurations": {
                "file": "slm-search-configurations.json",
                "description": "Optimized search configurations for different query types",
                "usage": "Use appropriate search type based on user query intent"
            },
            "vectorized_data": {
                "file": "slm-friendly-vectorized-data.json",
                "description": "Comprehensive training data with detailed explanations",
                "categories": [
                    "database_operations",
                    "api_routing", 
                    "ui_components",
                    "error_handling",
                    "performance_optimization",
                    "testing_framework",
                    "deployment_config"
                ]
            }
        },
        "integration_steps": [
            "1. Connect to Weaviate instance",
            "2. Load SLMKnowledge schema",
            "3. Insert vectorized training data",
            "4. Configure search parameters",
            "5. Test RAG system with sample queries",
            "6. Integrate with SLM inference"
        ],
        "usage_examples": {
            "conceptual_queries": [
                "How does the RSVP system work?",
                "What is the purpose of each component?",
                "How do different parts connect together?"
            ],
            "procedural_queries": [
                "How do I create a campaign?",
                "How do I send emails to my audience?",
                "How do I track campaign performance?"
            ],
            "technical_queries": [
                "What API endpoints are available?",
                "How do I query the database?",
                "What are the database relationships?"
            ],
            "business_queries": [
                "How do I manage my audience?",
                "How do I optimize email delivery?",
                "How do I analyze campaign results?"
            ]
        },
        "best_practices": [
            "Use appropriate search type based on query intent",
            "Combine multiple search results for comprehensive answers",
            "Provide context from search results to SLM",
            "Use business context to improve response relevance",
            "Monitor and improve search quality over time"
        ]
    }
    
    with open('slm-rag-integration-guide.json', 'w', encoding='utf-8') as f:
        json.dump(guide, f, indent=2, ensure_ascii=False)
    
    print("✅ Created RAG integration guide")

def main():
    """Main configuration process"""
    print("🚀 Starting SLM-Friendly RAG System Configuration")
    print("=" * 60)
    
    # Connect to Weaviate
    client = connect_to_weaviate()
    if not client:
        return
    
    # Load vectorized data
    print("\n📚 Loading vectorized training data...")
    training_data = load_vectorized_data()
    if not training_data:
        return
    
    print(f"   ✅ Loaded {len(training_data)} training examples")
    
    # Create schema
    print("\n🏗️  Creating Weaviate schema...")
    create_slm_knowledge_schema(client)
    
    # Prepare knowledge objects
    print("\n🔧 Preparing knowledge objects...")
    knowledge_objects = prepare_knowledge_objects(training_data)
    print(f"   ✅ Prepared {len(knowledge_objects)} knowledge objects")
    
    # Insert into Weaviate
    print("\n📥 Inserting knowledge into Weaviate...")
    insert_knowledge_objects(client, knowledge_objects)
    
    # Create search configurations
    print("\n⚙️  Creating search configurations...")
    create_search_configurations(client)
    
    # Test RAG system
    print("\n🧪 Testing RAG system...")
    test_rag_system(client)
    
    # Create integration guide
    print("\n📖 Creating integration guide...")
    create_rag_integration_guide()
    
    print("\n🎉 SLM-Friendly RAG System Configuration Complete!")
    print("=" * 60)
    print("📋 Next Steps:")
    print("   1. Review slm-rag-integration-guide.json")
    print("   2. Integrate RAG system with your SLM")
    print("   3. Test with real user queries")
    print("   4. Monitor and improve search quality")
    print("\n✨ Your SLM now has comprehensive knowledge of the RSVP application!")

if __name__ == "__main__":
    main()

