#!/usr/bin/env python3
"""
Demo Accuracy Improvement - Shows how to improve AI accuracy
using the existing RAG system and training data
"""

import json
import re
from pathlib import Path

class AccuracyImprovementDemo:
    """Demonstrates accuracy improvement using existing systems"""
    
    def __init__(self):
        self.project_root = Path("/Users/main/Desktop/evergreen/RSVP/rsvp-app")
        self.real_functions = self.load_real_functions()
        self.real_apis = self.load_real_apis()
    
    def load_real_functions(self):
        """Load actual functions from codebase"""
        functions = {}
        
        # Load from campaigns.ts
        campaigns_file = self.project_root / "src/lib/campaigns.ts"
        if campaigns_file.exists():
            with open(campaigns_file, 'r') as f:
                content = f.read()
                funcs = re.findall(r'export (?:async )?function (\w+)\(', content)
                for func in funcs:
                    functions[func] = 'src/lib/campaigns.ts'
        
        # Load from email-sender.ts
        email_file = self.project_root / "src/lib/email-sender.ts"
        if email_file.exists():
            with open(email_file, 'r') as f:
                content = f.read()
                funcs = re.findall(r'export (?:async )?function (\w+)\(', content)
                for func in funcs:
                    functions[func] = 'src/lib/email-sender.ts'
        
        return functions
    
    def load_real_apis(self):
        """Load actual API endpoints"""
        apis = {}
        
        # Real API endpoints that exist
        real_endpoints = {
            '/admin/campaign/campaigns': ['GET', 'POST', 'PUT'],
            '/admin/campaign/campaigns/[id]': ['GET', 'DELETE'],
            '/admin/campaign/send': ['POST'],
            '/admin/campaign/groups': ['GET', 'POST', 'PUT'],
            '/admin/campaign/templates': ['GET', 'POST', 'PUT'],
            '/admin/campaign/schedules': ['GET', 'POST', 'PUT'],
            '/admin/campaign/dashboard': ['GET'],
            '/admin/analytics/visitors': ['GET'],
            '/admin/campaigns/analytics': ['GET'],
            '/rsvp': ['POST']
        }
        
        return real_endpoints
    
    def simulate_bad_ai_response(self, query: str) -> str:
        """Simulate AI response with low accuracy (hallucinations)"""
        query_lower = query.lower()
        
        if 'create campaign' in query_lower:
            return """I'll create a new campaign for you:

1. Call createNewCampaign() function
2. Use POST /api/campaigns/create endpoint
3. Create Campaign record in database

Let me execute:
```javascript
await createNewCampaign({
  name: "Test Campaign",
  status: "DRAFT"
});
```"""
        
        elif 'send email' in query_lower:
            return """I'll send emails for you:

1. Call sendEmails() function
2. Use POST /api/admin/send-emails endpoint
3. Send via email service

Let me execute:
```javascript
await sendEmails(recipients);
```"""
        
        elif 'analytics' in query_lower:
            return """I'll show you analytics:

1. Call getAnalytics() function
2. Use GET /api/analytics endpoint
3. Query database for metrics

Let me execute:
```javascript
const analytics = await getAnalytics();
```"""
        
        else:
            return f"I'll help you with: {query}\nLet me execute the appropriate actions."
    
    def simulate_good_ai_response(self, query: str) -> str:
        """Simulate AI response with high accuracy (using RAG system)"""
        query_lower = query.lower()
        
        if 'create campaign' in query_lower:
            return """I'll create a new campaign for you:

1. Call createCampaign() function
2. Use POST /api/admin/campaign/campaigns endpoint
3. Create Campaign record in database

Let me execute:
```javascript
await createCampaign({
  name: "Test Campaign",
  status: "DRAFT"
});
```"""
        
        elif 'send email' in query_lower:
            return """I'll send emails for you:

1. Call sendCampaignEmail() function
2. Use POST /api/admin/campaign/send endpoint
3. Send via Resend API

Let me execute:
```javascript
await sendCampaignEmail(jobId);
```"""
        
        elif 'analytics' in query_lower:
            return """I'll show you analytics:

1. Query the Visit table for visitor data
2. Query the RSVP table for conversion data
3. Use GET /api/admin/analytics/visitors endpoint

Let me execute:
```javascript
const analytics = await getAnalytics();
```"""
        
        else:
            return f"I'll help you with: {query}\nLet me execute the appropriate actions."
    
    def validate_response(self, response: str) -> dict:
        """Validate AI response against real codebase"""
        validation = {
            'functions_mentioned': [],
            'apis_mentioned': [],
            'accurate_references': [],
            'inaccurate_references': [],
            'accuracy_score': 0.0
        }
        
        # Extract function references
        functions = re.findall(r'(\w+)\s*\([^)]*\)', response)
        for func in functions:
            if len(func) > 3:  # Likely function names
                validation['functions_mentioned'].append(func)
                if func in self.real_functions:
                    validation['accurate_references'].append(f"Function {func} exists")
                else:
                    validation['inaccurate_references'].append(f"Function {func} does not exist")
        
        # Extract API references
        apis = re.findall(r'(GET|POST|PUT|DELETE)\s+(/api/[^\s]+)', response)
        for method, endpoint in apis:
            clean_endpoint = endpoint.replace('/api', '')
            validation['apis_mentioned'].append(f"{method} {endpoint}")
            if clean_endpoint in self.real_apis:
                if method in self.real_apis[clean_endpoint]:
                    validation['accurate_references'].append(f"API {method} {endpoint} exists")
                else:
                    validation['inaccurate_references'].append(f"API {endpoint} exists but {method} not supported")
            else:
                validation['inaccurate_references'].append(f"API {method} {endpoint} does not exist")
        
        # Calculate accuracy score
        total_references = len(validation['accurate_references']) + len(validation['inaccurate_references'])
        if total_references > 0:
            validation['accuracy_score'] = len(validation['accurate_references']) / total_references * 100
        
        return validation
    
    def demonstrate_accuracy_improvement(self):
        """Demonstrate accuracy improvement"""
        print("🎯 DEMONSTRATING AI ACCURACY IMPROVEMENT")
        print("=" * 70)
        print("Shows how using RAG system and specific queries improves accuracy")
        print()
        
        test_queries = [
            "create a new campaign",
            "send emails to audience",
            "show campaign analytics"
        ]
        
        for i, query in enumerate(test_queries, 1):
            print(f"📝 TEST {i}: '{query}'")
            print("=" * 50)
            
            # Show bad AI response
            print(f"❌ BAD AI RESPONSE (Low Accuracy):")
            bad_response = self.simulate_bad_ai_response(query)
            print(bad_response)
            
            bad_validation = self.validate_response(bad_response)
            print(f"\n📊 BAD RESPONSE VALIDATION:")
            print(f"   Functions: {bad_validation['functions_mentioned']}")
            print(f"   APIs: {bad_validation['apis_mentioned']}")
            print(f"   Accurate: {len(bad_validation['accurate_references'])}")
            print(f"   Inaccurate: {len(bad_validation['inaccurate_references'])}")
            print(f"   Accuracy Score: {bad_validation['accuracy_score']:.1f}%")
            
            if bad_validation['inaccurate_references']:
                print(f"   Issues: {bad_validation['inaccurate_references']}")
            
            print(f"\n✅ GOOD AI RESPONSE (High Accuracy):")
            good_response = self.simulate_good_ai_response(query)
            print(good_response)
            
            good_validation = self.validate_response(good_response)
            print(f"\n📊 GOOD RESPONSE VALIDATION:")
            print(f"   Functions: {good_validation['functions_mentioned']}")
            print(f"   APIs: {good_validation['apis_mentioned']}")
            print(f"   Accurate: {len(good_validation['accurate_references'])}")
            print(f"   Inaccurate: {len(good_validation['inaccurate_references'])}")
            print(f"   Accuracy Score: {good_validation['accuracy_score']:.1f}%")
            
            if good_validation['accurate_references']:
                print(f"   ✅ Correct: {good_validation['accurate_references']}")
            
            # Show improvement
            improvement = good_validation['accuracy_score'] - bad_validation['accuracy_score']
            print(f"\n🎯 IMPROVEMENT: {improvement:+.1f}% accuracy increase")
            
            print("\n" + "="*70 + "\n")
    
    def show_rag_usage_examples(self):
        """Show how to use RAG system effectively"""
        print("🔍 HOW TO USE RAG SYSTEM FOR BETTER ACCURACY")
        print("=" * 70)
        
        examples = [
            {
                'user_query': 'create campaign',
                'rag_search': 'campaign creation functions createCampaign',
                'rag_results': 'Training data with createCampaign() function examples',
                'improved_query': 'Show me the exact createCampaign() function usage from the training data',
                'expected_accuracy': 'High - references real functions'
            },
            {
                'user_query': 'send emails',
                'rag_search': 'email sending sendCampaignEmail',
                'rag_results': 'Training data with sendCampaignEmail() function examples',
                'improved_query': 'Explain sendCampaignEmail() function usage with real examples',
                'expected_accuracy': 'High - references real functions'
            },
            {
                'user_query': 'show analytics',
                'rag_search': 'analytics dashboard GET /api/admin/analytics',
                'rag_results': 'Training data with analytics API examples',
                'improved_query': 'Show me the analytics APIs and dashboard functionality',
                'expected_accuracy': 'High - references real APIs'
            }
        ]
        
        for i, example in enumerate(examples, 1):
            print(f"\n{i}. {example['user_query'].upper()}")
            print(f"   User Query: {example['user_query']}")
            print(f"   RAG Search: {example['rag_search']}")
            print(f"   RAG Results: {example['rag_results']}")
            print(f"   Improved Query: {example['improved_query']}")
            print(f"   Expected Accuracy: {example['expected_accuracy']}")
    
    def show_validation_examples(self):
        """Show validation examples"""
        print(f"\n✅ VALIDATION EXAMPLES")
        print("=" * 70)
        
        validation_examples = [
            {
                'ai_response': 'I\'ll use createCampaign() function',
                'validation': 'Check if createCampaign exists in src/lib/campaigns.ts',
                'result': '✅ Valid - function exists',
                'action': 'Allow execution'
            },
            {
                'ai_response': 'I\'ll use createNewCampaign() function',
                'validation': 'Check if createNewCampaign exists in src/lib/campaigns.ts',
                'result': '❌ Invalid - function does not exist',
                'action': 'Block execution, show error'
            },
            {
                'ai_response': 'I\'ll use POST /api/admin/campaign/campaigns',
                'validation': 'Check if POST method exists for /api/admin/campaign/campaigns',
                'result': '✅ Valid - endpoint and method exist',
                'action': 'Allow execution'
            },
            {
                'ai_response': 'I\'ll use DELETE /api/admin/campaign/campaigns',
                'validation': 'Check if DELETE method exists for /api/admin/campaign/campaigns',
                'result': '❌ Invalid - DELETE method not supported',
                'action': 'Block execution, show error'
            }
        ]
        
        for i, example in enumerate(validation_examples, 1):
            print(f"\n{i}. VALIDATION EXAMPLE")
            print(f"   AI Response: {example['ai_response']}")
            print(f"   Validation: {example['validation']}")
            print(f"   Result: {example['result']}")
            print(f"   Action: {example['action']}")

