require('dotenv').config({ path: '.env.local' });
const fs = require('fs');

// Read the duplicate analysis file
const data = JSON.parse(fs.readFileSync('duplicate-emails-analysis.json', 'utf8'));

console.log('📧 Businesses that received 6 emails:');
console.log('='.repeat(60));

let count = 0;
Object.keys(data.duplicates).forEach(email => {
  if (data.duplicates[email].length === 6) {
    count++;
    console.log(`${count}. ${email}`);
    console.log(`   Total emails: ${data.duplicates[email].length}`);
    console.log(`   First sent: ${data.duplicates[email][data.duplicates[email].length - 1].sentAt}`);
    console.log(`   Last sent: ${data.duplicates[email][0].sentAt}`);
    console.log(`   All from same campaign: ${data.duplicates[email][0].campaignId}`);
    console.log(`   All from same template: ${data.duplicates[email][0].templateId}`);
    console.log('');
  }
});

console.log(`\n📊 Summary: ${count} businesses received exactly 6 emails each`);

// Also show businesses that received 5 emails
console.log('\n📧 Businesses that received 5 emails:');
console.log('='.repeat(60));

count = 0;
Object.keys(data.duplicates).forEach(email => {
  if (data.duplicates[email].length === 5) {
    count++;
    console.log(`${count}. ${email}`);
  }
});

console.log(`\n📊 Summary: ${count} businesses received exactly 5 emails each`);

