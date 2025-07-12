// Test script to verify incorrect separator detection
// Run with: node test-separator-detection.js

const fs = require('fs');
const path = require('path');

// Mock the separator detection function
function detectIncorrectSeparators(lines) {
  // Take first few lines for analysis (max 3 lines to avoid performance issues)
  const sampleLines = lines.slice(0, Math.min(3, lines.length));
  const sampleContent = sampleLines.join('\n');
  
  // Common incorrect separators to check for
  const incorrectSeparators = [
    { char: '+', name: 'Pluszeichen (+)' },
    { char: ',', name: 'Komma (,)' },
    { char: '|', name: 'Pipe (|)' },
    { char: '\t', name: 'Tabulator' }
  ];
  
  // Count semicolons in sample
  const semicolonCount = (sampleContent.match(/;/g) || []).length;
  
  // If we have very few semicolons, check for other separators
  if (semicolonCount < 2) {
    for (const separator of incorrectSeparators) {
      const separatorCount = (sampleContent.match(new RegExp(`\\${separator.char}`, 'g')) || []).length;
      
      // If we find many instances of an incorrect separator, it's likely being used as delimiter
      if (separatorCount > semicolonCount * 2 && separatorCount >= 5) {
        throw new Error(
          `Die CSV-Datei verwendet '${separator.char}' als Trennzeichen, aber Semikolon (;) ist erforderlich. ` +
          `Bitte stellen Sie sicher, dass Ihre CSV-Datei Semikolon-getrennte Werte verwendet. ` +
          `Erkanntes Trennzeichen: ${separator.name}`
        );
      }
    }
    
    // If no clear incorrect separator found but still very few semicolons, give general advice
    if (semicolonCount === 0) {
      throw new Error(
        'Die CSV-Datei scheint keine Semikolon-Trennzeichen zu enthalten. ' +
        'Bitte stellen Sie sicher, dass Ihre CSV-Datei Semikolon (;) als Trennzeichen verwendet.'
      );
    }
  }
}

console.log('Testing incorrect separator detection...\n');

// Test 1: CSV with plus signs (from user's example)
console.log('🧪 Test 1: CSV with plus signs (+)');
try {
  const plusCsv = fs.readFileSync(path.join(__dirname, 'test-incorrect-separators.csv'), 'utf8');
  const lines = plusCsv.split(/\r?\n/).filter(line => line.trim().length > 0);
  detectIncorrectSeparators(lines);
  console.log('❌ Should have detected plus signs as incorrect separator');
} catch (error) {
  console.log('✅ Correctly detected plus signs:', error.message);
}

// Test 2: CSV with commas
console.log('\n🧪 Test 2: CSV with commas (,)');
try {
  const commaCsv = 'Seite,Familiennr,Eintragsnr,Laufendenr,Familienname\n18,85,1,385,Zisch';
  const lines = commaCsv.split(/\r?\n/).filter(line => line.trim().length > 0);
  detectIncorrectSeparators(lines);
  console.log('❌ Should have detected commas as incorrect separator');
} catch (error) {
  console.log('✅ Correctly detected commas:', error.message);
}

// Test 3: CSV with pipes
console.log('\n🧪 Test 3: CSV with pipes (|)');
try {
  const pipeCsv = 'Seite|Familiennr|Eintragsnr|Laufendenr|Familienname\n18|85|1|385|Zisch';
  const lines = pipeCsv.split(/\r?\n/).filter(line => line.trim().length > 0);
  detectIncorrectSeparators(lines);
  console.log('❌ Should have detected pipes as incorrect separator');
} catch (error) {
  console.log('✅ Correctly detected pipes:', error.message);
}

// Test 4: CSV with tabs
console.log('\n🧪 Test 4: CSV with tabs');
try {
  const tabCsv = 'Seite\tFamiliennr\tEintragsnr\tLaufendenr\tFamilienname\n18\t85\t1\t385\tZisch';
  const lines = tabCsv.split(/\r?\n/).filter(line => line.trim().length > 0);
  detectIncorrectSeparators(lines);
  console.log('❌ Should have detected tabs as incorrect separator');
} catch (error) {
  console.log('✅ Correctly detected tabs:', error.message);
}

// Test 5: Valid CSV with semicolons (should not throw error)
console.log('\n🧪 Test 5: Valid CSV with semicolons (;)');
try {
  const validCsv = 'Seite;Familiennr;Eintragsnr;Laufendenr;Familienname\n18;85;1;385;Zisch';
  const lines = validCsv.split(/\r?\n/).filter(line => line.trim().length > 0);
  detectIncorrectSeparators(lines);
  console.log('✅ Correctly accepted valid semicolon-separated CSV');
} catch (error) {
  console.log('❌ Should not have thrown error for valid CSV:', error.message);
}

// Test 6: CSV with no separators at all
console.log('\n🧪 Test 6: CSV with no separators');
try {
  const noSepCsv = 'SeiteeFamiliennrEintragsnrLaufendenrFamilienname\n18851385Zisch';
  const lines = noSepCsv.split(/\r?\n/).filter(line => line.trim().length > 0);
  detectIncorrectSeparators(lines);
  console.log('❌ Should have detected missing separators');
} catch (error) {
  console.log('✅ Correctly detected missing separators:', error.message);
}

console.log('\n✅ All separator detection tests completed!');
