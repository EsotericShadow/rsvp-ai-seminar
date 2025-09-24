#!/usr/bin/env python3
"""
Create proper MLX dataset structure with train/valid/test splits
"""

import json
import random
from pathlib import Path

def create_mlx_dataset_structure():
    """Create proper MLX dataset structure"""
    print("🔄 Creating MLX dataset structure...")
    
    # Load the comprehensive dataset
    input_file = Path("training-data/final-comprehensive-dataset.jsonl")
    if not input_file.exists():
        print(f"❌ Input file not found: {input_file}")
        return False
    
    # Read all examples
    examples = []
    with open(input_file, 'r') as f:
        for line in f:
            examples.append(json.loads(line))
    
    print(f"📊 Loaded {len(examples)} examples")
    
    # Convert to MLX format
    mlx_examples = []
    for example in examples:
        mlx_example = {
            "text": f"### Instruction:\n{example['instruction']}\n\n### Input:\n{example['input']}\n\n### Response:\n{example['output']}"
        }
        mlx_examples.append(mlx_example)
    
    # Shuffle and split the data
    random.shuffle(mlx_examples)
    
    # Split: 80% train, 10% valid, 10% test
    total = len(mlx_examples)
    train_size = int(0.8 * total)
    valid_size = int(0.1 * total)
    
    train_data = mlx_examples[:train_size]
    valid_data = mlx_examples[train_size:train_size + valid_size]
    test_data = mlx_examples[train_size + valid_size:]
    
    print(f"📊 Split: {len(train_data)} train, {len(valid_data)} valid, {len(test_data)} test")
    
    # Create directory
    dataset_dir = Path("training-data/mlx-dataset")
    dataset_dir.mkdir(exist_ok=True)
    
    # Save train.jsonl
    with open(dataset_dir / "train.jsonl", 'w') as f:
        for example in train_data:
            f.write(json.dumps(example) + '\n')
    
    # Save valid.jsonl
    with open(dataset_dir / "valid.jsonl", 'w') as f:
        for example in valid_data:
            f.write(json.dumps(example) + '\n')
    
    # Save test.jsonl
    with open(dataset_dir / "test.jsonl", 'w') as f:
        for example in test_data:
            f.write(json.dumps(example) + '\n')
    
    print(f"✅ Created MLX dataset structure in: {dataset_dir}")
    print(f"📁 Files created:")
    print(f"   - train.jsonl ({len(train_data)} examples)")
    print(f"   - valid.jsonl ({len(valid_data)} examples)")
    print(f"   - test.jsonl ({len(test_data)} examples)")
    
    return dataset_dir

if __name__ == "__main__":
    create_mlx_dataset_structure()


