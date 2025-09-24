#!/usr/bin/env python3
"""
Intent Validation Test for RSVP AI Training Data
Tests if the training data properly conveys the intended AI capabilities and understanding
"""

import json
import os
from typing import Dict, List, Any
from datetime import datetime

class IntentValidator:
    def __init__(self):
        self.test_results = {}
        self.intent_checks = {
            'campaign_control': [],
            'email_management': [],
            'audience_handling': [],
            'analytics_understanding': [],
            'security_awareness': [],
            'api_integration': [],
            'error_handling': [],
            'user_interaction': []
        }
    
    def load_training_data(self) -> Dict[str, Any]:
        """Load all training data for analysis"""
        training_data = {}
        
        # Load SLM-friendly data
        slm_files = [f for f in os.listdir('.') if f.startswith(('26-', '27-', '28-', '29-', '30-', '31-', '32-', '33-')) and f.endswith('.jsonl')]
        
        for file_path in slm_files:
            with open(file_path, 'r', encoding='utf-8') as f:
                for line in f:
                    line = line.strip()
                    if line:
                        data = json.loads(line)
                        category = file_path.replace('-slm-friendly.jsonl', '').replace('.jsonl', '')
                        if category not in training_data:
                            training_data[category] = []
                        training_data[category].append(data)
        
        return training_data
    
    def test_campaign_control_intent(self, data: Dict[str, Any]) -> List[str]:
        """Test if training data conveys campaign control capabilities"""
        results = []
        output = data.get('output', '').lower()
        
        # Check for campaign creation understanding
        if 'create campaign' in output or 'createcampaign' in output:
            results.append("✅ Understands campaign creation")
        else:
            results.append("❌ Missing campaign creation understanding")
        
        # Check for campaign management
        if 'update campaign' in output or 'pause campaign' in output or 'resume campaign' in output:
            results.append("✅ Understands campaign management")
        else:
            results.append("❌ Missing campaign management understanding")
        
        # Check for scheduling understanding
        if 'schedule' in output and ('send' in output or 'time' in output):
            results.append("✅ Understands campaign scheduling")
        else:
            results.append("❌ Missing scheduling understanding")
        
        return results
    
    def test_email_management_intent(self, data: Dict[str, Any]) -> List[str]:
        """Test if training data conveys email management capabilities"""
        results = []
        output = data.get('output', '').lower()
        
        # Check for email sending understanding
        if 'send email' in output or 'sendcampaignemail' in output:
            results.append("✅ Understands email sending")
        else:
            results.append("❌ Missing email sending understanding")
        
        # Check for template understanding
        if 'template' in output and ('create' in output or 'render' in output):
            results.append("✅ Understands email templates")
        else:
            results.append("❌ Missing template understanding")
        
        # Check for email tracking
        if ('track' in output or 'analytics' in output) and 'email' in output:
            results.append("✅ Understands email tracking")
        else:
            results.append("❌ Missing email tracking understanding")
        
        return results
    
    def test_audience_handling_intent(self, data: Dict[str, Any]) -> List[str]:
        """Test if training data conveys audience handling capabilities"""
        results = []
        output = data.get('output', '').lower()
        
        # Check for audience group understanding
        if 'audience group' in output or 'audiencegroup' in output:
            results.append("✅ Understands audience groups")
        else:
            results.append("❌ Missing audience group understanding")
        
        # Check for member management
        if 'member' in output and ('add' in output or 'remove' in output or 'update' in output):
            results.append("✅ Understands member management")
        else:
            results.append("❌ Missing member management understanding")
        
        # Check for segmentation understanding
        if 'segment' in output or 'criteria' in output:
            results.append("✅ Understands audience segmentation")
        else:
            results.append("❌ Missing segmentation understanding")
        
        return results
    
    def test_analytics_understanding(self, data: Dict[str, Any]) -> List[str]:
        """Test if training data conveys analytics understanding"""
        results = []
        output = data.get('output', '').lower()
        
        # Check for analytics data understanding
        if 'analytics' in output and ('track' in output or 'metric' in output):
            results.append("✅ Understands analytics tracking")
        else:
            results.append("❌ Missing analytics tracking understanding")
        
        # Check for performance metrics
        if ('performance' in output or 'metric' in output) and ('campaign' in output or 'email' in output):
            results.append("✅ Understands performance metrics")
        else:
            results.append("❌ Missing performance metrics understanding")
        
        # Check for reporting capabilities
        if 'report' in output or 'dashboard' in output:
            results.append("✅ Understands reporting capabilities")
        else:
            results.append("❌ Missing reporting understanding")
        
        return results
    
    def test_security_awareness(self, data: Dict[str, Any]) -> List[str]:
        """Test if training data conveys security awareness"""
        results = []
        output = data.get('output', '').lower()
        
        # Check for authentication understanding
        if 'authentication' in output or 'login' in output or 'session' in output:
            results.append("✅ Understands authentication")
        else:
            results.append("❌ Missing authentication understanding")
        
        # Check for security features
        if 'security' in output and ('csrf' in output or 'rate limit' in output or 'validation' in output):
            results.append("✅ Understands security features")
        else:
            results.append("❌ Missing security features understanding")
        
        # Check for input validation
        if 'validation' in output and 'input' in output:
            results.append("✅ Understands input validation")
        else:
            results.append("❌ Missing input validation understanding")
        
        return results
    
    def test_api_integration(self, data: Dict[str, Any]) -> List[str]:
        """Test if training data conveys API integration understanding"""
        results = []
        output = data.get('output', '').lower()
        
        # Check for API endpoint understanding
        if '/api/' in output and ('get' in output or 'post' in output or 'put' in output):
            results.append("✅ Understands API endpoints")
        else:
            results.append("❌ Missing API endpoint understanding")
        
        # Check for external service integration
        if ('resend' in output or 'sendgrid' in output or 'leadmine' in output) and 'api' in output:
            results.append("✅ Understands external service integration")
        else:
            results.append("❌ Missing external service integration understanding")
        
        # Check for webhook understanding
        if 'webhook' in output and ('send' in output or 'receive' in output):
            results.append("✅ Understands webhooks")
        else:
            results.append("❌ Missing webhook understanding")
        
        return results
    
    def test_error_handling(self, data: Dict[str, Any]) -> List[str]:
        """Test if training data conveys error handling understanding"""
        results = []
        output = data.get('output', '').lower()
        
        # Check for error handling understanding
        if 'error' in output and ('handle' in output or 'catch' in output or 'try' in output):
            results.append("✅ Understands error handling")
        else:
            results.append("❌ Missing error handling understanding")
        
        # Check for validation error understanding
        if 'validation' in output and 'error' in output:
            results.append("✅ Understands validation errors")
        else:
            results.append("❌ Missing validation error understanding")
        
        # Check for user-friendly error messages
        if 'error message' in output or 'user-friendly' in output:
            results.append("✅ Understands user-friendly error handling")
        else:
            results.append("❌ Missing user-friendly error understanding")
        
        return results
    
    def test_user_interaction(self, data: Dict[str, Any]) -> List[str]:
        """Test if training data conveys user interaction understanding"""
        results = []
        output = data.get('output', '').lower()
        
        # Check for natural language understanding
        if 'user' in output and ('command' in output or 'request' in output or 'ask' in output):
            results.append("✅ Understands user interaction")
        else:
            results.append("❌ Missing user interaction understanding")
        
        # Check for conversational capabilities
        if 'conversation' in output or 'chat' in output or 'respond' in output:
            results.append("✅ Understands conversational interaction")
        else:
            results.append("❌ Missing conversational understanding")
        
        # Check for context awareness
        if 'context' in output and ('remember' in output or 'previous' in output):
            results.append("✅ Understands context awareness")
        else:
            results.append("❌ Missing context awareness understanding")
        
        return results
    
    def run_intent_validation(self) -> Dict[str, Any]:
        """Run comprehensive intent validation"""
        print("🧠 Starting Intent Validation Test...")
        print("=" * 60)
        
        training_data = self.load_training_data()
        
        # Test each category
        for category, examples in training_data.items():
            print(f"\n📋 Testing {category}...")
            
            for example in examples:
                # Run all intent tests
                self.intent_checks['campaign_control'].extend(self.test_campaign_control_intent(example))
                self.intent_checks['email_management'].extend(self.test_email_management_intent(example))
                self.intent_checks['audience_handling'].extend(self.test_audience_handling_intent(example))
                self.intent_checks['analytics_understanding'].extend(self.test_analytics_understanding(example))
                self.intent_checks['security_awareness'].extend(self.test_security_awareness(example))
                self.intent_checks['api_integration'].extend(self.test_api_integration(example))
                self.intent_checks['error_handling'].extend(self.test_error_handling(example))
                self.intent_checks['user_interaction'].extend(self.test_user_interaction(example))
        
        # Generate results summary
        results = self.generate_intent_report()
        
        return results
    
    def generate_intent_report(self) -> Dict[str, Any]:
        """Generate intent validation report"""
        
        # Count results for each category
        category_scores = {}
        for category, results in self.intent_checks.items():
            total_checks = len(results)
            passed_checks = len([r for r in results if r.startswith('✅')])
            failed_checks = len([r for r in results if r.startswith('❌')])
            
            category_scores[category] = {
                'total': total_checks,
                'passed': passed_checks,
                'failed': failed_checks,
                'success_rate': (passed_checks / total_checks * 100) if total_checks > 0 else 0,
                'results': results
            }
        
        # Overall score
        total_checks = sum(score['total'] for score in category_scores.values())
        total_passed = sum(score['passed'] for score in category_scores.values())
        overall_success_rate = (total_passed / total_checks * 100) if total_checks > 0 else 0
        
        report = {
            'intent_validation_summary': {
                'timestamp': datetime.now().isoformat(),
                'total_intent_checks': total_checks,
                'passed_checks': total_passed,
                'failed_checks': total_checks - total_passed,
                'overall_success_rate': overall_success_rate
            },
            'category_scores': category_scores,
            'recommendations': self.generate_intent_recommendations(category_scores)
        }
        
        return report
    
    def generate_intent_recommendations(self, category_scores: Dict[str, Any]) -> List[str]:
        """Generate recommendations based on intent validation results"""
        recommendations = []
        
        for category, score in category_scores.items():
            if score['success_rate'] < 70:
                recommendations.append(f"Improve {category} intent conveyance - only {score['success_rate']:.1f}% of checks passed")
        
        if not recommendations:
            recommendations.append("Intent conveyance is excellent - AI should understand all major capabilities")
        
        return recommendations

def main():
    """Main intent validation process"""
    validator = IntentValidator()
    
    # Run intent validation
    results = validator.run_intent_validation()
    
    # Save results
    with open('intent-validation-report.json', 'w', encoding='utf-8') as f:
        json.dump(results, f, indent=2, ensure_ascii=False)
    
    # Print summary
    print(f"\n🎯 Intent Validation Complete!")
    print("=" * 60)
    print(f"📊 Overall Results:")
    print(f"   Total intent checks: {results['intent_validation_summary']['total_intent_checks']}")
    print(f"   Passed checks: {results['intent_validation_summary']['passed_checks']}")
    print(f"   Success rate: {results['intent_validation_summary']['overall_success_rate']:.1f}%")
    
    print(f"\n📋 Category Breakdown:")
    for category, score in results['category_scores'].items():
        print(f"   {category}: {score['success_rate']:.1f}% ({score['passed']}/{score['total']})")
    
    print(f"\n💡 Recommendations:")
    for rec in results['recommendations']:
        print(f"   • {rec}")
    
    print(f"\n📋 Full report saved to: intent-validation-report.json")
    
    return results

if __name__ == "__main__":
    main()
