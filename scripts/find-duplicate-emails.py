#!/usr/bin/env python3
"""
Find all businesses that already received emails by comparing sent emails with registry
"""

import pandas as pd
import json
import subprocess
import sys
from pathlib import Path

def get_sent_emails_from_db():
    """Get all sent emails from the database using Node.js"""
    try:
        # Create a Node.js script to get sent emails
        node_script = """
        const { PrismaClient } = require('@prisma/client');
        const prisma = new PrismaClient();
        
        async function getSentEmails() {
            try {
                const sentEmails = await prisma.emailJob.findMany({
                    where: { status: 'sent' },
                    select: { recipientEmail: true }
                });
                
                const realSentEmails = sentEmails.filter(email => 
                    !email.recipientEmail.includes('greenalderson@gmail.com') &&
                    !email.recipientEmail.includes('example.com') &&
                    !email.recipientEmail.includes('test')
                );
                
                const uniqueSentEmails = [...new Set(realSentEmails.map(e => e.recipientEmail))];
                console.log(JSON.stringify(uniqueSentEmails));
                
            } catch (error) {
                console.error('Error:', error);
            } finally {
                await prisma.$disconnect();
            }
        }
        
        getSentEmails();
        """
        
        # Write the script to a temporary file
        with open('/tmp/get_sent_emails.js', 'w') as f:
            f.write(node_script)
        
        # Run the script
        result = subprocess.run(['node', '/tmp/get_sent_emails.js'], 
                              capture_output=True, text=True, cwd='/Users/main/Desktop/evergreen/RSVP/rsvp-app')
        
        if result.returncode == 0:
            sent_emails = json.loads(result.stdout.strip())
            return set(email.lower() for email in sent_emails)
        else:
            print(f"Error getting sent emails: {result.stderr}")
            return set()
            
    except Exception as e:
        print(f"Error: {e}")
        return set()

def main():
    print("=== FINDING DUPLICATE EMAILS ===")
    
    # Get sent emails from database
    print("📊 Getting sent emails from database...")
    sent_emails = get_sent_emails_from_db()
    print(f"📊 Found {len(sent_emails)} unique sent emails")
    
    # Read the official registry
    registry_path = Path(__file__).parent.parent / "lead-mine" / "Active-Business-Licences-with-email  - June 18, 2025.xlsx"
    
    try:
        df = pd.read_excel(registry_path)
        registry_emails = set(df['Contact Email'].dropna().str.lower())
        print(f"📊 Registry has {len(registry_emails)} unique emails")
        
    except Exception as e:
        print(f"❌ Error reading registry: {e}")
        return
    
    # Find matches
    matches = sent_emails.intersection(registry_emails)
    print(f"\n🚨 CRITICAL: Found {len(matches)} businesses that already received emails!")
    
    if matches:
        print("\n📧 Businesses that already received emails:")
        for email in sorted(matches):
            print(f"  - {email}")
    
    # Find businesses that haven't received emails yet
    remaining_emails = registry_emails - sent_emails
    print(f"\n✅ Businesses that haven't received emails yet: {len(remaining_emails)}")
    
    if remaining_emails:
        print("\n📧 Sample businesses we can still email:")
        for email in sorted(list(remaining_emails))[:10]:
            print(f"  - {email}")
    
    print(f"\n📊 SUMMARY:")
    print(f"📊 Total registry businesses: {len(registry_emails)}")
    print(f"📊 Already sent emails: {len(matches)}")
    print(f"📊 Can still send emails: {len(remaining_emails)}")
    
    if len(matches) > 0:
        print(f"\n⚠️  WARNING: We cannot send duplicate emails to {len(matches)} businesses!")
        print("📊 We can only send to the remaining businesses that haven't received emails yet")
    
    # Save the results
    results = {
        'already_sent': list(matches),
        'can_send': list(remaining_emails),
        'total_registry': len(registry_emails),
        'already_sent_count': len(matches),
        'can_send_count': len(remaining_emails)
    }
    
    with open('/tmp/email_comparison_results.json', 'w') as f:
        json.dump(results, f, indent=2)
    
    print(f"\n💾 Results saved to /tmp/email_comparison_results.json")

if __name__ == "__main__":
    main()

