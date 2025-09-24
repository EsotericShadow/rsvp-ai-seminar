#!/usr/bin/env python3
"""
Test RAG Search Directly
"""

import weaviate
import json

# Weaviate configuration
WEAVIATE_URL = "https://rbq70xfws0wsquqdhxxc4w.c0.us-west3.gcp.weaviate.cloud"
WEAVIATE_API_KEY = "enZ6V29tM3VaeG1PQ25jZV96bVRhdHR5OGJUWlp2SmlwQTdaUUZ1VHVLZmJ3a2ZoRUFYK1YzbkltVmZnPV92MjAw"

def test_rag_search():
    """Test RAG search directly"""
    print("🔍 TESTING RAG SEARCH DIRECTLY")
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
        
        # Test the exact query that the health check uses
        test_query = "test connection"
        print(f"🔍 Testing query: '{test_query}'")
        
        results = kb_collection.query.bm25(
            query=test_query,
            limit=3
        )
        
        print(f"✅ Found {len(results.objects)} results")
        
        for i, obj in enumerate(results.objects):
            print(f"\n📋 Result {i+1}:")
            print(f"   Title: {obj.properties.get('title', 'No title')}")
            print(f"   Category: {obj.properties.get('category', 'No category')}")
            print(f"   Content: {obj.properties.get('content', 'No content')[:100]}...")
        
        # Test with a more specific query
        specific_query = "create campaign"
        print(f"\n🔍 Testing specific query: '{specific_query}'")
        
        results2 = kb_collection.query.bm25(
            query=specific_query,
            limit=3
        )
        
        print(f"✅ Found {len(results2.objects)} results")
        
        for i, obj in enumerate(results2.objects):
            print(f"\n📋 Result {i+1}:")
            print(f"   Title: {obj.properties.get('title', 'No title')}")
            print(f"   Category: {obj.properties.get('category', 'No category')}")
            print(f"   Content: {obj.properties.get('content', 'No content')[:100]}...")
        
        client.close()
        return True
        
    except Exception as e:
        print(f"❌ Test failed: {e}")
        return False

def main():
    """Main function"""
    test_rag_search()

if __name__ == "__main__":
    main()

