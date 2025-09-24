#!/usr/bin/env python3
"""
M4 Pro Optimized Fine-tuning Script
Uses accurate training data and leverages full Mac Mini M4 Pro hardware
"""

import json
import os
import subprocess
import time
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
        print(f"   MLX Metal Available: {mx.metal.is_available()}")
        print(f"   MLX Devices: {mx.device_count() if hasattr(mx, 'device_count') else 'Available'}")
    except ImportError:
        print("   MLX: Not available")
    
    print("✅ Hardware check complete\n")

def optimize_for_m4pro():
    """Optimize training configuration for M4 Pro"""
    print("⚙️ Optimizing for Mac Mini M4 Pro...")
    
    # M4 Pro optimized settings - leveraging full hardware
    config = {
        "model": "Qwen/Qwen2.5-3B-Instruct",
        "data": "training-data/rsvp-mlx-format.json",
        "iters": 300,  # More iterations for better learning
        "val_batches": 30,  # More validation batches
        "learning_rate": 3e-5,  # Optimized learning rate for M4 Pro
        "batch_size": 12,  # Larger batch size for M4 Pro (24GB RAM)
        "num_layers": 32,  # More layers for better performance
        "adapter_path": "./rsvp-qwen-lora-m4pro-optimized",
        "seed": 42,
        "save_every": 50,  # Save more frequently
        "steps_per_report": 10,  # More frequent reporting
        "steps_per_eval": 20,  # More frequent evaluation
        "max_seq_length": 4096,  # Longer sequences for better context
        "grad_checkpoint": True,  # Enable gradient checkpointing
        "optimizer": "adamw",  # Use AdamW optimizer
        "fine_tune_type": "lora"  # Use LoRA for efficiency
    }
    
    print("📋 M4 Pro Optimized Configuration:")
    for key, value in config.items():
        print(f"   {key}: {value}")
    
    return config

def run_m4pro_finetuning():
    """Run optimized fine-tuning for M4 Pro"""
    print("🚀 Starting M4 Pro optimized fine-tuning...")
    
    # Check hardware
    check_m4pro_hardware()
    
    # Get optimized config
    config = optimize_for_m4pro()
    
    # Verify training data exists
    training_file = Path(config["data"])
    if not training_file.exists():
        print(f"❌ Training data not found: {training_file}")
        return False
    
    # Check training data
    with open(training_file, 'r') as f:
        training_data = json.load(f)
    
    print(f"📊 Training data: {len(training_data)} examples")
    
    # Build MLX command with M4 Pro optimizations
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
    
    print("📋 M4 Pro Optimized MLX Command:")
    print(cmd)
    print("\n⏳ Estimated time: 25-35 minutes on Mac Mini M4 Pro")
    print("🔥 Leveraging full M4 Pro hardware capabilities...")
    print("💾 Using accurate training data based on real codebase...")
    
    # Run the command
    start_time = time.time()
    try:
        result = subprocess.run(cmd_parts, check=True, capture_output=False)
        end_time = time.time()
        
        print("✅ Fine-tuning completed successfully!")
        print(f"⏱️  Total time: {(end_time - start_time) / 60:.1f} minutes")
        print(f"📁 Model saved to: {config['adapter_path']}")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Fine-tuning failed: {e}")
        return False

def test_finetuned_model():
    """Test the fine-tuned model with RSVP-specific prompts"""
    print("🧪 Testing fine-tuned model with RSVP scenarios...")
    
    test_prompts = [
        "Create a new email campaign for our summer sale",
        "Show me all my email templates",
        "What's the status of my latest campaign?",
        "Set up a schedule for new subscribers",
        "Generate a monthly report",
        "Create an audience group for tech professionals",
        "Show me RSVP data from last week",
        "What's the open rate for my newsletter?",
        "Set up automation for event reminders",
        "Export audience data to CSV"
    ]
    
    for i, prompt in enumerate(test_prompts, 1):
        print(f"\n📝 Test {i}/10: {prompt}")
        
        # Test command
        test_cmd = [
            "python3", "-m", "mlx_lm", "generate",
            "--model", "Qwen/Qwen2.5-3B-Instruct",
            "--adapter-path", "./rsvp-qwen-lora-m4pro-optimized",
            "--prompt", prompt,
            "--max-tokens", "300",
            "--temp", "0.7"
        ]
        
        try:
            result = subprocess.run(test_cmd, capture_output=True, text=True, timeout=60)
            if result.returncode == 0:
                response = result.stdout.strip()
                print(f"✅ Response: {response[:200]}...")
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
    print("📊 Using accurate training data from real codebase")
    print("🔥 Leveraging full M4 Pro hardware capabilities")
    print("=" * 50)
    
    # Run optimized fine-tuning
    success = run_m4pro_finetuning()
    
    if success:
        print("\n🎉 Fine-tuning successful!")
        
        # Test the model
        test_finetuned_model()
        
        print("\n🔧 Next steps:")
        print("1. ✅ Fine-tuned model ready")
        print("2. 🔄 Create FastAPI wrapper")
        print("3. 🚀 Deploy to Railway")
        print("4. 🔗 Integrate with RSVP app")
        print("5. 🧪 Test with real users")
        
        return True
    else:
        print("\n❌ Fine-tuning failed!")
        print("🔍 Check the error messages above for details")
        return False

if __name__ == "__main__":
    main()
