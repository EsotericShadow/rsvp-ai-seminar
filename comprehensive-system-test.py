#!/usr/bin/env python3
"""
Comprehensive System Testing - Find All Potential Issues
"""

import weaviate
import requests
import json
import time
from typing import Dict, List, Any

# Configuration
WEAVIATE_URL = "https://rbq70xfws0wsquqdhxxc4w.c0.us-west3.gcp.weaviate.cloud"
WEAVIATE_API_KEY = "enZ6V29tM3VaeG1PQ25jZV96bVRhdHR5OGJUWlp2SmlwQTdaUUZ1VHVLZmJ3a2ZoRUFYK1YzbkltVmZnPV92MjAw"
NEXTJS_BASE_URL = "http://localhost:3000"

class SystemTester:
    def __init__(self):
        self.issues = []
        self.test_results = {}
        
    def log_issue(self, test_name: str, issue: str, severity: str = "ERROR"):
        """Log an issue found during testing"""
        self.issues.append({
            "test": test_name,
            "issue": issue,
            "severity": severity,
            "timestamp": time.time()
        })
        print(f"❌ {severity}: {test_name} - {issue}")
    
    def log_success(self, test_name: str, message: str):
        """Log a successful test"""
        print(f"✅ SUCCESS: {test_name} - {message}")
    
    def test_weaviate_connection(self):
        """Test 1: Weaviate RAG System Connectivity"""
        print("\n🔍 TEST 1: WEAVIATE RAG SYSTEM CONNECTIVITY")
        print("=" * 60)
        
        try:
            # Test connection
            client = weaviate.connect_to_weaviate_cloud(
                cluster_url=WEAVIATE_URL,
                auth_credentials=weaviate.auth.AuthApiKey(WEAVIATE_API_KEY)
            )
            self.log_success("Weaviate Connection", "Successfully connected to Weaviate")
            
            # Test KnowledgeBase collection
            kb_collection = client.collections.get("KnowledgeBase")
            total_count = kb_collection.aggregate.over_all(total_count=True).total_count
            self.log_success("KnowledgeBase Collection", f"Found {total_count} objects")
            
            if total_count == 0:
                self.log_issue("KnowledgeBase Collection", "Collection is empty - no training data available", "CRITICAL")
            
            # Test BM25 search
            results = kb_collection.query.bm25(
                query="create campaign",
                limit=3
            )
            
            if len(results.objects) == 0:
                self.log_issue("BM25 Search", "No results returned for 'create campaign' query", "CRITICAL")
            else:
                self.log_success("BM25 Search", f"Found {len(results.objects)} results for 'create campaign'")
                
                # Check result quality
                for i, obj in enumerate(results.objects):
                    title = obj.properties.get('title', 'No title')
                    category = obj.properties.get('category', 'No category')
                    content = obj.properties.get('content', '')
                    
                    if not title or title == 'No title':
                        self.log_issue("Result Quality", f"Result {i+1} has no title", "WARNING")
                    
                    if not content or len(content) < 50:
                        self.log_issue("Result Quality", f"Result {i+1} has insufficient content", "WARNING")
                    
                    if 'create' not in title.lower() and 'campaign' not in title.lower():
                        self.log_issue("Result Relevance", f"Result {i+1} may not be relevant to query", "WARNING")
            
            # Test BusinessData collection
            try:
                bd_collection = client.collections.get("BusinessData")
                bd_count = bd_collection.aggregate.over_all(total_count=True).total_count
                self.log_success("BusinessData Collection", f"Found {bd_count} objects")
            except Exception as e:
                self.log_issue("BusinessData Collection", f"Collection not accessible: {e}", "WARNING")
            
            client.close()
            return True
            
        except Exception as e:
            self.log_issue("Weaviate Connection", f"Failed to connect: {e}", "CRITICAL")
            return False
    
    def test_nextjs_api_endpoints(self):
        """Test 2: Next.js API Endpoints"""
        print("\n🔍 TEST 2: NEXT.JS API ENDPOINTS")
        print("=" * 60)
        
        # Test AI Agent health check
        try:
            response = requests.get(f"{NEXTJS_BASE_URL}/api/ai-agent", timeout=10)
            if response.status_code == 200:
                data = response.json()
                self.log_success("AI Agent Health Check", "API is responding")
                
                # Check RAG system status
                if data.get('ragSystem') == 'connected':
                    self.log_success("RAG System Status", "RAG system reports as connected")
                else:
                    self.log_issue("RAG System Status", f"RAG system status: {data.get('ragSystem')}", "WARNING")
                
                # Check collections
                collections = data.get('collections', {})
                total_objects = sum(collections.values())
                if total_objects == 0:
                    self.log_issue("Collections Status", "All collections show 0 objects", "CRITICAL")
                else:
                    self.log_success("Collections Status", f"Total objects across collections: {total_objects}")
                    
            else:
                self.log_issue("AI Agent Health Check", f"HTTP {response.status_code}: {response.text}", "CRITICAL")
                
        except requests.exceptions.RequestException as e:
            self.log_issue("AI Agent Health Check", f"Request failed: {e}", "CRITICAL")
        
        # Test AI Agent POST endpoint (without auth)
        try:
            response = requests.post(
                f"{NEXTJS_BASE_URL}/api/ai-agent",
                json={"query": "test query", "action": "chat"},
                timeout=10
            )
            
            if response.status_code == 401:
                self.log_success("AI Agent Authentication", "Correctly requires authentication")
            elif response.status_code == 200:
                self.log_issue("AI Agent Authentication", "No authentication required - security issue", "CRITICAL")
            else:
                self.log_issue("AI Agent POST", f"Unexpected status code: {response.status_code}", "WARNING")
                
        except requests.exceptions.RequestException as e:
            self.log_issue("AI Agent POST", f"Request failed: {e}", "WARNING")
    
    def test_training_data_quality(self):
        """Test 3: Training Data Quality"""
        print("\n🔍 TEST 3: TRAINING DATA QUALITY")
        print("=" * 60)
        
        try:
            # Load and analyze training data
            with open('training-data/vectorized-training-data.json', 'r') as f:
                data = json.load(f)
            
            self.log_success("Training Data Load", f"Loaded {len(data)} examples")
            
            # Check data structure
            required_fields = ['instruction', 'input', 'output']
            for i, item in enumerate(data[:10]):  # Check first 10 examples
                for field in required_fields:
                    if field not in item:
                        self.log_issue("Data Structure", f"Example {i+1} missing field: {field}", "ERROR")
                    elif not item[field] or len(str(item[field]).strip()) < 10:
                        self.log_issue("Data Quality", f"Example {i+1} has empty/short {field}", "WARNING")
            
            # Check for common issues
            for i, item in enumerate(data[:20]):  # Check first 20 examples
                output = item.get('output', '')
                
                # Check for placeholder text
                if 'TODO' in output or 'FIXME' in output or 'PLACEHOLDER' in output:
                    self.log_issue("Data Quality", f"Example {i+1} contains placeholder text", "WARNING")
                
                # Check for broken code blocks
                if '```' in output and output.count('```') % 2 != 0:
                    self.log_issue("Data Quality", f"Example {i+1} has unclosed code block", "WARNING")
                
                # Check for broken JSON
                if '```json' in output:
                    json_start = output.find('```json') + 7
                    json_end = output.find('```', json_start)
                    if json_end > json_start:
                        json_content = output[json_start:json_end].strip()
                        try:
                            json.loads(json_content)
                        except json.JSONDecodeError:
                            self.log_issue("Data Quality", f"Example {i+1} contains invalid JSON", "WARNING")
            
            # Check category distribution
            categories = {}
            for item in data:
                cat = item.get('category', 'unknown')
                categories[cat] = categories.get(cat, 0) + 1
            
            self.log_success("Category Distribution", f"Found {len(categories)} categories")
            for cat, count in categories.items():
                if count < 2:
                    self.log_issue("Category Distribution", f"Category '{cat}' has only {count} examples", "WARNING")
            
        except FileNotFoundError:
            self.log_issue("Training Data Load", "vectorized-training-data.json not found", "CRITICAL")
        except json.JSONDecodeError as e:
            self.log_issue("Training Data Load", f"Invalid JSON: {e}", "CRITICAL")
        except Exception as e:
            self.log_issue("Training Data Load", f"Unexpected error: {e}", "CRITICAL")
    
    def test_system_integration(self):
        """Test 4: System Integration"""
        print("\n🔍 TEST 4: SYSTEM INTEGRATION")
        print("=" * 60)
        
        # Test if all components work together
        try:
            # Test Weaviate connection
            client = weaviate.connect_to_weaviate_cloud(
                cluster_url=WEAVIATE_URL,
                auth_credentials=weaviate.auth.AuthApiKey(WEAVIATE_API_KEY)
            )
            
            # Test search
            kb_collection = client.collections.get("KnowledgeBase")
            results = kb_collection.query.bm25(query="test integration", limit=1)
            
            if len(results.objects) > 0:
                self.log_success("Integration Test", "Weaviate search working")
            else:
                self.log_issue("Integration Test", "Weaviate search returned no results", "WARNING")
            
            client.close()
            
            # Test Next.js API
            response = requests.get(f"{NEXTJS_BASE_URL}/api/ai-agent", timeout=5)
            if response.status_code == 200:
                self.log_success("Integration Test", "Next.js API responding")
            else:
                self.log_issue("Integration Test", f"Next.js API not responding: {response.status_code}", "CRITICAL")
                
        except Exception as e:
            self.log_issue("Integration Test", f"Integration failed: {e}", "CRITICAL")
    
    def test_error_handling(self):
        """Test 5: Error Handling"""
        print("\n🔍 TEST 5: ERROR HANDLING")
        print("=" * 60)
        
        # Test invalid Weaviate queries
        try:
            client = weaviate.connect_to_weaviate_cloud(
                cluster_url=WEAVIATE_URL,
                auth_credentials=weaviate.auth.AuthApiKey(WEAVIATE_API_KEY)
            )
            
            kb_collection = client.collections.get("KnowledgeBase")
            
            # Test empty query
            try:
                results = kb_collection.query.bm25(query="", limit=1)
                if len(results.objects) == 0:
                    self.log_success("Error Handling", "Empty query handled gracefully")
                else:
                    self.log_issue("Error Handling", "Empty query returned results", "WARNING")
            except Exception as e:
                self.log_issue("Error Handling", f"Empty query caused error: {e}", "WARNING")
            
            # Test very long query
            long_query = "test " * 1000
            try:
                results = kb_collection.query.bm25(query=long_query, limit=1)
                self.log_success("Error Handling", "Long query handled gracefully")
            except Exception as e:
                self.log_issue("Error Handling", f"Long query caused error: {e}", "WARNING")
            
            client.close()
            
        except Exception as e:
            self.log_issue("Error Handling", f"Error handling test failed: {e}", "WARNING")
    
    def test_performance(self):
        """Test 6: Performance"""
        print("\n🔍 TEST 6: PERFORMANCE")
        print("=" * 60)
        
        # Test Weaviate search performance
        try:
            client = weaviate.connect_to_weaviate_cloud(
                cluster_url=WEAVIATE_URL,
                auth_credentials=weaviate.auth.AuthApiKey(WEAVIATE_API_KEY)
            )
            
            kb_collection = client.collections.get("KnowledgeBase")
            
            # Test search speed
            start_time = time.time()
            results = kb_collection.query.bm25(query="create campaign", limit=5)
            search_time = time.time() - start_time
            
            if search_time < 2.0:
                self.log_success("Search Performance", f"Search completed in {search_time:.2f}s")
            else:
                self.log_issue("Search Performance", f"Search took {search_time:.2f}s - may be too slow", "WARNING")
            
            # Test multiple searches
            start_time = time.time()
            for i in range(5):
                kb_collection.query.bm25(query=f"test query {i}", limit=3)
            total_time = time.time() - start_time
            
            if total_time < 10.0:
                self.log_success("Multiple Search Performance", f"5 searches completed in {total_time:.2f}s")
            else:
                self.log_issue("Multiple Search Performance", f"5 searches took {total_time:.2f}s - may be too slow", "WARNING")
            
            client.close()
            
        except Exception as e:
            self.log_issue("Performance Test", f"Performance test failed: {e}", "WARNING")
    
    def generate_report(self):
        """Generate comprehensive test report"""
        print("\n📊 COMPREHENSIVE TEST REPORT")
        print("=" * 60)
        
        # Count issues by severity
        critical_issues = [i for i in self.issues if i['severity'] == 'CRITICAL']
        error_issues = [i for i in self.issues if i['severity'] == 'ERROR']
        warning_issues = [i for i in self.issues if i['severity'] == 'WARNING']
        
        print(f"Total Issues Found: {len(self.issues)}")
        print(f"  🔴 Critical: {len(critical_issues)}")
        print(f"  🟠 Errors: {len(error_issues)}")
        print(f"  🟡 Warnings: {len(warning_issues)}")
        
        if critical_issues:
            print(f"\n🔴 CRITICAL ISSUES (Must Fix):")
            for issue in critical_issues:
                print(f"  - {issue['test']}: {issue['issue']}")
        
        if error_issues:
            print(f"\n🟠 ERRORS (Should Fix):")
            for issue in error_issues:
                print(f"  - {issue['test']}: {issue['issue']}")
        
        if warning_issues:
            print(f"\n🟡 WARNINGS (Consider Fixing):")
            for issue in warning_issues:
                print(f"  - {issue['test']}: {issue['issue']}")
        
        # Overall assessment
        if len(critical_issues) == 0 and len(error_issues) == 0:
            print(f"\n🎉 SYSTEM STATUS: READY FOR PRODUCTION")
        elif len(critical_issues) == 0:
            print(f"\n⚠️  SYSTEM STATUS: MOSTLY READY (fix errors for best experience)")
        else:
            print(f"\n❌ SYSTEM STATUS: NOT READY (critical issues must be fixed)")
        
        return {
            "total_issues": len(self.issues),
            "critical_issues": len(critical_issues),
            "error_issues": len(error_issues),
            "warning_issues": len(warning_issues),
            "issues": self.issues
        }
    
    def run_all_tests(self):
        """Run all tests"""
        print("🚀 COMPREHENSIVE SYSTEM TESTING")
        print("=" * 60)
        print("Testing all components to find potential issues...")
        
        # Run all tests
        self.test_weaviate_connection()
        self.test_nextjs_api_endpoints()
        self.test_training_data_quality()
        self.test_system_integration()
        self.test_error_handling()
        self.test_performance()
        
        # Generate report
        return self.generate_report()

def main():
    """Main function"""
    tester = SystemTester()
    report = tester.run_all_tests()
    
    # Save report
    with open('comprehensive-test-report.json', 'w') as f:
        json.dump(report, f, indent=2)
    
    print(f"\n📄 Detailed report saved to: comprehensive-test-report.json")

if __name__ == "__main__":
    main()
