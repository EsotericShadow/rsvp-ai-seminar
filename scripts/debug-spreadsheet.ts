import * as XLSX from 'xlsx';
import * as path from 'path';

async function debugSpreadsheet() {
  try {
    console.log('🔍 Debugging spreadsheet structure...');

    // Read the Excel file
    const excelPath = path.join(process.cwd(), 'lead-mine', 'Active-Business-Licences-with-email  - June 18, 2025.xlsx');
    console.log(`Reading Excel file: ${excelPath}`);
    
    const workbook = XLSX.readFile(excelPath);
    console.log(`📊 Sheet names: ${workbook.SheetNames.join(', ')}`);
    
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Convert to JSON
    const jsonData = XLSX.utils.sheet_to_json(worksheet);
    console.log(`📋 Total rows: ${jsonData.length}`);
    
    // Show first few rows to understand structure
    console.log('\n📝 First 3 rows:');
    for (let i = 0; i < Math.min(3, jsonData.length); i++) {
      console.log(`\nRow ${i + 1}:`);
      const row = jsonData[i] as Record<string, any>;
      Object.keys(row).forEach(key => {
        console.log(`  ${key}: ${row[key]}`);
      });
    }
    
    // Show all column names
    console.log('\n📋 All column names:');
    if (jsonData.length > 0) {
      const firstRow = jsonData[0] as Record<string, any>;
      Object.keys(firstRow).forEach((key, index) => {
        console.log(`  ${index + 1}. "${key}"`);
      });
    }
    
    // Count non-empty emails and business names
    let emailCount = 0;
    let businessNameCount = 0;
    let validEmails = 0;
    
    jsonData.forEach(row => {
      const typedRow = row as Record<string, any>;
      const businessName = typedRow['Business Name'] || typedRow['Name'] || typedRow['Company'] || typedRow['Business'] || '';
      const email = typedRow['Email'] || typedRow['Primary Email'] || typedRow['Contact Email'] || typedRow['E-mail'] || '';
      
      if (businessName && businessName.trim()) businessNameCount++;
      if (email && email.trim()) emailCount++;
      
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (email && emailRegex.test(email)) validEmails++;
    });
    
    console.log('\n📊 Statistics:');
    console.log(`  Business names found: ${businessNameCount}`);
    console.log(`  Emails found: ${emailCount}`);
    console.log(`  Valid emails: ${validEmails}`);

  } catch (error) {
    console.error('❌ Error debugging spreadsheet:', error);
  }
}

// Run the debug
debugSpreadsheet();
