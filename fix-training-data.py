#!/usr/bin/env python3
"""
Fix Training Data Structure Issues
"""

import json
import os
from typing import List, Dict, Any

def fix_training_data():
    """Fix the training data structure issues"""
    print("🔧 FIXING TRAINING DATA STRUCTURE")
    print("=" * 50)
    
    # Load the original training data files
    training_files = []
    for filename in os.listdir('training-data'):
        if filename.endswith('-accurate.jsonl'):
            training_files.append(filename)
    
    print(f"📁 Found {len(training_files)} training files")
    
    all_examples = []
    
    for filename in training_files:
        print(f"📄 Processing {filename}...")
        
        try:
            with open(f'training-data/{filename}', 'r') as f:
                for line_num, line in enumerate(f, 1):
                    line = line.strip()
                    if not line:
                        continue
                    
                    try:
                        data = json.loads(line)
                        
                        # Ensure all required fields are present
                        if 'instruction' not in data:
                            print(f"   ❌ Line {line_num}: Missing 'instruction' field")
                            continue
                        if 'input' not in data:
                            print(f"   ❌ Line {line_num}: Missing 'input' field")
                            continue
                        if 'output' not in data:
                            print(f"   ❌ Line {line_num}: Missing 'output' field")
                            continue
                        
                        # Create properly structured example
                        example = {
                            "id": f"{filename}_{line_num}",
                            "instruction": data['instruction'],
                            "input": data['input'],
                            "output": data['output'],
                            "category": data.get('category', 'General'),
                            "subcategory": data.get('subcategory', 'General'),
                            "source": filename,
                            "createdBy": "training_data_generator",
                            "metadata": json.dumps({
                                "original_file": filename,
                                "line_number": line_num,
                                "complexity_level": data.get('complexity_level', 'intermediate')
                            }),
                            "tags": data.get('tags', ['rsvp', 'training'])
                        }
                        
                        all_examples.append(example)
                        
                    except json.JSONDecodeError as e:
                        print(f"   ❌ Line {line_num}: Invalid JSON - {e}")
                        continue
        
        except Exception as e:
            print(f"   ❌ Error processing {filename}: {e}")
            continue
    
    print(f"✅ Processed {len(all_examples)} valid examples")
    
    # Save the fixed training data
    with open('training-data/fixed-training-data.json', 'w') as f:
        json.dump(all_examples, f, indent=2)
    
    print(f"💾 Saved fixed training data to: training-data/fixed-training-data.json")
    
    # Create a summary
    categories = {}
    for example in all_examples:
        cat = example['category']
        categories[cat] = categories.get(cat, 0) + 1
    
    print(f"\n📊 CATEGORY DISTRIBUTION:")
    for cat, count in sorted(categories.items()):
        print(f"   {cat}: {count} examples")
    
    return all_examples

def upload_fixed_data_to_weaviate():
    """Upload the fixed training data to Weaviate"""
    print(f"\n🚀 UPLOADING FIXED DATA TO WEAVIATE")
    print("=" * 50)
    
    try:
        import weaviate
        
        # Weaviate configuration
        WEAVIATE_URL = "https://rbq70xfws0wsquqdhxxc4w.c0.us-west3.gcp.weaviate.cloud"
        WEAVIATE_API_KEY = "enZ6V29tM3VaeG1PQ25jZV96bVRhdHR5OGJUWlp2SmlwQTdaUUZ1VHVLZmJ3a2ZoRUFYK1YzbkltVmZnPV92MjAw"
        
        # Connect to Weaviate
        client = weaviate.connect_to_weaviate_cloud(
            cluster_url=WEAVIATE_URL,
            auth_credentials=weaviate.auth.AuthApiKey(WEAVIATE_API_KEY)
        )
        print("✅ Connected to Weaviate")
        
        # Load fixed training data
        with open('training-data/fixed-training-data.json', 'r') as f:
            data = json.load(f)
        
        print(f"📤 Uploading {len(data)} examples to KnowledgeBase...")
        
        # Get the KnowledgeBase collection
        kb_collection = client.collections.get("KnowledgeBase")
        
        # Upload in batches
        batch_size = 10
        uploaded_count = 0
        
        for i in range(0, len(data), batch_size):
            batch = data[i:i + batch_size]
            
            # Prepare objects for upload
            objects_to_upload = []
            for item in batch:
                obj = {
                    "title": item['instruction'][:100] + "..." if len(item['instruction']) > 100 else item['instruction'],
                    "content": f"Instruction: {item['instruction']}\n\nInput: {item['input']}\n\nOutput: {item['output']}",
                    "category": item['category'],
                    "subcategory": item['subcategory'],
                    "source": item['source'],
                    "createdBy": item['createdBy'],
                    "metadata": item['metadata'],
                    "tags": item['tags']
                }
                objects_to_upload.append(obj)
            
            # Upload batch
            result = kb_collection.data.insert_many(objects_to_upload)
            uploaded_count += len(batch)
            
            print(f"📤 Uploaded batch {i//batch_size + 1}: {len(batch)} items (Total: {uploaded_count}/{len(data)})")
        
        print(f"✅ Successfully uploaded {uploaded_count} examples")
        
        # Verify upload
        total_count = kb_collection.aggregate.over_all(total_count=True).total_count
        print(f"📊 Total objects in KnowledgeBase: {total_count}")
        
        client.close()
        return True
        
    except Exception as e:
        print(f"❌ Upload failed: {e}")
        return False

def main():
    """Main function"""
    print("🔧 FIXING TRAINING DATA ISSUES")
    print("=" * 50)
    
    # Fix the training data structure
    examples = fix_training_data()
    
    if examples:
        # Upload to Weaviate
        success = upload_fixed_data_to_weaviate()
        
        if success:
            print(f"\n🎉 TRAINING DATA FIXED AND UPLOADED!")
            print(f"✅ {len(examples)} examples with proper structure")
            print(f"✅ All required fields present")
            print(f"✅ Uploaded to Weaviate KnowledgeBase")
        else:
            print(f"\n❌ Upload to Weaviate failed")
    else:
        print(f"\n❌ No valid training data found")

if __name__ == "__main__":
    main()
