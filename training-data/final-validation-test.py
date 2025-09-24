#!/usr/bin/env python3
"""
Final Validation Test - Comprehensive Systems Check
Validates all training data, AI capabilities, and system readiness
"""

import json
import os
from typing import Dict, List, Any
from datetime import datetime

def run_final_validation():
    """Run final comprehensive validation"""
    print("🚀 FINAL COMPREHENSIVE VALIDATION")
    print("=" * 60)
    
    results = {
        'timestamp': datetime.now().isoformat(),
        'validation_passed': True,
        'issues_found': [],
        'recommendations': [],
        'system_ready': True
    }
    
    # 1. Check all training files exist and are valid
    print("\n📁 1. TRAINING DATA VALIDATION")
    training_files = [f for f in os.listdir('.') if f.endswith('.jsonl')]
    print(f"   Found {len(training_files)} training files")
    
    invalid_files = []
    for file_path in training_files:
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                for line in f:
                    line = line.strip()
                    if line:
                        json.loads(line)
            print(f"   ✅ {file_path}")
        except Exception as e:
            invalid_files.append(f"{file_path}: {str(e)}")
            print(f"   ❌ {file_path}: {str(e)}")
            results['validation_passed'] = False
    
    if invalid_files:
        results['issues_found'].extend(invalid_files)
        results['recommendations'].append("Fix invalid JSON files before proceeding")
    
    # 2. Check SLM-friendly training data
    print("\n🤖 2. SLM-FRIENDLY TRAINING DATA")
    slm_files = [f for f in training_files if 'slm-friendly' in f]
    print(f"   Found {len(slm_files)} SLM-friendly files")
    
    for file_path in slm_files:
        print(f"   ✅ {file_path}")
    
    if len(slm_files) < 8:
        results['issues_found'].append(f"Only {len(slm_files)} SLM-friendly files found, expected 8")
        results['recommendations'].append("Create all SLM-friendly training files")
    
    # 3. Check AI command functions
    print("\n⚡ 3. AI COMMAND FUNCTIONS")
    ai_commands_file = '33-ai-command-functions-slm-friendly.jsonl'
    if os.path.exists(ai_commands_file):
        with open(ai_commands_file, 'r', encoding='utf-8') as f:
            content = f.read()
            
        # Check for key command functions
        required_functions = [
            'createCampaign', 'updateCampaign', 'sendCampaignEmail',
            'createAudienceGroup', 'createTemplate', 'renderTemplate'
        ]
        
        missing_functions = []
        for func in required_functions:
            if func in content:
                print(f"   ✅ {func}")
            else:
                missing_functions.append(func)
                print(f"   ❌ {func}")
        
        if missing_functions:
            results['issues_found'].append(f"Missing AI command functions: {missing_functions}")
            results['recommendations'].append("Add missing command functions to AI training data")
    else:
        results['issues_found'].append("AI command functions file not found")
        results['recommendations'].append("Create AI command functions training data")
    
    # 4. Check RAG system readiness
    print("\n🧠 4. RAG SYSTEM READINESS")
    rag_files = ['slm-friendly-vectorized-data.json', 'slm-vectorization-report.json']
    
    for file_path in rag_files:
        if os.path.exists(file_path):
            print(f"   ✅ {file_path}")
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                print(f"      - Valid JSON structure")
            except Exception as e:
                print(f"   ❌ {file_path}: Invalid JSON - {e}")
                results['validation_passed'] = False
        else:
            print(f"   ❌ {file_path} not found")
            results['issues_found'].append(f"RAG file {file_path} not found")
            results['recommendations'].append("Generate RAG vectorized data")
    
    # 5. Check system integration files
    print("\n🔧 5. SYSTEM INTEGRATION FILES")
    integration_files = [
        'configure-slm-rag-system.py',
        'vectorize-slm-friendly-data.py',
        'comprehensive-systems-check.py',
        'intent-validation-test.py'
    ]
    
    for file_path in integration_files:
        if os.path.exists(file_path):
            print(f"   ✅ {file_path}")
        else:
            print(f"   ❌ {file_path} not found")
            results['issues_found'].append(f"Integration file {file_path} not found")
    
    # 6. Check training data completeness
    print("\n📊 6. TRAINING DATA COMPLETENESS")
    
    # Count examples in each category
    category_counts = {}
    for file_path in training_files:
        category = file_path.replace('.jsonl', '').replace('-slm-friendly', '').replace('-accurate', '').replace('-comprehensive', '')
        if category not in category_counts:
            category_counts[category] = 0
        
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                for line in f:
                    line = line.strip()
                    if line:
                        category_counts[category] += 1
        except:
            pass
    
    print(f"   Categories covered: {len(category_counts)}")
    total_examples = sum(category_counts.values())
    print(f"   Total examples: {total_examples}")
    
    if total_examples < 500:
        results['issues_found'].append(f"Only {total_examples} training examples, recommended 500+")
        results['recommendations'].append("Add more training examples for better AI performance")
    
    # 7. Check for comprehensive coverage
    print("\n🎯 7. COMPREHENSIVE COVERAGE CHECK")
    
    required_categories = [
        'campaign', 'email', 'audience', 'template', 'analytics',
        'security', 'admin', 'api', 'database', 'ui', 'error',
        'performance', 'testing', 'deployment'
    ]
    
    covered_categories = []
    missing_categories = []
    
    for category in required_categories:
        found = False
        for file_category in category_counts.keys():
            if category in file_category.lower():
                covered_categories.append(category)
                found = True
                break
        
        if not found:
            missing_categories.append(category)
    
    print(f"   Covered categories: {len(covered_categories)}/{len(required_categories)}")
    for category in covered_categories:
        print(f"   ✅ {category}")
    
    for category in missing_categories:
        print(f"   ❌ {category}")
        results['issues_found'].append(f"Missing training data for {category}")
    
    # 8. Final system readiness assessment
    print("\n🎉 8. FINAL SYSTEM READINESS")
    
    if results['validation_passed'] and len(results['issues_found']) == 0:
        print("   ✅ SYSTEM IS READY FOR DEPLOYMENT")
        print("   ✅ All training data is valid")
        print("   ✅ AI command functions are complete")
        print("   ✅ RAG system is configured")
        print("   ✅ Comprehensive coverage achieved")
        results['system_ready'] = True
    else:
        print("   ⚠️  SYSTEM NEEDS ATTENTION")
        print(f"   ❌ {len(results['issues_found'])} issues found")
        results['system_ready'] = False
    
    # Generate final report
    print(f"\n📋 FINAL VALIDATION REPORT")
    print("=" * 60)
    print(f"Validation Status: {'✅ PASSED' if results['validation_passed'] else '❌ FAILED'}")
    print(f"System Ready: {'✅ YES' if results['system_ready'] else '❌ NO'}")
    print(f"Issues Found: {len(results['issues_found'])}")
    print(f"Recommendations: {len(results['recommendations'])}")
    
    if results['issues_found']:
        print(f"\n❌ ISSUES TO ADDRESS:")
        for issue in results['issues_found']:
            print(f"   • {issue}")
    
    if results['recommendations']:
        print(f"\n💡 RECOMMENDATIONS:")
        for rec in results['recommendations']:
            print(f"   • {rec}")
    
    # Save final report
    with open('final-validation-report.json', 'w', encoding='utf-8') as f:
        json.dump(results, f, indent=2, ensure_ascii=False)
    
    print(f"\n📄 Full report saved to: final-validation-report.json")
    
    return results

if __name__ == "__main__":
    run_final_validation()
