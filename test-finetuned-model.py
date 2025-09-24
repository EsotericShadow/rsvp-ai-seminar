#!/usr/bin/env python3
"""
Test the fine-tuned model with various RSVP system scenarios
"""

import subprocess
import json
import time

def test_model(prompt, max_tokens=300, temp=0.7):
    """Test the model with a given prompt"""
    cmd = [
        "python3", "-m", "mlx_lm", "generate",
        "--model", "Qwen/Qwen2.5-3B-Instruct",
        "--adapter-path", "./rsvp-qwen-lora-m4pro",
        "--prompt", prompt,
        "--max-tokens", str(max_tokens),
        "--temp", str(temp)
    ]
    
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=60)
        if result.returncode == 0:
            # Extract the generated text from the output
            output = result.stdout
            if "==========" in output:
                parts = output.split("==========")
                if len(parts) >= 3:
                    generated_text = parts[2].strip()
                    return generated_text
            return output.strip()
        else:
            return f"Error: {result.stderr}"
    except subprocess.TimeoutExpired:
        return "Timeout - model took too long to respond"
    except Exception as e:
        return f"Error: {str(e)}"

def run_comprehensive_tests():
    """Run comprehensive tests on the fine-tuned model"""
    print("🧪 Testing Fine-tuned RSVP Model")
    print("=" * 50)
    
    test_cases = [
        {
            "name": "Campaign Creation",
            "prompt": "### Instruction:\nCreate a new email campaign\n\n### Input:\nI want to create a campaign for our tech conference\n\n### Response:",
            "expected_elements": ["API endpoint", "request body", "campaign name", "template", "audience"]
        },
        {
            "name": "Template Management",
            "prompt": "### Instruction:\nCreate an email template\n\n### Input:\nI need a welcome email template for new users\n\n### Response:",
            "expected_elements": ["template structure", "HTML body", "text body", "variables", "API endpoint"]
        },
        {
            "name": "Audience Segmentation",
            "prompt": "### Instruction:\nCreate an audience group\n\n### Input:\nI need a group for tech professionals in Vancouver\n\n### Response:",
            "expected_elements": ["audience criteria", "group structure", "API endpoint", "segmentation rules"]
        },
        {
            "name": "RSVP Data Query",
            "prompt": "### Instruction:\nShow me RSVP data\n\n### Input:\nWhat RSVPs do I have for the conference?\n\n### Response:",
            "expected_elements": ["RSVP structure", "data fields", "attendance status", "dietary preferences"]
        },
        {
            "name": "Campaign Analytics",
            "prompt": "### Instruction:\nGenerate analytics report\n\n### Input:\nShow me the performance of my latest campaign\n\n### Response:",
            "expected_elements": ["metrics", "open rates", "click rates", "performance data"]
        },
        {
            "name": "System Architecture",
            "prompt": "### Instruction:\nExplain system architecture\n\n### Input:\nHow does the RSVP system work?\n\n### Response:",
            "expected_elements": ["database models", "API endpoints", "components", "workflow"]
        },
        {
            "name": "Error Handling",
            "prompt": "### Instruction:\nTroubleshoot system issues\n\n### Input:\nMy campaign isn't sending emails\n\n### Response:",
            "expected_elements": ["diagnostic steps", "common issues", "solutions", "troubleshooting"]
        },
        {
            "name": "Integration Help",
            "prompt": "### Instruction:\nIntegrate with external services\n\n### Input:\nHow do I integrate with SendGrid for email delivery?\n\n### Response:",
            "expected_elements": ["integration steps", "API configuration", "authentication", "setup process"]
        }
    ]
    
    results = []
    
    for i, test_case in enumerate(test_cases, 1):
        print(f"\n🔍 Test {i}/8: {test_case['name']}")
        print(f"📝 Prompt: {test_case['prompt'][:100]}...")
        
        start_time = time.time()
        response = test_model(test_case['prompt'], max_tokens=400, temp=0.7)
        end_time = time.time()
        
        response_time = end_time - start_time
        
        # Analyze response quality
        quality_score = analyze_response_quality(response, test_case['expected_elements'])
        
        result = {
            "test_name": test_case['name'],
            "response": response,
            "response_time": response_time,
            "quality_score": quality_score,
            "expected_elements": test_case['expected_elements']
        }
        results.append(result)
        
        print(f"⏱️  Response time: {response_time:.2f}s")
        print(f"📊 Quality score: {quality_score}/10")
        print(f"📄 Response preview: {response[:200]}...")
        
        # Wait a bit between tests
        time.sleep(2)
    
    # Generate summary report
    print("\n" + "=" * 50)
    print("📊 TEST SUMMARY REPORT")
    print("=" * 50)
    
    avg_quality = sum(r['quality_score'] for r in results) / len(results)
    avg_response_time = sum(r['response_time'] for r in results) / len(results)
    
    print(f"📈 Average Quality Score: {avg_quality:.1f}/10")
    print(f"⏱️  Average Response Time: {avg_response_time:.2f}s")
    
    print(f"\n🏆 Best Performing Tests:")
    best_tests = sorted(results, key=lambda x: x['quality_score'], reverse=True)[:3]
    for test in best_tests:
        print(f"   • {test['test_name']}: {test['quality_score']}/10")
    
    print(f"\n⚠️  Tests Needing Improvement:")
    worst_tests = sorted(results, key=lambda x: x['quality_score'])[:3]
    for test in worst_tests:
        print(f"   • {test['test_name']}: {test['quality_score']}/10")
    
    # Save detailed results
    with open('test-results.json', 'w') as f:
        json.dump(results, f, indent=2)
    
    print(f"\n💾 Detailed results saved to: test-results.json")
    
    return results

def analyze_response_quality(response, expected_elements):
    """Analyze the quality of a response based on expected elements"""
    if not response or "Error:" in response or "Timeout" in response:
        return 0
    
    score = 0
    max_score = 10
    
    # Check for expected elements
    elements_found = 0
    for element in expected_elements:
        if element.lower() in response.lower():
            elements_found += 1
    
    # Base score from elements found
    score += (elements_found / len(expected_elements)) * 5
    
    # Check for technical accuracy
    technical_indicators = [
        "api", "endpoint", "json", "database", "schema", 
        "request", "response", "status", "error", "validation"
    ]
    
    technical_found = sum(1 for indicator in technical_indicators if indicator in response.lower())
    score += min(technical_found / 5, 2)  # Up to 2 points for technical accuracy
    
    # Check for helpfulness (length and structure)
    if len(response) > 100:
        score += 1
    if "```" in response:  # Code blocks
        score += 1
    if any(word in response.lower() for word in ["step", "first", "next", "then"]):
        score += 1  # Structured response
    
    return min(score, max_score)

if __name__ == "__main__":
    run_comprehensive_tests()


