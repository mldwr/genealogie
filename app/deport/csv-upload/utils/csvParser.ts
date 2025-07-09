// CSV parsing utilities for deported persons data

import { ParsedCsvData, CsvRow, EXPECTED_CSV_HEADERS } from '../types/csvTypes';

/**
 * Parses CSV file content with semicolon separator and UTF-8 encoding
 */
export async function parseCsvFile(file: File): Promise<ParsedCsvData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = parseCsvContent(content);
        resolve(parsed);
      } catch (error) {
        reject(new Error(`Failed to parse CSV file: ${error instanceof Error ? error.message : 'Unknown error'}`));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    // Read as UTF-8 text
    reader.readAsText(file, 'UTF-8');
  });
}

/**
 * Parses CSV content string with semicolon separator
 */
export function parseCsvContent(content: string): ParsedCsvData {
  if (!content || content.trim().length === 0) {
    throw new Error('CSV file is empty');
  }

  const lines = content.split(/\r?\n/).filter(line => line.trim().length > 0);
  
  if (lines.length === 0) {
    throw new Error('CSV file contains no data');
  }

  // Parse header row
  const headerLine = lines[0];
  const headers = parseCsvLine(headerLine);
  
  if (headers.length === 0) {
    throw new Error('CSV file has no headers');
  }

  // Validate headers match expected format
  validateHeaders(headers);

  // Parse data rows
  const rows: CsvRow[] = [];
  const errors: string[] = [];

  for (let i = 1; i < lines.length; i++) {
    try {
      const values = parseCsvLine(lines[i]);
      
      // Skip empty rows
      if (values.every(val => val.trim() === '')) {
        continue;
      }
      
      // Create row object
      const row: CsvRow = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      
      rows.push(row);
    } catch (error) {
      errors.push(`Row ${i + 1}: ${error instanceof Error ? error.message : 'Parse error'}`);
    }
  }

  if (errors.length > 0) {
    throw new Error(`CSV parsing errors:\n${errors.join('\n')}`);
  }

  return {
    headers,
    rows,
    totalRows: rows.length
  };
}

/**
 * Parses a single CSV line with semicolon separator, handling quoted values
 */
function parseCsvLine(line: string): string[] {
  const result: string[] = [];
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

/**
 * Validates that CSV headers match expected format
 */
function validateHeaders(headers: string[]): void {
  const normalizedHeaders = headers.map(h => h.trim());
  
  // Check for required headers
  const missingHeaders = EXPECTED_CSV_HEADERS.filter(expected => 
    !normalizedHeaders.includes(expected)
  );

  if (missingHeaders.length > 0) {
    throw new Error(`Missing required headers: ${missingHeaders.join(', ')}`);
  }

  // Check for unexpected headers
  const unexpectedHeaders = normalizedHeaders.filter(header => 
    !EXPECTED_CSV_HEADERS.includes(header as any) && header !== ''
  );

  if (unexpectedHeaders.length > 0) {
    console.warn(`Unexpected headers found (will be ignored): ${unexpectedHeaders.join(', ')}`);
  }
}

/**
 * Generates CSV template content for download
 */
export function generateCsvTemplate(): string {
  const headers = EXPECTED_CSV_HEADERS.join(';');
  const exampleRow = [
    '1',           // Seite
    '1',           // Familiennr
    '1',           // Eintragsnr
    '1',           // Laufendenr
    'Mustermann',  // Familienname
    'Max',         // Vorname
    'Johann',      // Vatersname
    'Vater',       // Familienrolle
    'männlich',    // Geschlecht
    '1900',        // Geburtsjahr
    'Berlin',      // Geburtsort
    'Hamburg'      // Arbeitsort
  ].join(';');

  return `${headers}\n${exampleRow}`;
}

/**
 * Creates and downloads CSV template file
 */
export function downloadCsvTemplate(): void {
  const content = generateCsvTemplate();
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = 'deportierte_personen_template.csv';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}

/**
 * Validates CSV file format and size
 */
export function validateCsvFile(file: File): { isValid: boolean; error?: string } {
  // Check file type
  if (!file.name.toLowerCase().endsWith('.csv')) {
    return { isValid: false, error: 'File must be a CSV file (.csv extension)' };
  }

  // Check file size (max 10MB)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    return { isValid: false, error: 'File size must be less than 10MB' };
  }

  // Check if file is empty
  if (file.size === 0) {
    return { isValid: false, error: 'File is empty' };
  }

  return { isValid: true };
}
