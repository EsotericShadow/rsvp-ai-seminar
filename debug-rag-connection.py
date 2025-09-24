#!/usr/bin/env python3
"""
Debug RAG Connection Issues
"""

import weaviate
import json

# Weaviate configuration
WEAVIATE_URL = "https://rbq70xfws0wsquqdhxxc4w.c0.us-west3.gcp.weaviate.cloud"
WEAVIATE_API_KEY = "enZ6V29tM3VaeG1PQ25jZV96bVRhdHR5OGJUWlp2SmlwQTdaUUZ1VHVLZmJ3a2ZoRUFYK1YzbkltVmZnPV92MjAw"

def debug_rag_connection():
    """Debug the RAG connection issues"""
    print("🔍 DEBUGGING RAG CONNECTION ISSUES")
    print("=" * 50)
    
    try:
        # Connect to Weaviate
        client = weaviate.connect_to_weaviate_cloud(
            cluster_url=WEAVIATE_URL,
            auth_credentials=weaviate.auth.AuthApiKey(WEAVIATE_API_KEY)
        )
        print("✅ Connected to Weaviate")
        
        # Get KnowledgeBase collection
        kb_collection = client.collections.get("KnowledgeBase")
        
        # Test the exact query that Next.js would use
        print("\n🔍 Testing BM25 search...")
        results = kb_collection.query.bm25(
            query="create campaign",
            limit=3
        )
        
        print(f"✅ Found {len(results.objects)} results")
        
        for i, obj in enumerate(results.objects):
            print(f"\n📋 Result {i+1}:")
            print(f"   Title: {obj.properties.get('title', 'No title')}")
            print(f"   Category: {obj.properties.get('category', 'No category')}")
            print(f"   Content length: {len(obj.properties.get('content', ''))}")
            print(f"   Source: {obj.properties.get('source', 'No source')}")
            print(f"   Created by: {obj.properties.get('createdBy', 'No creator')}")
            print(f"   Metadata: {obj.properties.get('metadata', 'No metadata')}")
            print(f"   Tags: {obj.properties.get('tags', 'No tags')}")
        
        # Test what the Next.js API should return
        print(f"\n🔍 Testing what Next.js API should return...")
        
        # Simulate the RAG search result format
        rag_results = []
        for obj in results.objects:
            rag_result = {
                "id": str(obj.uuid),
                "title": obj.properties.get('title', ''),
                "content": obj.properties.get('content', ''),
                "category": obj.properties.get('category', ''),
                "subcategory": obj.properties.get('subcategory', ''),
                "score": 0.8,  # BM25 doesn't provide certainty scores
                "distance": 0.0,
                "properties": obj.properties
            }
            rag_results.append(rag_result)
        
        print(f"✅ RAG results format:")
        print(json.dumps(rag_results[0] if rag_results else {}, indent=2))
        
        # Test the health check response format
        print(f"\n🔍 Testing health check response format...")
        
        health_response = {
            "status": "healthy",
            "ragSystem": "connected",
            "collections": {
                "trainingData": len(rag_results),
                "codebase": len(rag_results),
                "brandContext": 0,  # BusinessData collection
                "processes": len(rag_results),
                "apis": len(rag_results)
            },
            "timestamp": "2025-09-24T05:45:00.000Z"
        }
        
        print(f"✅ Health check response:")
        print(json.dumps(health_response, indent=2))
        
        client.close()
        return True
        
    except Exception as e:
        print(f"❌ Debug failed: {e}")
        return False

def main():
    """Main function"""
    debug_rag_connection()

if __name__ == "__main__":
    main()
