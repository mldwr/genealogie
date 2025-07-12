// Script to create test Excel files for testing the Excel import functionality
// Run with: node create-test-excel.js

const XLSX = require('xlsx');

// Test data matching the expected CSV format
const testData = [
  // Header row
  ['Seite', 'Familiennr', 'Eintragsnr', 'Laufendenr', 'Familienname', 'Vorname', 'Vatersname', 'Familienrolle', 'Geschlecht', 'Geburtsjahr', 'Geburtsort', 'Arbeitsort'],
  // Data rows
  [1, 1, 1, 1001, 'Mustermann', 'Max', 'Johann', 'Vater', 'männlich', 1900, 'Berlin', 'Hamburg'],
  [1, 1, 2, 1002, 'Mustermann', 'Maria', 'Wilhelm', 'Mutter', 'weiblich', 1905, 'München', 'Hamburg'],
  [1, 1, 3, 1003, 'Mustermann', 'Hans', 'Max', 'Sohn', 'männlich', 1925, 'Hamburg', 'Hamburg'],
  [2, 2, 1, 1004, 'Schmidt', 'Anna', 'Friedrich', 'Mutter', 'weiblich', 1910, 'Dresden', 'Leipzig'],
  [2, 2, 2, 1005, 'Schmidt', 'Peter', 'Karl', 'Sohn', 'männlich', 1930, 'Leipzig', 'Leipzig']
];

// Test data with errors for validation testing
const testDataWithErrors = [
  // Header row
  ['Seite', 'Familiennr', 'Eintragsnr', 'Laufendenr', 'Familienname', 'Vorname', 'Vatersname', 'Familienrolle', 'Geschlecht', 'Geburtsjahr', 'Geburtsort', 'Arbeitsort'],
  // Data rows with various errors
  [1, 1, 1, 1001, 'Mustermann', 'Max', 'Johann', 'Vater', 'männlich', 1900, 'Berlin', 'Hamburg'], // Valid
  ['', '', '', '', '', '', '', '', '', '', '', ''], // Empty row (should be skipped)
  [2, 2, 1, '', 'Schmidt', 'Anna', 'Friedrich', 'Mutter', 'weiblich', 1910, 'Dresden', 'Leipzig'], // Missing Laufendenr (required)
  [3, 3, 1, 1003, 'Weber', 'Karl', 'Heinrich', 'InvalidRole', 'männlich', 1800, 'Köln', 'Düsseldorf'], // Invalid Familienrolle
  [4, 4, 1, 1004, 'Müller', 'Lisa', 'Otto', 'Tochter', 'invalid_gender', 2000, 'Frankfurt', 'Mainz'] // Invalid Geschlecht and year
];

function createExcelFile(data, filename) {
  // Create a new workbook
  const workbook = XLSX.utils.book_new();
  
  // Create worksheet from data
  const worksheet = XLSX.utils.aoa_to_sheet(data);
  
  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Deportierte Personen');
  
  // Write file
  XLSX.writeFile(workbook, filename);
  console.log(`Created ${filename}`);
}

function createMultiSheetExcelFile() {
  // Create a new workbook
  const workbook = XLSX.utils.book_new();
  
  // Create first worksheet with valid data
  const worksheet1 = XLSX.utils.aoa_to_sheet(testData);
  XLSX.utils.book_append_sheet(workbook, worksheet1, 'Deportierte Personen');
  
  // Create second worksheet with different data
  const worksheet2 = XLSX.utils.aoa_to_sheet([
    ['Info', 'Wert'],
    ['Erstellt am', new Date().toISOString()],
    ['Anzahl Datensätze', testData.length - 1],
    ['Hinweis', 'Dies ist ein Test-Arbeitsblatt']
  ]);
  XLSX.utils.book_append_sheet(workbook, worksheet2, 'Metadaten');
  
  // Write file
  const filename = 'test-multi-sheet.xlsx';
  XLSX.writeFile(workbook, filename);
  console.log(`Created ${filename} with multiple sheets`);
}

// Create test files
try {
  console.log('Creating test Excel files...');
  
  // Valid test data
  createExcelFile(testData, 'test-valid-data.xlsx');
  
  // Test data with errors
  createExcelFile(testDataWithErrors, 'test-with-errors.xlsx');
  
  // Multi-sheet file
  createMultiSheetExcelFile();
  
  // Create empty file for testing
  const emptyWorkbook = XLSX.utils.book_new();
  const emptyWorksheet = XLSX.utils.aoa_to_sheet([]);
  XLSX.utils.book_append_sheet(emptyWorkbook, emptyWorksheet, 'Empty');
  XLSX.writeFile(emptyWorkbook, 'test-empty.xlsx');
  console.log('Created test-empty.xlsx');
  
  console.log('\nTest files created successfully!');
  console.log('Files created:');
  console.log('- test-valid-data.xlsx (valid test data)');
  console.log('- test-with-errors.xlsx (data with validation errors)');
  console.log('- test-multi-sheet.xlsx (multiple sheets)');
  console.log('- test-empty.xlsx (empty file for error testing)');
  
} catch (error) {
  console.error('Error creating test files:', error);
}
