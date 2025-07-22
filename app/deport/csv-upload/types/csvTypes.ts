// TypeScript interfaces for CSV upload functionality

export interface CsvRow {
  [key: string]: string;
}

export interface ParsedCsvData {
  headers: string[];
  rows: CsvRow[];
  totalRows: number;
}

export interface ValidationError {
  row: number;
  field: string;
  value: string;
  message: string;
  severity: 'error' | 'warning';
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
  validRows: number;
  totalRows: number;
}

export interface ImportResult {
  success: boolean;
  importedCount: number;
  skippedCount: number;
  errorCount: number;
  errors: ValidationError[];
  duplicateConflicts: DuplicateConflict[];
}

export interface SeparatorDetectionResult {
  separator: string;
  name: string;
  confidence: number;
}

export interface DuplicateConflict {
  row: number;
  laufendenr: number;
  existingRecord: {
    id: string;
    Familienname: string | null;
    Vorname: string | null;
    valid_from: string | null;
  };
  action: 'skip' | 'update' | 'create_new_version';
}

export interface CsvUploadState {
  step: 'upload' | 'preview' | 'validate' | 'import' | 'complete';
  file: File | null;
  parsedData: ParsedCsvData | null;
  validationResult: ValidationResult | null;
  importResult: ImportResult | null;
  isProcessing: boolean;
  error: string | null;
}

export interface DeportedPersonCsvRow {
  Seite?: string;
  Familiennr?: string;
  Eintragsnr?: string;
  Laufendenr?: string;
  Familienname?: string;
  Vorname?: string;
  Vatersname?: string;
  Familienrolle?: string;
  Geschlecht?: string;
  Geburtsjahr?: string;
  Geburtsort?: string;
  Arbeitsort?: string;
}

// Expected CSV headers in German (matching database fields)
export const EXPECTED_CSV_HEADERS: (keyof DeportedPersonCsvRow)[] = [
  'Seite',
  'Familiennr',
  'Eintragsnr',
  'Laufendenr',
  'Familienname',
  'Vorname',
  'Vatersname',
  'Familienrolle',
  'Geschlecht',
  'Geburtsjahr',
  'Geburtsort',
  'Arbeitsort'
];

// Field validation rules
export interface FieldValidationRule {
  required: boolean;
  type: 'string' | 'number' | 'year';
  maxLength?: number;
  minValue?: number;
  maxValue?: number;
  allowedValues?: string[];
}

export const FIELD_VALIDATION_RULES: Record<keyof DeportedPersonCsvRow, FieldValidationRule> = {
  Seite: { required: false, type: 'number', minValue: 1 },
  Familiennr: { required: false, type: 'number', minValue: 1 },
  Eintragsnr: { required: false, type: 'number', minValue: 1 },
  Laufendenr: { required: true, type: 'number', minValue: 1 },
  Familienname: { required: false, type: 'string', maxLength: 255 },
  Vorname: { required: false, type: 'string', maxLength: 255 },
  Vatersname: { required: false, type: 'string', maxLength: 255 },
  Familienrolle: { 
    required: false, 
    type: 'string', 
    maxLength: 100,
    allowedValues: ['Familienoberhaupt', 'Vater', 'Mutter', 'Sohn', 'Tochter', 'Ehefrau', 'Großvater', 'Großmutter', 'Enkel', 'Enkelin', 'Bruder', 'Schwester', 'Onkel', 'Tante', 'Neffe', 'Nichte', 'Schwiegervater', 'Schwiegermutter', 'Schwiegersohn', 'Schwiegertochter', 'unbekannt']
  },
  Geschlecht: { 
    required: false, 
    type: 'string',
    allowedValues: ['männlich', 'weiblich', 'unbekannt']
  },
  Geburtsjahr: { required: false, type: 'year', minValue: 1800, maxValue: 1950 },
  Geburtsort: { required: false, type: 'string', maxLength: 255 },
  Arbeitsort: { required: false, type: 'string', maxLength: 255 }
};
