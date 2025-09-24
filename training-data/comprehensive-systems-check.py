#!/usr/bin/env python3
"""
Comprehensive Systems Check for RSVP AI Training Data
Validates training data quality, AI command functions, and system integration
"""

import json
import os
import re
from typing import Dict, List, Any, Tuple
from datetime import datetime

class TrainingDataValidator:
    def __init__(self):
        self.errors = []
        self.warnings = []
        self.stats = {
            'total_files': 0,
            'total_examples': 0,
            'valid_examples': 0,
            'invalid_examples': 0,
            'categories_covered': set(),
            'api_endpoints_found': set(),
            'functions_found': set(),
            'code_blocks_found': 0,
            'business_concepts_found': set()
        }
    
    def validate_jsonl_file(self, file_path: str) -> Tuple[int, int]:
        """Validate a single JSONL file"""
        valid_count = 0
        invalid_count = 0
        
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                for line_num, line in enumerate(f, 1):
                    line = line.strip()
                    if not line:
                        continue
                    
                    try:
                        data = json.loads(line)
                        if self.validate_training_example(data, file_path, line_num):
                            valid_count += 1
                        else:
                            invalid_count += 1
                    except json.JSONDecodeError as e:
                        self.errors.append(f"{file_path}:{line_num} - JSON parse error: {e}")
                        invalid_count += 1
                        
        except FileNotFoundError:
            self.errors.append(f"File not found: {file_path}")
            
        return valid_count, invalid_count
    
    def validate_training_example(self, data: Dict[str, Any], file_path: str, line_num: int) -> bool:
        """Validate a single training example"""
        is_valid = True
        
        # Check required fields
        required_fields = ['instruction', 'input', 'output']
        for field in required_fields:
            if field not in data:
                self.errors.append(f"{file_path}:{line_num} - Missing required field: {field}")
                is_valid = False
        
        if not is_valid:
            return False
        
        # Validate field content
        if not data.get('instruction') or len(data['instruction']) < 10:
            self.warnings.append(f"{file_path}:{line_num} - Instruction too short or empty")
        
        if not data.get('output') or len(data['output']) < 50:
            self.warnings.append(f"{file_path}:{line_num} - Output too short or empty")
        
        # Extract and count components
        self.extract_components(data, file_path)
        
        return True
    
    def extract_components(self, data: Dict[str, Any], file_path: str):
        """Extract and count components from training data"""
        output = data.get('output', '')
        
        # Count code blocks
        code_blocks = re.findall(r'```(\w+)\n(.*?)\n```', output, re.DOTALL)
        self.stats['code_blocks_found'] += len(code_blocks)
        
        # Find API endpoints
        api_patterns = [
            r'(GET|POST|PUT|DELETE|PATCH)\s+(/api/[^\s]+)',
            r'`(GET|POST|PUT|DELETE|PATCH)\s+(/api/[^`]+)`'
        ]
        for pattern in api_patterns:
            matches = re.findall(pattern, output, re.IGNORECASE)
            for match in matches:
                if len(match) == 2:
                    self.stats['api_endpoints_found'].add(f"{match[0]} {match[1]}")
        
        # Find function calls
        function_patterns = [
            r'(\w+)\s*\([^)]*\)',  # function calls
            r'`(\w+)\s*\([^)]*\)`'  # function calls in backticks
        ]
        for pattern in function_patterns:
            matches = re.findall(pattern, output)
            for match in matches:
                if len(match) > 2 and match[0].isupper():  # Likely function names
                    self.stats['functions_found'].add(match)
        
        # Find business concepts
        business_terms = [
            'campaign', 'audience', 'email', 'template', 'schedule', 'rsvp',
            'analytics', 'tracking', 'visitor', 'member', 'group', 'send',
            'delivery', 'bounce', 'open', 'click', 'unsubscribe'
        ]
        for term in business_terms:
            if term in output.lower():
                self.stats['business_concepts_found'].add(term)
        
        # Track categories
        filename = os.path.basename(file_path)
        category = filename.replace('.jsonl', '').replace('-slm-friendly', '').replace('-accurate', '').replace('-comprehensive', '')
        self.stats['categories_covered'].add(category)
    
    def validate_ai_command_functions(self, file_path: str) -> Dict[str, Any]:
        """Validate AI command functions mapping"""
        results = {
            'valid_functions': [],
            'invalid_functions': [],
            'missing_mappings': [],
            'api_endpoints_mapped': 0,
            'functions_mapped': 0
        }
        
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
                
                # Check for function definitions
                function_pattern = r'(\w+)\s*\([^)]*\)\s*:'
                functions = re.findall(function_pattern, content)
                
                for func in functions:
                    if len(func) > 3:  # Likely function names
                        results['valid_functions'].append(func)
                        results['functions_mapped'] += 1
                
                # Check for API endpoint mappings
                api_pattern = r'(GET|POST|PUT|DELETE|PATCH)\s+(/api/[^\s]+)'
                apis = re.findall(api_pattern, content)
                results['api_endpoints_mapped'] = len(apis)
                
                # Validate specific command functions
                required_commands = [
                    'createCampaign', 'updateCampaign', 'listCampaigns', 'getCampaign',
                    'sendCampaignEmail', 'runSchedule', 'createAudienceGroup',
                    'createTemplate', 'renderTemplate', 'getCampaignDashboard'
                ]
                
                for cmd in required_commands:
                    if cmd in content:
                        results['valid_functions'].append(cmd)
                    else:
                        results['missing_mappings'].append(cmd)
                        
        except FileNotFoundError:
            results['invalid_functions'].append(f"File not found: {file_path}")
        
        return results
    
    def validate_rag_system(self, vectorized_file: str) -> Dict[str, Any]:
        """Validate RAG system configuration"""
        results = {
            'total_examples': 0,
            'valid_examples': 0,
            'extracted_components': {},
            'search_configurations': {},
            'integration_ready': False
        }
        
        try:
            with open(vectorized_file, 'r', encoding='utf-8') as f:
                data = json.load(f)
                
                results['total_examples'] = data.get('metadata', {}).get('total_examples', 0)
                
                training_data = data.get('training_data', [])
                results['valid_examples'] = len(training_data)
                
                # Check extracted components
                for example in training_data:
                    components = example.get('extracted_components', {})
                    for comp_type, comp_list in components.items():
                        if comp_type not in results['extracted_components']:
                            results['extracted_components'][comp_type] = 0
                        results['extracted_components'][comp_type] += len(comp_list)
                
                # Check if integration ready
                required_fields = ['instruction', 'input', 'output', 'metadata', 'extracted_components']
                if all(field in example for example in training_data for field in required_fields):
                    results['integration_ready'] = True
                    
        except FileNotFoundError:
            results['invalid_examples'] = 1
        
        return results
    
    def run_comprehensive_check(self) -> Dict[str, Any]:
        """Run comprehensive systems check"""
        print("🔍 Starting Comprehensive Systems Check...")
        print("=" * 60)
        
        # Get all training files
        training_files = [f for f in os.listdir('.') if f.endswith('.jsonl')]
        self.stats['total_files'] = len(training_files)
        
        print(f"📁 Found {len(training_files)} training files")
        
        # Validate each file
        for file_path in training_files:
            print(f"\n📋 Validating {file_path}...")
            valid, invalid = self.validate_jsonl_file(file_path)
            self.stats['valid_examples'] += valid
            self.stats['invalid_examples'] += invalid
            self.stats['total_examples'] += valid + invalid
            
            if valid > 0:
                print(f"   ✅ {valid} valid examples")
            if invalid > 0:
                print(f"   ❌ {invalid} invalid examples")
        
        # Validate AI command functions
        print(f"\n🤖 Validating AI Command Functions...")
        ai_commands_file = '33-ai-command-functions-slm-friendly.jsonl'
        if os.path.exists(ai_commands_file):
            ai_results = self.validate_ai_command_functions(ai_commands_file)
            print(f"   ✅ {ai_results['functions_mapped']} functions mapped")
            print(f"   ✅ {ai_results['api_endpoints_mapped']} API endpoints mapped")
            if ai_results['missing_mappings']:
                print(f"   ⚠️  Missing mappings: {len(ai_results['missing_mappings'])}")
        else:
            print("   ❌ AI command functions file not found")
        
        # Validate RAG system
        print(f"\n🧠 Validating RAG System...")
        rag_file = 'slm-friendly-vectorized-data.json'
        if os.path.exists(rag_file):
            rag_results = self.validate_rag_system(rag_file)
            print(f"   ✅ {rag_results['total_examples']} examples vectorized")
            print(f"   ✅ {rag_results['valid_examples']} valid vectorized examples")
            print(f"   ✅ Integration ready: {rag_results['integration_ready']}")
        else:
            print("   ❌ RAG vectorized data file not found")
        
        # Generate comprehensive report
        report = self.generate_comprehensive_report(ai_results if 'ai_results' in locals() else {}, 
                                                  rag_results if 'rag_results' in locals() else {})
        
        return report
    
    def generate_comprehensive_report(self, ai_results: Dict, rag_results: Dict) -> Dict[str, Any]:
        """Generate comprehensive validation report"""
        
        report = {
            'validation_summary': {
                'timestamp': datetime.now().isoformat(),
                'total_files_checked': self.stats['total_files'],
                'total_examples': self.stats['total_examples'],
                'valid_examples': self.stats['valid_examples'],
                'invalid_examples': self.stats['invalid_examples'],
                'validation_success_rate': (self.stats['valid_examples'] / self.stats['total_examples'] * 100) if self.stats['total_examples'] > 0 else 0
            },
            'training_data_quality': {
                'categories_covered': len(self.stats['categories_covered']),
                'api_endpoints_found': len(self.stats['api_endpoints_found']),
                'functions_found': len(self.stats['functions_found']),
                'code_blocks_found': self.stats['code_blocks_found'],
                'business_concepts_found': len(self.stats['business_concepts_found'])
            },
            'ai_command_validation': ai_results,
            'rag_system_validation': rag_results,
            'errors': self.errors,
            'warnings': self.warnings,
            'recommendations': self.generate_recommendations()
        }
        
        return report
    
    def generate_recommendations(self) -> List[str]:
        """Generate recommendations based on validation results"""
        recommendations = []
        
        if self.stats['invalid_examples'] > 0:
            recommendations.append("Fix invalid training examples to improve data quality")
        
        if len(self.stats['api_endpoints_found']) < 10:
            recommendations.append("Add more API endpoint examples for comprehensive coverage")
        
        if self.stats['code_blocks_found'] < 50:
            recommendations.append("Include more code examples for better technical understanding")
        
        if len(self.stats['business_concepts_found']) < 15:
            recommendations.append("Add more business concept explanations")
        
        if len(self.errors) > 0:
            recommendations.append("Address validation errors before proceeding")
        
        if len(self.warnings) > 0:
            recommendations.append("Review warnings for potential improvements")
        
        if not recommendations:
            recommendations.append("Training data quality is excellent - ready for SLM fine-tuning")
        
        return recommendations

