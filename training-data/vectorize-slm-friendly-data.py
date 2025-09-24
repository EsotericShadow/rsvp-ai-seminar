#!/usr/bin/env python3
"""
Comprehensive SLM-Friendly Training Data Vectorization
Creates properly labeled and explained training data for Small Language Models
"""

import json
import os
import re
from typing import Dict, List, Any
from datetime import datetime

def extract_code_blocks(text: str) -> List[Dict[str, str]]:
    """Extract and label code blocks from text"""
    code_blocks = []
    
    # Find code blocks with language specification
    pattern = r'```(\w+)\n(.*?)\n```'
    matches = re.findall(pattern, text, re.DOTALL)
    
    for lang, code in matches:
        code_blocks.append({
            'language': lang,
            'code': code.strip(),
            'type': 'code_block'
        })
    
    # Find inline code
    inline_pattern = r'`([^`]+)`'
    inline_matches = re.findall(inline_pattern, text)
    
    for code in inline_matches:
        if len(code) > 10:  # Only capture substantial inline code
            code_blocks.append({
                'language': 'inline',
                'code': code,
                'type': 'inline_code'
            })
    
    return code_blocks

def extract_api_endpoints(text: str) -> List[Dict[str, str]]:
    """Extract API endpoints and their methods"""
    endpoints = []
    
    # Find API endpoint patterns
    patterns = [
        r'(GET|POST|PUT|DELETE|PATCH)\s+(/api/[^\s]+)',
        r'`(GET|POST|PUT|DELETE|PATCH)\s+(/api/[^`]+)`',
        r'(\w+)\s+to\s+(/api/[^\s]+)',
    ]
    
    for pattern in patterns:
        matches = re.findall(pattern, text, re.IGNORECASE)
        for match in matches:
            if len(match) == 2:
                method, endpoint = match
                endpoints.append({
                    'method': method.upper(),
                    'endpoint': endpoint,
                    'type': 'api_endpoint'
                })
    
    return endpoints

def extract_database_operations(text: str) -> List[Dict[str, str]]:
    """Extract database operations and entities"""
    operations = []
    
    # Find database operations
    patterns = [
        r'(CREATE|READ|UPDATE|DELETE|INSERT|SELECT|UPDATE|DELETE)\s+(\w+)',
        r'(\w+)\s+(table|model|entity)',
        r'prisma\.(\w+)\.(\w+)',
    ]
    
    for pattern in patterns:
        matches = re.findall(pattern, text, re.IGNORECASE)
        for match in matches:
            if len(match) == 2:
                operation, entity = match
                operations.append({
                    'operation': operation.upper(),
                    'entity': entity,
                    'type': 'database_operation'
                })
    
    return operations

def extract_business_concepts(text: str) -> List[Dict[str, str]]:
    """Extract business concepts and workflows"""
    concepts = []
    
    # Find business concepts
    business_terms = [
        'campaign', 'audience', 'email', 'template', 'schedule', 'rsvp',
        'analytics', 'tracking', 'visitor', 'member', 'group', 'send',
        'delivery', 'bounce', 'open', 'click', 'unsubscribe', 'confirmation'
    ]
    
    for term in business_terms:
        if term in text.lower():
            concepts.append({
                'concept': term,
                'type': 'business_concept'
            })
    
    return concepts

def create_comprehensive_explanation(instruction: str, input_text: str, output: str) -> Dict[str, Any]:
    """Create comprehensive explanation for SLM training"""
    
    # Extract different types of information
    code_blocks = extract_code_blocks(output)
    api_endpoints = extract_api_endpoints(output)
    db_operations = extract_database_operations(output)
    business_concepts = extract_business_concepts(output)
    
    # Create detailed explanation
    explanation = {
        'instruction': instruction,
        'input': input_text,
        'output': output,
        'metadata': {
            'created_at': datetime.now().isoformat(),
            'type': 'slm_training_data',
            'comprehensiveness': 'high',
            'explanation_depth': 'detailed'
        },
        'extracted_components': {
            'code_blocks': code_blocks,
            'api_endpoints': api_endpoints,
            'database_operations': db_operations,
            'business_concepts': business_concepts
        },
        'learning_objectives': {
            'primary': 'Understand the complete system architecture and workflows',
            'secondary': 'Learn how to interact with APIs, database, and UI components',
            'tertiary': 'Understand business processes and user workflows'
        },
        'context_explanation': {
            'what_this_teaches': 'This training example teaches the AI how to understand and work with the RSVP application system',
            'why_this_matters': 'Understanding these concepts allows the AI to help users with real tasks in the application',
            'how_to_use': 'The AI can use this knowledge to answer questions, perform tasks, and help users navigate the system'
        },
        'practical_applications': {
            'user_queries': [
                'How do I create a new campaign?',
                'How do I manage audience groups?',
                'How do I send emails to my audience?',
                'How do I track campaign performance?',
                'How do I process RSVPs?'
            ],
            'ai_capabilities': [
                'Answer questions about system functionality',
                'Guide users through workflows',
                'Help troubleshoot issues',
                'Explain system processes',
                'Assist with data management'
            ]
        },
        'system_interconnections': {
            'data_flow': 'Shows how data flows through the system from user input to database storage',
            'component_relationships': 'Explains how different parts of the system work together',
            'workflow_dependencies': 'Describes the order of operations and dependencies between tasks'
        }
    }
    
    return explanation

