// CSV parsing utilities for deported persons data
// Enforces semicolon (;) separator requirement with German error messages

import { ParsedCsvData, CsvRow, EXPECTED_CSV_HEADERS, SeparatorDetectionResult } from '../types/csvTypes';

// CSV separators for detection (semicolon is required, others are detected to provide helpful error messages)
const SUPPORTED_SEPARATORS = [
  { char: ';', name: 'Semikolon (;)' },
  { char: ',', name: 'Komma (,)' },
  { char: '|', name: 'Pipe (|)' },
  { char: '\t', name: 'Tabulator' }
] as const;

/**
 * Automatically detects the CSV separator by analyzing the header row
 */
function detectCsvSeparator(headerLine: string): SeparatorDetectionResult {
  let bestSeparator: typeof SUPPORTED_SEPARATORS[number] = SUPPORTED_SEPARATORS[0]; // Default to semicolon
  let bestScore = 0;

  for (const separator of SUPPORTED_SEPARATORS) {
    // Parse the header line with this separator
    const fields = parseCsvLineWithSeparator(headerLine, separator.char);

    // Count how many fields match our expected headers
    const matchingFields = fields.filter((field: string) =>
      EXPECTED_CSV_HEADERS.includes(field.trim() as any)
    ).length;

    // Calculate score: number of matching fields
    const score = matchingFields;

    // Prefer this separator if it produces more matching fields
    if (score > bestScore) {
      bestScore = score;
      bestSeparator = separator;
    }
  }

  // Calculate confidence as percentage of expected headers found
  const confidence = Math.round((bestScore / EXPECTED_CSV_HEADERS.length) * 100);

  return {
    separator: bestSeparator.char,
    name: bestSeparator.name,
    confidence
  };
}

/**
 * Parses a single CSV line with a specified separator, handling quoted values
 */
function parseCsvLineWithSeparator(line: string, separator: string): string[] {
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
    } else if (char === separator && !inQuotes) {
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
 * Parses CSV file content with semicolon separator validation and UTF-8 encoding
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
        // Pass through separator validation errors directly without wrapping
        if (error instanceof Error && error.message.includes('Trennzeichen')) {
          reject(error);
        } else {
          reject(new Error(`Fehler beim Parsen der CSV-Datei: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}`));
        }
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
 * Parses CSV content string with semicolon separator validation
 */
export function parseCsvContent(content: string): ParsedCsvData {
  if (!content || content.trim().length === 0) {
    throw new Error('Die CSV-Datei ist leer');
  }

  const lines = content.split(/\r?\n/).filter(line => line.trim().length > 0);

  if (lines.length === 0) {
    throw new Error('Die CSV-Datei enthält keine Daten');
  }

  // Detect the CSV separator automatically
  const headerLine = lines[0];
  const separatorResult = detectCsvSeparator(headerLine);

  // Validate that semicolon is used as separator
  validateSeparatorRequirement(separatorResult);

  // Parse header row with detected separator
  const headers = parseCsvLineWithSeparator(headerLine, separatorResult.separator);

  if (headers.length === 0) {
    throw new Error('Die CSV-Datei hat keine Spaltenüberschriften');
  }

  // Validate headers match expected format
  validateHeaders(headers);

  // Parse data rows with detected separator
  const rows: CsvRow[] = [];
  const errors: string[] = [];

  for (let i = 1; i < lines.length; i++) {
    try {
      const values = parseCsvLineWithSeparator(lines[i], separatorResult.separator);

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
 * Validates that semicolon separator is used and provides specific German error messages
 */
function validateSeparatorRequirement(separatorResult: SeparatorDetectionResult): void {
  // Check if confidence is too low to reliably detect separator
  if (separatorResult.confidence < 50) {
    throw new Error(
      `Das Trennzeichen in der CSV-Datei konnte nicht eindeutig erkannt werden (Konfidenz: ${separatorResult.confidence}%). ` +
      'Bitte stellen Sie sicher, dass Ihre CSV-Datei Semikolons (;) als Trennzeichen verwendet und ' +
      'die Spaltenüberschriften korrekt formatiert sind. Laden Sie die Datei anschließend erneut hoch.'
    );
  }

  // Check if detected separator is not semicolon
  if (separatorResult.separator !== ';') {
    let separatorName: string;
    let suggestion: string;

    switch (separatorResult.separator) {
      case ',':
        separatorName = 'Kommas (,)';
        suggestion = 'Öffnen Sie die CSV-Datei in einem Texteditor oder Excel und ersetzen Sie alle Kommas durch Semikolons, oder speichern Sie die Datei mit Semikolon als Trennzeichen.';
        break;
      case '\t':
        separatorName = 'Tabulatoren';
        suggestion = 'Öffnen Sie die CSV-Datei in einem Texteditor oder Excel und ersetzen Sie alle Tabulatoren durch Semikolons, oder speichern Sie die Datei mit Semikolon als Trennzeichen.';
        break;
      case '|':
        separatorName = 'Pipe-Zeichen (|)';
        suggestion = 'Öffnen Sie die CSV-Datei in einem Texteditor und ersetzen Sie alle Pipe-Zeichen durch Semikolons.';
        break;
      default:
        separatorName = `"${separatorResult.separator}"`;
        suggestion = 'Öffnen Sie die CSV-Datei in einem Texteditor und stellen Sie sicher, dass Semikolons (;) als Trennzeichen verwendet werden.';
    }

    throw new Error(
      `Die CSV-Datei verwendet ${separatorName} als Trennzeichen. ` +
      'Für diese Anwendung sind Semikolons (;) als Trennzeichen erforderlich.\n\n' +
      `Lösung: ${suggestion}\n\n` +
      'Laden Sie die korrigierte Datei anschließend erneut hoch.'
    );
  }
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
 * Detects the separator used in a CSV file content
 * This function can be used to preview separator detection before parsing
 */
export function detectSeparatorFromContent(content: string): SeparatorDetectionResult {
  if (!content || content.trim().length === 0) {
    throw new Error('Der Inhalt ist leer');
  }

  const lines = content.split(/\r?\n/).filter(line => line.trim().length > 0);

  if (lines.length === 0) {
    throw new Error('Keine Daten gefunden');
  }

  return detectCsvSeparator(lines[0]);
}

/**
 * Generates CSV template content for download
 * Note: The parser requires semicolon (;) separators - other separators will be rejected
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