def main():
    """Main validation process"""
    validator = TrainingDataValidator()
    
    # Run comprehensive check
    report = validator.run_comprehensive_check()
    
    # Save report
    with open('comprehensive-systems-check-report.json', 'w', encoding='utf-8') as f:
        json.dump(report, f, indent=2, ensure_ascii=False)
    
    # Print summary
    print(f"\n🎉 Comprehensive Systems Check Complete!")
    print("=" * 60)
    print(f"📊 Summary:")
    print(f"   Files checked: {report['validation_summary']['total_files_checked']}")
    print(f"   Total examples: {report['validation_summary']['total_examples']}")
    print(f"   Valid examples: {report['validation_summary']['valid_examples']}")
    print(f"   Success rate: {report['validation_summary']['validation_success_rate']:.1f}%")
    print(f"   Categories: {report['training_data_quality']['categories_covered']}")
    print(f"   API endpoints: {report['training_data_quality']['api_endpoints_found']}")
    print(f"   Functions: {report['training_data_quality']['functions_found']}")
    print(f"   Code blocks: {report['training_data_quality']['code_blocks_found']}")
    
    if report['errors']:
        print(f"\n❌ Errors found: {len(report['errors'])}")
        for error in report['errors'][:5]:  # Show first 5 errors
            print(f"   {error}")
    
    if report['warnings']:
        print(f"\n⚠️  Warnings: {len(report['warnings'])}")
        for warning in report['warnings'][:5]:  # Show first 5 warnings
            print(f"   {warning}")
    
    print(f"\n💡 Recommendations:")
    for rec in report['recommendations']:
        print(f"   • {rec}")
    
    print(f"\n📋 Full report saved to: comprehensive-systems-check-report.json")
    
    return report

if __name__ == "__main__":
    main()
