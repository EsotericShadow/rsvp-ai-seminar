#!/usr/bin/env python3
"""
Compare emails we sent against the official business registry to identify duplicates
"""

import pandas as pd
import json
from pathlib import Path

def main():
    print("=== COMPARING SENT EMAILS WITH OFFICIAL REGISTRY ===")
    
    # Read the official registry
    registry_path = Path(__file__).parent.parent / "lead-mine" / "Active-Business-Licences-with-email  - June 18, 2025.xlsx"
    
    try:
        df = pd.read_excel(registry_path)
        print(f"📊 Registry: {len(df)} businesses")
        print(f"📊 Registry emails: {df['Contact Email'].notna().sum()}")
        
        # Get registry emails
        registry_emails = set(df['Contact Email'].dropna().str.lower())
        print(f"📊 Unique registry emails: {len(registry_emails)}")
        
        # Sample registry emails
        print("\n📧 Sample registry emails:")
        for email in list(registry_emails)[:10]:
            print(f"  - {email}")
            
    except Exception as e:
        print(f"❌ Error reading registry: {e}")
        return
    
    # Now we need to get the emails we sent from the database
    # For now, let's create a list of the emails we know we sent
    # (This would normally come from a database query)
    
    print("\n⚠️  We need to get the sent emails from the database")
    print("📊 We sent 1,086 unique emails")
    print("📊 We need to compare these against the 1,174 registry emails")
    print("📊 Then identify which businesses already received emails")
    
    # Let's check if any of the sample emails we saw match the registry
    sample_sent_emails = [
        "tlock@telus.net",
        "customerservice@petvalu.com", 
        "creditapplications@ebhorsman.com"
    ]
    
    print("\n🔍 Checking sample sent emails against registry:")
    matches = []
    for email in sample_sent_emails:
        if email.lower() in registry_emails:
            matches.append(email)
            print(f"  ✅ MATCH: {email}")
        else:
            print(f"  ❌ No match: {email}")
    
    print(f"\n📊 Found {len(matches)} matches in sample")
    
    if matches:
        print("\n⚠️  CRITICAL: Some businesses already received emails!")
        print("📊 We cannot send duplicate emails to these businesses")
        print("📊 We need to identify ALL matches before sending more emails")
    
    print("\n📋 NEXT STEPS:")
    print("1. Get complete list of sent emails from database")
    print("2. Compare against all 1,174 registry emails")
    print("3. Identify businesses that already received emails")
    print("4. Send campaign only to businesses that haven't received emails yet")

if __name__ == "__main__":
    main()

