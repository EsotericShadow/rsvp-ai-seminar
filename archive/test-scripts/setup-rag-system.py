#!/usr/bin/env python3
"""
Comprehensive RAG System Setup Script
Sets up the complete Weaviate RAG system with all training data, codebase knowledge, and brand context
"""

import os
import sys
import json
import subprocess
from pathlib import Path
from typing import Dict, List, Any

def check_environment():
    """Check if all required environment variables are set"""
    required_vars = [
        'WEAVIATE_URL',
        'WEAVIATE_API_KEY', 
        'OPENAI_API_KEY'
    ]
    
    missing_vars = []
    for var in required_vars:
        if not os.getenv(var):
            missing_vars.append(var)
    
    if missing_vars:
        print("❌ Missing required environment variables:")
        for var in missing_vars:
            print(f"   - {var}")
        print("\nPlease set these environment variables before running the setup.")
        return False
    
    print("✅ All required environment variables are set")
    return True

def check_dependencies():
    """Check if required Python packages are installed"""
    required_packages = [
        'weaviate-client',
        'openai'
    ]
    
    missing_packages = []
    for package in required_packages:
        try:
            __import__(package.replace('-', '_'))
        except ImportError:
            missing_packages.append(package)
    
    if missing_packages:
        print("❌ Missing required Python packages:")
        for package in missing_packages:
            print(f"   - {package}")
        print("\nInstalling missing packages...")
        
        for package in missing_packages:
            try:
                subprocess.check_call([sys.executable, '-m', 'pip', 'install', package])
                print(f"✅ Installed {package}")
            except subprocess.CalledProcessError:
                print(f"❌ Failed to install {package}")
                return False
    
    print("✅ All required packages are available")
    return True

def setup_training_data():
    """Set up and vectorize training data"""
    print("\n📚 Setting up training data...")
    
    # Check if vectorized data exists
    vectorized_file = Path("training-data/vectorized-training-data.json")
    
    if not vectorized_file.exists():
        print("Vectorized training data not found. Running vectorization...")
        
        # Run the vectorization script
        try:
            result = subprocess.run([
                sys.executable, 
                "training-data/vectorize-training-data.py"
            ], capture_output=True, text=True, cwd=".")
            
            if result.returncode == 0:
                print("✅ Training data vectorized successfully")
            else:
                print(f"❌ Vectorization failed: {result.stderr}")
                return False
        except Exception as e:
            print(f"❌ Error running vectorization: {e}")
            return False
    else:
        print("✅ Vectorized training data already exists")
    
    return True

def setup_weaviate_rag():
    """Set up Weaviate RAG system"""
    print("\n🔍 Setting up Weaviate RAG system...")
    
    try:
        # Run the Weaviate RAG setup script
        result = subprocess.run([
            sys.executable,
            "training-data/weaviate-rag-system.py"
        ], capture_output=True, text=True, cwd=".")
        
        if result.returncode == 0:
            print("✅ Weaviate RAG system set up successfully")
            print("Output:", result.stdout)
        else:
            print(f"❌ Weaviate setup failed: {result.stderr}")
            return False
    except Exception as e:
        print(f"❌ Error setting up Weaviate: {e}")
        return False
    
    return True