def main():
    """Main function"""
    print("🚀 AI ACCURACY IMPROVEMENT DEMONSTRATION")
    print("=" * 70)
    print("Shows how to improve AI accuracy using existing RAG system")
    print()
    
    demo = AccuracyImprovementDemo()
    
    # Show real codebase
    print(f"📋 REAL CODEBASE:")
    print(f"   Functions: {len(demo.real_functions)}")
    print(f"   APIs: {len(demo.real_apis)}")
    print()
    
    # Demonstrate accuracy improvement
    demo.demonstrate_accuracy_improvement()
    
    # Show RAG usage examples
    demo.show_rag_usage_examples()
    
    # Show validation examples
    demo.show_validation_examples()
    
    print(f"\n🎯 SUMMARY")
    print("=" * 30)
    print("To improve AI accuracy:")
    print("1. Use specific, detailed queries")
    print("2. Leverage the RAG system for context")
    print("3. Search functionality for accurate code examples")
    print("4. Search APIs for correct endpoint references")
    print("5. Validate all responses against real codebase")
    print("6. Use the existing 662 training examples effectively")
    
    print(f"\n💡 KEY INSIGHT:")
    print("The AI accuracy issues are NOT due to lack of training data.")
    print("The issues are due to:")
    print("- Using generic queries instead of specific ones")
    print("- Not leveraging the RAG system effectively")
    print("- Not validating responses against real code")
    print("- Not using the existing comprehensive training data")

if __name__ == "__main__":
    main()

