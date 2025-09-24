#!/usr/bin/env python3
"""
Convert training data to proper MLX format for fine-tuning
"""

import json
from pathlib import Path

def convert_to_mlx_format():
    """Convert training data to MLX format"""
    print("🔄 Converting training data to MLX format...")
    
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
        # MLX expects a specific format
        mlx_example = {
            "text": f"### Instruction:\n{example['instruction']}\n\n### Input:\n{example['input']}\n\n### Response:\n{example['output']}"
        }
        mlx_examples.append(mlx_example)
    
    # Save in MLX format
    output_file = Path("training-data/rsvp-mlx-format.json")
    with open(output_file, 'w') as f:
        json.dump(mlx_examples, f, indent=2)
    
    print(f"✅ Converted {len(mlx_examples)} examples to MLX format")
    print(f"📁 Saved to: {output_file}")
    
    # Also create a smaller test dataset
    test_examples = mlx_examples[:20]  # First 20 examples for testing
    test_file = Path("training-data/rsvp-test-mlx.json")
    with open(test_file, 'w') as f:
        json.dump(test_examples, f, indent=2)
    
    print(f"📁 Test dataset saved to: {test_file}")
    
    return output_file

if __name__ == "__main__":
    convert_to_mlx_format()

