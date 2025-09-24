#!/usr/bin/env python3
"""
Fine-tune Qwen2.5-3B for RSVP system management using MLX
"""

import json
import os
from pathlib import Path

def prepare_training_data():
    """Convert our JSONL training data to the format expected by MLX"""
    
    # Read our training data
    training_file = Path("training-data/rsvp-training-dataset.jsonl")
    
    if not training_file.exists():
        print("❌ Training data file not found!")
        return None
    
    # Convert to instruction format
    instructions = []
    
    with open(training_file, 'r') as f:
        for line in f:
            data = json.loads(line.strip())
            
            # Create instruction format
            instruction = {
                "instruction": data["instruction"],
                "input": data["input"],
                "output": data["output"]
            }
            instructions.append(instruction)
    
    # Save in MLX format
    output_file = Path("training-data/rsvp-mlx-format.json")
    with open(output_file, 'w') as f:
        json.dump(instructions, f, indent=2)
    
    print(f"✅ Converted {len(instructions)} training examples to MLX format")
    print(f"📁 Saved to: {output_file}")
    
    return output_file

def run_finetuning():
    """Run the fine-tuning process"""
    
    print("🚀 Starting Qwen2.5-3B fine-tuning for RSVP system...")
    
    # Prepare training data
    training_file = prepare_training_data()
    if not training_file:
        return False
    
    # Fine-tuning command
    cmd = f"""
    python -m mlx_lm.lora \
        --model Qwen/Qwen2.5-3B-Instruct \
        --train \
        --data {training_file} \
        --iters 100 \
        --val-batches 10 \
        --learning-rate 1e-5 \
        --batch-size 4 \
        --lora-layers 16 \
        --lora-rank 8 \
        --lora-alpha 16 \
        --lora-dropout 0.05 \
        --save-every 25 \
        --adapter-path ./rsvp-qwen-lora \
        --seed 42
    """
    
    print("📋 Fine-tuning command:")
    print(cmd)
    print("\n⏳ This will take approximately 10-15 minutes on Mac Mini M4 Pro...")
    
    # Run the command
    os.system(cmd)
    
    print("✅ Fine-tuning completed!")
    print("📁 Model saved to: ./rsvp-qwen-lora")
    
    return True

if __name__ == "__main__":
    success = run_finetuning()
    if success:
        print("\n🎉 Fine-tuning successful!")
        print("🔧 Next steps:")
        print("1. Test the fine-tuned model locally")
        print("2. Create API wrapper")
        print("3. Deploy to Railway")
    else:
        print("\n❌ Fine-tuning failed!")