def create_environment_template():
    """Create environment template file"""
    print("\n📝 Creating environment template...")
    
    env_template = """# Weaviate Configuration
WEAVIATE_URL=https://your-cluster.weaviate.network
WEAVIATE_API_KEY=your-weaviate-api-key

# OpenAI Configuration  
OPENAI_API_KEY=your-openai-api-key

# Existing RSVP Application Environment Variables
DATABASE_URL=your-database-url
RESEND_API_KEY=your-resend-api-key
SENDGRID_API_KEY=your-sendgrid-api-key
LEADMINE_API_KEY=your-leadmine-api-key
LEADMINE_API_BASE=https://api.lead-mine.vercel.app

# Admin Configuration
ADMIN_USER=your-admin-username
ADMIN_PASSWORD_HASH=your-bcrypt-hash
ADMIN_SESSION_SECRET=your-session-secret

# Campaign Configuration
CAMPAIGN_EMAIL_BATCH_SIZE=50
CAMPAIGN_MIN_HOURS_BETWEEN_EMAILS=72
CAMPAIGN_LINK_BASE=https://rsvp.evergreenwebsolutions.ca/rsvp
CAMPAIGN_FROM_EMAIL=Evergreen AI <team@evergreen.ai>
CAMPAIGN_CRON_SECRET=your-cron-secret

# Event Configuration
EVENT_NAME=AI in Northern BC: Information Session
EVENT_DATE=2025-10-23
EVENT_START_TIME=18:00
EVENT_END_TIME=20:30
EVENT_TIMEZONE=America/Vancouver
VENUE_NAME=Sunshine Inn Terrace — Jasmine Room
VENUE_ADDRESS=4812 Hwy 16, Terrace, BC, Canada
VENUE_CAPACITY=50
ORGANIZER_NAME=Gabriel Lacroix
ORGANIZER_EMAIL=gabriel@evergreenwebsolutions.ca
ORGANIZER_COMPANY=Evergreen Web Solutions
RSVP_DEADLINE=2025-10-16
MAX_ATTENDEES=50
REQUIRES_APPROVAL=false
"""
    
    with open(".env.rag-template", "w") as f:
        f.write(env_template)
    
    print("✅ Environment template created: .env.rag-template")
    print("   Copy this to .env and fill in your actual values")

def create_setup_instructions():
    """Create comprehensive setup instructions"""
    print("\n📖 Creating setup instructions...")
    
    instructions = """# RAG System Setup Instructions

## Prerequisites

1. **Weaviate Cloud Account**
   - Sign up at https://weaviate.io/cloud
   - Create a new cluster
   - Get your cluster URL and API key

2. **OpenAI API Key**
   - Sign up at https://platform.openai.com
   - Generate an API key
   - Ensure you have credits available

3. **Python Environment**
   - Python 3.8+ required
   - pip package manager

## Setup Steps

### 1. Environment Configuration
```bash
# Copy the environment template
cp .env.rag-template .env

# Edit .env with your actual values
nano .env
```

### 2. Install Dependencies
```bash
# Install Python packages
pip install weaviate-client openai

# Install Node.js dependencies (if not already done)
npm install
```

### 3. Run Setup Script
```bash
# Run the comprehensive setup
python setup-rag-system.py
```

### 4. Verify Installation
```bash
# Test the RAG system
curl -X GET http://localhost:3000/api/ai-agent
```

## Usage

### AI Agent API Endpoints

1. **Chat with Juniper**
```bash
curl -X POST http://localhost:3000/api/ai-agent \\
  -H "Content-Type: application/json" \\
  -d '{"query": "How do I create a new campaign?", "action": "chat"}'
```

2. **Search Knowledge Base**
```bash
curl -X POST http://localhost:3000/api/ai-agent \\
  -H "Content-Type: application/json" \\
  -d '{"query": "RSVP form validation", "action": "search"}'
```

3. **Find Functionality**
```bash
curl -X POST http://localhost:3000/api/ai-agent \\
  -H "Content-Type: application/json" \\
  -d '{"query": "email sending", "action": "functionality"}'
```

4. **API Documentation**
```bash
curl -X POST http://localhost:3000/api/ai-agent \\
  -H "Content-Type: application/json" \\
  -d '{"query": "campaign API", "action": "api"}'
```

5. **Troubleshooting**
```bash
curl -X POST http://localhost:3000/api/ai-agent \\
  -H "Content-Type: application/json" \\
  -d '{"query": "email not sending", "action": "troubleshoot"}'
```

## RAG System Components

### Collections Created
1. **RSVPTrainingData** - Vectorized training examples with code snippets
2. **RSVPCodebase** - Extracted knowledge from source code
3. **EvergreenBrandContext** - Company and brand information
4. **RSVPProcesses** - Workflow and process documentation
5. **RSVPAPIs** - API endpoint documentation

### Training Data Categories
- Campaign Management (20 examples)
- Email Template Management (10 examples)
- Security Features (1 example)
- Admin Authentication (1 example)
- Audience Management (1 example)
- LeadMine Integration (1 example)
- Webhook Handling (1 example)
- Privacy & Compliance (1 example)
- Event Management (1 example)
- Form Validation (1 example)
- Middleware Features (1 example)
- Analytics & Tracking (1 example)
- Global Template System (3 examples)
- Email Sending System (2 examples)
- Complete Email System (2 examples)
- RSVP Data Management (2 examples)

## Troubleshooting

### Common Issues

1. **Weaviate Connection Failed**
   - Check WEAVIATE_URL and WEAVIATE_API_KEY
   - Ensure cluster is running
   - Verify network connectivity

2. **OpenAI API Error**
   - Check OPENAI_API_KEY
   - Verify API credits
   - Check rate limits

3. **Vectorization Failed**
   - Check training data files exist
   - Verify JSON format
   - Check file permissions

4. **RAG Search Returns No Results**
   - Verify collections are created
   - Check if data is indexed
   - Try different search terms

### Logs and Debugging

```bash
# Check application logs
tail -f server.log

# Test individual components
python training-data/vectorize-training-data.py
python training-data/weaviate-rag-system.py
```

## Next Steps

1. **Integrate with Admin Dashboard**
   - Add AI agent UI components
   - Create chat interface
   - Add command execution

2. **Fine-tune Responses**
   - Adjust prompt templates
   - Add more training data
   - Optimize search parameters

3. **Monitor Performance**
   - Track response times
   - Monitor API usage
   - Analyze user interactions

## Support

For issues or questions:
- Check the process documentation: `training-data/PROCESS_DOCUMENTATION.md`
- Review the vectorized data: `training-data/vectorized-training-data.json`
- Test individual components with the provided scripts
"""
    
    with open("RAG_SETUP_INSTRUCTIONS.md", "w") as f:
        f.write(instructions)
    
    print("✅ Setup instructions created: RAG_SETUP_INSTRUCTIONS.md")

