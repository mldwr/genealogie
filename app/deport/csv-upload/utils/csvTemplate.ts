// CSV template generation utilities

import { EXPECTED_CSV_HEADERS, FIELD_VALIDATION_RULES } from '../types/csvTypes';

/**
 * Generates a comprehensive CSV template with headers, example data, and documentation
 */
export function generateDetailedCsvTemplate(): string {
  const lines: string[] = [];
  
  // Add header row
  lines.push(EXPECTED_CSV_HEADERS.join(';'));
  
  // Add example rows with realistic data
  const exampleRows = [
    [
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
    ],
    [
      '1',           // Seite
      '1',           // Familiennr
      '2',           // Eintragsnr
      '2',           // Laufendenr
      'Mustermann',  // Familienname
      'Anna',        // Vorname
      '',            // Vatersname
      'Mutter',      // Familienrolle
      'weiblich',    // Geschlecht
      '1905',        // Geburtsjahr
      'München',     // Geburtsort
      ''             // Arbeitsort
    ],
    [
      '1',           // Seite
      '1',           // Familiennr
      '3',           // Eintragsnr
      '3',           // Laufendenr
      'Mustermann',  // Familienname
      'Peter',       // Vorname
      'Max',         // Vatersname
      'Sohn',        // Familienrolle
      'männlich',    // Geschlecht
      '1925',        // Geburtsjahr
      'Berlin',      // Geburtsort
      'Lehrling'     // Arbeitsort
    ]
  ];
  
  exampleRows.forEach(row => {
    lines.push(row.join(';'));
  });
  
  return lines.join('\n');
}

/**
 * Generates field documentation for CSV template
 */
export function generateFieldDocumentation(): string {
  const docs: string[] = [];
  
  docs.push('# CSV Import Template für Deportierte Personen');
  docs.push('');
  docs.push('## Dateiformat:');
  docs.push('- Encoding: UTF-8');
  docs.push('- Separator: Semikolon (;), Tabulator, Pipe (|) oder Komma (,)');
  docs.push('- Textqualifizierer: Anführungszeichen (") bei Bedarf');
  docs.push('');
  docs.push('## Felderbeschreibung:');
  docs.push('');
  
  Object.entries(FIELD_VALIDATION_RULES).forEach(([fieldName, rule]) => {
    docs.push(`### ${fieldName}`);
    docs.push(`- Erforderlich: ${rule.required ? 'Ja' : 'Nein'}`);
    docs.push(`- Typ: ${getTypeDescription(rule.type)}`);
    
    if (rule.maxLength) {
      docs.push(`- Maximale Länge: ${rule.maxLength} Zeichen`);
    }
    
    if (rule.minValue !== undefined) {
      docs.push(`- Minimalwert: ${rule.minValue}`);
    }
    
    if (rule.maxValue !== undefined) {
      docs.push(`- Maximalwert: ${rule.maxValue}`);
    }
    
    if (rule.allowedValues) {
      docs.push(`- Erlaubte Werte: ${rule.allowedValues.join(', ')}`);
    }
    
    docs.push('');
  });
  
  docs.push('## Beispiele:');
  docs.push('');
  docs.push('Siehe CSV-Datei für Beispieldaten.');
  docs.push('');
  docs.push('## Hinweise:');
  docs.push('- Leere Felder sind für optionale Felder erlaubt');
  docs.push('- Laufendenr muss eindeutig sein (sowohl in der CSV als auch in der Datenbank)');
  docs.push('- Bei Konflikten mit bestehenden Datensätzen werden Optionen zur Auflösung angeboten');
  docs.push('- Familiennr sollte für Familienmitglieder gleich sein');
  docs.push('- Geburtsjahr sollte realistisch sein (1800-1950)');
  
  return docs.join('\n');
}

/**
 * Creates and downloads both CSV template and documentation
 */
export function downloadCsvTemplateWithDocs(): void {
  // Create CSV template
  const csvContent = generateDetailedCsvTemplate();
  const csvBlob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
  
  // Create documentation
  const docContent = generateFieldDocumentation();
  const docBlob = new Blob([docContent], { type: 'text/plain;charset=utf-8' });
  
  // Download CSV template
  const csvUrl = URL.createObjectURL(csvBlob);
  const csvLink = document.createElement('a');
  csvLink.href = csvUrl;
  csvLink.download = 'deportierte_personen_template.csv';
  document.body.appendChild(csvLink);
  csvLink.click();
  document.body.removeChild(csvLink);
  URL.revokeObjectURL(csvUrl);
  
  // Download documentation
  setTimeout(() => {
    const docUrl = URL.createObjectURL(docBlob);
    const docLink = document.createElement('a');
    docLink.href = docUrl;
    docLink.download = 'CSV_Import_Anleitung.txt';
    document.body.appendChild(docLink);
    docLink.click();
    document.body.removeChild(docLink);
    URL.revokeObjectURL(docUrl);
  }, 100);
}

/**
 * Validates CSV template format
 */
export function validateTemplateFormat(content: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  try {
    const lines = content.split(/\r?\n/).filter(line => line.trim().length > 0);
    
    if (lines.length === 0) {
      errors.push('Template ist leer');
      return { isValid: false, errors };
    }
    
    // Check header
    const headers = lines[0].split(';').map(h => h.trim());
    const missingHeaders = EXPECTED_CSV_HEADERS.filter(expected => 
      !headers.includes(expected)
    );
    
    if (missingHeaders.length > 0) {
      errors.push(`Fehlende Header: ${missingHeaders.join(', ')}`);
    }
    
    // Check data rows format
    for (let i = 1; i < Math.min(lines.length, 4); i++) {
      const values = lines[i].split(';');
      if (values.length !== headers.length) {
        errors.push(`Zeile ${i + 1}: Anzahl der Spalten stimmt nicht überein`);
      }
    }
    
  } catch (error) {
    errors.push(`Template-Validierungsfehler: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}`);
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Helper function to get human-readable type description
 */
function getTypeDescription(type: string): string {
  switch (type) {
    case 'string': return 'Text';
    case 'number': return 'Zahl';
    case 'year': return 'Jahr (Zahl)';
    default: return type;
  }
}

/**
 * Generates a minimal CSV template for quick start
 */
export function generateMinimalTemplate(): string {
  const headers = EXPECTED_CSV_HEADERS.join(';');
  const exampleRow = [
    '1',           // Seite
    '1',           // Familiennr
    '1',           // Eintragsnr
    '1',           // Laufendenr
    'Mustermann',  // Familienname
    'Max',         // Vorname
    '',            // Vatersname
    'Vater',       // Familienrolle
    'männlich',    // Geschlecht
    '1900',        // Geburtsjahr
    'Berlin',      // Geburtsort
    ''             // Arbeitsort
  ].join(';');

  return `${headers}\n${exampleRow}`;
}
