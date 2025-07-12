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
        reject(new Error(`Fehler beim Parsen der CSV-Datei: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}`));
      }
    };

    reader.onerror = () => {
      reject(new Error('Fehler beim Lesen der Datei'));
    };
    
    // Read as UTF-8 text
    reader.readAsText(file, 'UTF-8');
  });
}

/**
 * Detects if CSV content uses incorrect separators instead of semicolon
 */
function detectIncorrectSeparators(lines: string[]): void {
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

/**
 * Parses CSV content string with semicolon separator
 */
export function parseCsvContent(content: string): ParsedCsvData {
  if (!content || content.trim().length === 0) {
    throw new Error('Die CSV-Datei ist leer');
  }

  const lines = content.split(/\r?\n/).filter(line => line.trim().length > 0);

  if (lines.length === 0) {
    throw new Error('Die CSV-Datei enthält keine Daten');
  }

  // Check for incorrect separators before parsing
  detectIncorrectSeparators(lines);

  // Parse header row
  const headerLine = lines[0];
  const headers = parseCsvLine(headerLine);

  if (headers.length === 0) {
    throw new Error('Die CSV-Datei hat keine Spaltenüberschriften');
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
      errors.push(`Zeile ${i + 1}: ${error instanceof Error ? error.message : 'Parsing-Fehler'}`);
    }
  }

  if (errors.length > 0) {
    throw new Error(`CSV-Parsing-Fehler:\n${errors.join('\n')}`);
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
    throw new Error(`Fehlende erforderliche Spaltenüberschriften: ${missingHeaders.join(', ')}`);
  }

  // Check for unexpected headers
  const unexpectedHeaders = normalizedHeaders.filter(header =>
    !EXPECTED_CSV_HEADERS.includes(header as any) && header !== ''
  );

  if (unexpectedHeaders.length > 0) {
    console.warn(`Unerwartete Spaltenüberschriften gefunden (werden ignoriert): ${unexpectedHeaders.join(', ')}`);
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
    return { isValid: false, error: 'Die Datei muss eine CSV-Datei sein (.csv-Erweiterung)' };
  }

  // Check file size (max 10MB)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    return { isValid: false, error: 'Die Dateigröße muss weniger als 10MB betragen' };
  }

  // Check if file is empty
  if (file.size === 0) {
    return { isValid: false, error: 'Die Datei ist leer' };
  }

  return { isValid: true };
}