def test_rag_system():
    """Test the RAG system functionality"""
    print("\n🧪 Testing RAG system...")
    
    try:
        # Test the AI agent health endpoint
        import requests
        
        response = requests.get("http://localhost:3000/api/ai-agent", timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            print("✅ RAG system health check passed")
            print(f"   Status: {data.get('status')}")
            print(f"   Collections: {data.get('collections', {})}")
        else:
            print(f"❌ Health check failed: {response.status_code}")
            return False
            
    except requests.exceptions.ConnectionError:
        print("⚠️  Cannot test RAG system - Next.js server not running")
        print("   Start the server with: npm run dev")
        return False
    except Exception as e:
        print(f"❌ Error testing RAG system: {e}")
        return False
    
    return True

def main():
    """Main setup function"""
    print("🚀 RSVP Application RAG System Setup")
    print("=" * 50)
    
    # Check prerequisites
    if not check_environment():
        return False
    
    if not check_dependencies():
        return False
    
    # Set up components
    if not setup_training_data():
        return False
    
    if not setup_weaviate_rag():
        return False
    
    # Create documentation
    create_environment_template()
    create_setup_instructions()
    
    # Test system
    test_rag_system()
    
    print("\n🎉 RAG System Setup Complete!")
    print("\nNext steps:")
    print("1. Review the setup instructions: RAG_SETUP_INSTRUCTIONS.md")
    print("2. Start your Next.js server: npm run dev")
    print("3. Test the AI agent: curl -X GET http://localhost:3000/api/ai-agent")
    print("4. Chat with Juniper through the admin dashboard")
    
    return True

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)