def vectorize_training_file(file_path: str) -> List[Dict[str, Any]]:
    """Vectorize a single training file with comprehensive explanations"""
    vectorized_data = []
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            for line_num, line in enumerate(f, 1):
                line = line.strip()
                if not line:
                    continue
                
                try:
                    data = json.loads(line)
                    
                    # Create comprehensive explanation
                    vectorized_item = create_comprehensive_explanation(
                        data.get('instruction', ''),
                        data.get('input', ''),
                        data.get('output', '')
                    )
                    
                    # Add file metadata
                    vectorized_item['source_file'] = os.path.basename(file_path)
                    vectorized_item['line_number'] = line_num
                    
                    vectorized_data.append(vectorized_item)
                    
                except json.JSONDecodeError as e:
                    print(f"Error parsing JSON in {file_path} line {line_num}: {e}")
                    continue
                    
    except FileNotFoundError:
        print(f"File not found: {file_path}")
        return []
    
    return vectorized_data

def main():
    """Main vectorization process"""
    print("🚀 Starting SLM-Friendly Training Data Vectorization")
    print("=" * 60)
    
    # Define training data files
    training_files = [
        '26-database-operations-slm-friendly.jsonl',
        '27-api-routing-slm-friendly.jsonl',
        '28-ui-components-slm-friendly.jsonl',
        '29-error-handling-slm-friendly.jsonl',
        '30-performance-optimization-slm-friendly.jsonl',
        '31-testing-framework-slm-friendly.jsonl',
        '32-deployment-config-slm-friendly.jsonl'
    ]
    
    all_vectorized_data = []
    total_examples = 0
    
    # Process each training file
    for file_name in training_files:
        file_path = file_name  # Files are in current directory
        print(f"\n📁 Processing {file_name}...")
        
        vectorized_data = vectorize_training_file(file_path)
        all_vectorized_data.extend(vectorized_data)
        total_examples += len(vectorized_data)
        
        print(f"   ✅ Vectorized {len(vectorized_data)} examples")
    
    # Create comprehensive output
    output_data = {
        'metadata': {
            'total_examples': total_examples,
            'vectorization_date': datetime.now().isoformat(),
            'purpose': 'SLM training data with comprehensive explanations',
            'target_model': 'Small Language Model (SLM)',
            'explanation_depth': 'high',
            'comprehensiveness': 'comprehensive'
        },
        'training_data': all_vectorized_data,
        'summary': {
            'categories_covered': len(training_files),
            'total_examples': total_examples,
            'explanation_types': [
                'code_blocks',
                'api_endpoints', 
                'database_operations',
                'business_concepts',
                'system_interconnections',
                'practical_applications'
            ]
        }
    }
    
    # Save vectorized data
    output_file = 'slm-friendly-vectorized-data.json'
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(output_data, f, indent=2, ensure_ascii=False)
    
    print(f"\n🎉 Vectorization Complete!")
    print(f"   📊 Total examples: {total_examples}")
    print(f"   📁 Categories: {len(training_files)}")
    print(f"   💾 Output file: {output_file}")
    
    # Create summary report
    create_summary_report(output_data)
    
    print("\n✨ SLM-Friendly training data is ready for fine-tuning!")

def create_summary_report(data: Dict[str, Any]) -> None:
    """Create a summary report of the vectorized data"""
    
    report = {
        'vectorization_summary': {
            'date': datetime.now().isoformat(),
            'total_examples': data['metadata']['total_examples'],
            'categories_processed': data['summary']['categories_covered'],
            'explanation_depth': 'comprehensive'
        },
        'training_data_breakdown': {},
        'extracted_components_summary': {
            'total_code_blocks': 0,
            'total_api_endpoints': 0,
            'total_database_operations': 0,
            'total_business_concepts': 0
        },
        'learning_objectives_covered': set(),
        'practical_applications': set()
    }
    
    # Analyze each training example
    for example in data['training_data']:
        source_file = example['source_file']
        
        # Count by source file
        if source_file not in report['training_data_breakdown']:
            report['training_data_breakdown'][source_file] = 0
        report['training_data_breakdown'][source_file] += 1
        
        # Count extracted components
        components = example['extracted_components']
        report['extracted_components_summary']['total_code_blocks'] += len(components.get('code_blocks', []))
        report['extracted_components_summary']['total_api_endpoints'] += len(components.get('api_endpoints', []))
        report['extracted_components_summary']['total_database_operations'] += len(components.get('database_operations', []))
        report['extracted_components_summary']['total_business_concepts'] += len(components.get('business_concepts', []))
        
        # Collect learning objectives
        objectives = example['learning_objectives']
        report['learning_objectives_covered'].add(objectives['primary'])
        report['learning_objectives_covered'].add(objectives['secondary'])
        report['learning_objectives_covered'].add(objectives['tertiary'])
        
        # Collect practical applications
        for query in example['practical_applications']['user_queries']:
            report['practical_applications'].add(query)
    
    # Convert sets to lists for JSON serialization
    report['learning_objectives_covered'] = list(report['learning_objectives_covered'])
    report['practical_applications'] = list(report['practical_applications'])
    
    # Save report
    report_file = 'slm-vectorization-report.json'
    with open(report_file, 'w', encoding='utf-8') as f:
        json.dump(report, f, indent=2, ensure_ascii=False)
    
    print(f"   📋 Summary report: {report_file}")

if __name__ == "__main__":
    main()
