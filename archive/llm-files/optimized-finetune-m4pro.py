#!/usr/bin/env python3
"""
Optimized fine-tuning script for Mac Mini M4 Pro
Leverages full hardware capabilities for maximum performance
"""

import json
import os
import subprocess
from pathlib import Path

def check_m4pro_hardware():
    """Check M4 Pro hardware capabilities"""
    print("🔍 Checking Mac Mini M4 Pro hardware...")
    
    # Check CPU cores
    cpu_cores = os.cpu_count()
    print(f"   CPU Cores: {cpu_cores}")
    
    # Check memory
    try:
        result = subprocess.run(['sysctl', 'hw.memsize'], capture_output=True, text=True)
        memory_bytes = int(result.stdout.split(':')[1].strip())
        memory_gb = memory_bytes / (1024**3)
        print(f"   Memory: {memory_gb:.1f} GB")
    except:
        print("   Memory: Unable to detect")
    
    # Check if MLX is available
    try:
        import mlx.core as mx
        print(f"   MLX Version: {mx.__version__}")
        print(f"   MLX Devices: {mx.metal.is_available()}")
    except ImportError:
        print("   MLX: Not available")
    
    print("✅ Hardware check complete\n")

def optimize_training_config():
    """Optimize training configuration for M4 Pro"""
    print("⚙️ Optimizing training configuration for M4 Pro...")
    
    # M4 Pro optimized settings
    config = {
        "model": "Qwen/Qwen2.5-3B-Instruct",
        "data": "training-data/comprehensive-rsvp-mlx.json",
        "iters": 200,  # More iterations for better learning
        "val_batches": 20,  # More validation batches
        "learning_rate": 2e-5,  # Slightly higher learning rate
        "batch_size": 8,  # Larger batch size for M4 Pro
        "num_layers": 32,  # More layers for better performance
        "adapter_path": "./rsvp-qwen-lora-m4pro",
        "seed": 42,
        "save_every": 50,  # Save more frequently
        "steps_per_report": 10,  # More frequent reporting
        "steps_per_eval": 25,  # More frequent evaluation
        "max_seq_length": 2048,  # Longer sequences
        "grad_checkpoint": True,  # Enable gradient checkpointing
        "optimizer": "adamw",  # Use AdamW optimizer
        "fine_tune_type": "lora"  # Use LoRA for efficiency
    }
    
    print("📋 M4 Pro Optimized Configuration:")
    for key, value in config.items():
        print(f"   {key}: {value}")
    
    return config

def run_optimized_finetuning():
    """Run optimized fine-tuning for M4 Pro"""
    print("🚀 Starting optimized fine-tuning for Mac Mini M4 Pro...")
    
    # Check hardware
    check_m4pro_hardware()
    
    # Get optimized config
    config = optimize_training_config()
    
    # Build MLX command
    cmd_parts = [
        "python3", "-m", "mlx_lm", "lora",
        "--model", config["model"],
        "--train",
        "--data", config["data"],
        "--iters", str(config["iters"]),
        "--val-batches", str(config["val_batches"]),
        "--learning-rate", str(config["learning_rate"]),
        "--batch-size", str(config["batch_size"]),
        "--num-layers", str(config["num_layers"]),
        "--adapter-path", config["adapter_path"],
        "--seed", str(config["seed"]),
        "--save-every", str(config["save_every"]),
        "--steps-per-report", str(config["steps_per_report"]),
        "--steps-per-eval", str(config["steps_per_eval"]),
        "--max-seq-length", str(config["max_seq_length"]),
        "--optimizer", config["optimizer"],
        "--fine-tune-type", config["fine_tune_type"]
    ]
    
    if config["grad_checkpoint"]:
        cmd_parts.append("--grad-checkpoint")
    
    cmd = " ".join(cmd_parts)
    
    print("📋 Optimized MLX Command:")
    print(cmd)
    print("\n⏳ Estimated time: 20-30 minutes on Mac Mini M4 Pro")
    print("🔥 Leveraging full M4 Pro hardware capabilities...")
    
    # Run the command
    try:
        result = subprocess.run(cmd_parts, check=True, capture_output=False)
        print("✅ Fine-tuning completed successfully!")
        print(f"📁 Model saved to: {config['adapter_path']}")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Fine-tuning failed: {e}")
        return False

def test_finetuned_model():
    """Test the fine-tuned model"""
    print("🧪 Testing fine-tuned model...")
    
    test_prompts = [
        "Create a new email campaign for our summer sale",
        "Show me all my templates",
        "What's the status of my latest campaign?",
        "Set up automation for new subscribers",
        "Generate a monthly report"
    ]
    
    for prompt in test_prompts:
        print(f"\n📝 Test Prompt: {prompt}")
        
        # Test command
        test_cmd = [
            "python3", "-m", "mlx_lm", "generate",
            "--model", "Qwen/Qwen2.5-3B-Instruct",
            "--adapter-path", "./rsvp-qwen-lora-m4pro",
            "--prompt", prompt,
            "--max-tokens", "200"
        ]
        
        try:
            result = subprocess.run(test_cmd, capture_output=True, text=True, timeout=30)
            if result.returncode == 0:
                print(f"✅ Response: {result.stdout.strip()}")
            else:
                print(f"❌ Error: {result.stderr.strip()}")
        except subprocess.TimeoutExpired:
            print("⏰ Timeout - model may be slow")
        except Exception as e:
            print(f"❌ Test failed: {e}")

def main():
    """Main execution function"""
    print("🎯 Mac Mini M4 Pro Optimized Fine-tuning")
    print("=" * 50)
    
    # Check if training data exists
    training_file = Path("training-data/comprehensive-rsvp-mlx.json")
    if not training_file.exists():
        print("❌ Training data not found!")
        print("   Run: python3 training-data/comprehensive-training-generator.py")
        return False
    
    # Run optimized fine-tuning
    success = run_optimized_finetuning()
    
    if success:
        print("\n🎉 Fine-tuning successful!")
        
        # Test the model
        test_finetuned_model()
        
        print("\n🔧 Next steps:")
        print("1. ✅ Fine-tuned model ready")
        print("2. 🔄 Create API wrapper")
        print("3. 🚀 Deploy to Railway")
        print("4. 🔗 Integrate with RSVP app")
        
        return True
    else:
        print("\n❌ Fine-tuning failed!")
        return False

if __name__ == "__main__":
    main()


