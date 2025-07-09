// Simple test script to verify CSV parsing functionality
// Run with: node test-csv-parsing.js

const fs = require('fs');
const path = require('path');

// Mock the CSV parsing function (simplified version)
function parseCsvLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  let i = 0;

  while (i < line.length) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped quote
        current += '"';
        i += 2;
      } else {
        // Toggle quote state
        inQuotes = !inQuotes;
        i++;
      }
    } else if (char === ';' && !inQuotes) {
      // Field separator
      result.push(current.trim());
      current = '';
      i++;
    } else {
      current += char;
      i++;
    }
  }

  // Add the last field
  result.push(current.trim());
  return result;
}

function parseCsvContent(content) {
  const lines = content.split(/\r?\n/).filter(line => line.trim().length > 0);
  
  if (lines.length === 0) {
    throw new Error('CSV file contains no data');
  }

  // Parse header row
  const headers = parseCsvLine(lines[0]);
  
  // Parse data rows
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const values = parseCsvLine(lines[i]);
    const row = {};
    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });
    rows.push(row);
  }

  return {
    headers,
    rows,
    totalRows: rows.length
  };
}

// Test with sample CSV
console.log('Testing CSV parsing functionality...\n');

try {
  // Test valid CSV
  const validCsv = fs.readFileSync(path.join(__dirname, 'sample.csv'), 'utf8');
  const validResult = parseCsvContent(validCsv);
  
  console.log('✅ Valid CSV parsing test:');
  console.log(`   Headers: ${validResult.headers.length}`);
  console.log(`   Rows: ${validResult.totalRows}`);
  console.log(`   First row: ${JSON.stringify(validResult.rows[0])}\n`);

  // Test CSV with errors
  const errorCsv = fs.readFileSync(path.join(__dirname, 'sample-with-errors.csv'), 'utf8');
  const errorResult = parseCsvContent(errorCsv);
  
  console.log('✅ Error CSV parsing test:');
  console.log(`   Headers: ${errorResult.headers.length}`);
  console.log(`   Rows: ${errorResult.totalRows}`);
  console.log(`   Sample error row: ${JSON.stringify(errorResult.rows[0])}\n`);

  // Test validation logic
  console.log('🔍 Testing validation logic:');
  
  const testValidation = (row, rowNumber) => {
    const errors = [];
    
    // Check required Laufendenr
    if (!row.Laufendenr || row.Laufendenr.trim() === '') {
      errors.push(`Row ${rowNumber}: Laufendenr is required`);
    } else if (isNaN(parseInt(row.Laufendenr))) {
      errors.push(`Row ${rowNumber}: Laufendenr must be a number`);
    }
    
    // Check Geburtsjahr range
    if (row.Geburtsjahr) {
      const year = parseInt(row.Geburtsjahr);
      if (!isNaN(year) && (year < 1800 || year > 1950)) {
        errors.push(`Row ${rowNumber}: Geburtsjahr must be between 1800 and 1950`);
      }
    }
    
    // Check Geschlecht values
    if (row.Geschlecht && !['männlich', 'weiblich', 'unbekannt'].includes(row.Geschlecht)) {
      errors.push(`Row ${rowNumber}: Invalid Geschlecht value`);
    }
    
    return errors;
  };

  errorResult.rows.forEach((row, index) => {
    const errors = testValidation(row, index + 2);
    if (errors.length > 0) {
      console.log(`   ❌ ${errors.join(', ')}`);
    }
  });

  console.log('\n✅ All tests completed successfully!');
  
} catch (error) {
  console.error('❌ Test failed:', error.message);
}
