// Data validation utilities for CSV import

import { 
  ParsedCsvData, 
  ValidationResult, 
  ValidationError, 
  DeportedPersonCsvRow,
  FIELD_VALIDATION_RULES,
  DuplicateConflict
} from '../types/csvTypes';
import { getDeportedPersonByLaufendenr } from '@/app/deport/data';

/**
 * Validates parsed CSV data against business rules
 */
export async function validateCsvData(parsedData: ParsedCsvData): Promise<ValidationResult> {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];
  let validRows = 0;

  // Track Laufendenr values to check for duplicates within the CSV
  const laufendenrMap = new Map<number, number[]>();

  for (let rowIndex = 0; rowIndex < parsedData.rows.length; rowIndex++) {
    const row = parsedData.rows[rowIndex];
    const rowNumber = rowIndex + 2; // +2 because row 1 is headers and array is 0-indexed
    let rowHasErrors = false;

    // Validate each field
    for (const [fieldName, rule] of Object.entries(FIELD_VALIDATION_RULES)) {
      const value = row[fieldName]?.trim() || '';
      const fieldErrors = validateField(fieldName, value, rule, rowNumber);
      
      fieldErrors.forEach(error => {
        if (error.severity === 'error') {
          errors.push(error);
          rowHasErrors = true;
        } else {
          warnings.push(error);
        }
      });
    }

    // Track Laufendenr for duplicate checking
    const laufendenr = parseInt(row.Laufendenr?.trim() || '');
    if (!isNaN(laufendenr)) {
      if (!laufendenrMap.has(laufendenr)) {
        laufendenrMap.set(laufendenr, []);
      }
      laufendenrMap.get(laufendenr)!.push(rowNumber);
    }

    if (!rowHasErrors) {
      validRows++;
    }
  }

  // Check for duplicate Laufendenr within CSV
  for (const [laufendenr, rowNumbers] of Array.from(laufendenrMap.entries())) {
    if (rowNumbers.length > 1) {
      rowNumbers.forEach(rowNumber => {
        errors.push({
          row: rowNumber,
          field: 'Laufendenr',
          value: laufendenr.toString(),
          message: `Duplicate Laufendenr ${laufendenr} found in rows: ${rowNumbers.join(', ')}`,
          severity: 'error'
        });
      });
      validRows -= rowNumbers.length;
    }
  }

  // Check for existing records in database
  await checkDatabaseConflicts(parsedData, errors, warnings);

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    validRows: Math.max(0, validRows),
    totalRows: parsedData.totalRows
  };
}

/**
 * Validates a single field value against its rules
 */
function validateField(
  fieldName: string, 
  value: string, 
  rule: any, 
  rowNumber: number
): ValidationError[] {
  const errors: ValidationError[] = [];

  // Check required fields
  if (rule.required && (!value || value.trim() === '')) {
    errors.push({
      row: rowNumber,
      field: fieldName,
      value,
      message: `${fieldName} is required`,
      severity: 'error'
    });
    return errors;
  }

  // Skip validation for empty optional fields
  if (!value || value.trim() === '') {
    return errors;
  }

  // Type validation
  switch (rule.type) {
    case 'number':
      const numValue = parseInt(value);
      if (isNaN(numValue)) {
        errors.push({
          row: rowNumber,
          field: fieldName,
          value,
          message: `${fieldName} must be a valid number`,
          severity: 'error'
        });
      } else {
        if (rule.minValue !== undefined && numValue < rule.minValue) {
          errors.push({
            row: rowNumber,
            field: fieldName,
            value,
            message: `${fieldName} must be at least ${rule.minValue}`,
            severity: 'error'
          });
        }
        if (rule.maxValue !== undefined && numValue > rule.maxValue) {
          errors.push({
            row: rowNumber,
            field: fieldName,
            value,
            message: `${fieldName} must be at most ${rule.maxValue}`,
            severity: 'error'
          });
        }
      }
      break;

    case 'year':
      const yearValue = parseInt(value);
      if (isNaN(yearValue)) {
        errors.push({
          row: rowNumber,
          field: fieldName,
          value,
          message: `${fieldName} must be a valid year`,
          severity: 'error'
        });
      } else {
        if (rule.minValue !== undefined && yearValue < rule.minValue) {
          errors.push({
            row: rowNumber,
            field: fieldName,
            value,
            message: `${fieldName} must be ${rule.minValue} or later`,
            severity: 'error'
          });
        }
        if (rule.maxValue !== undefined && yearValue > rule.maxValue) {
          errors.push({
            row: rowNumber,
            field: fieldName,
            value,
            message: `${fieldName} must be ${rule.maxValue} or earlier`,
            severity: 'error'
          });
        }
      }
      break;

    case 'string':
      if (rule.maxLength !== undefined && value.length > rule.maxLength) {
        errors.push({
          row: rowNumber,
          field: fieldName,
          value,
          message: `${fieldName} must be at most ${rule.maxLength} characters`,
          severity: 'error'
        });
      }
      break;
  }

  // Allowed values validation
  if (rule.allowedValues && !rule.allowedValues.includes(value)) {
    errors.push({
      row: rowNumber,
      field: fieldName,
      value,
      message: `${fieldName} must be one of: ${rule.allowedValues.join(', ')}`,
      severity: 'warning'
    });
  }

  return errors;
}

/**
 * Checks for conflicts with existing database records
 */
async function checkDatabaseConflicts(
  parsedData: ParsedCsvData,
  errors: ValidationError[],
  warnings: ValidationError[]
): Promise<void> {
  const laufendenrValues = parsedData.rows
    .map(row => parseInt(row.Laufendenr?.trim() || ''))
    .filter(val => !isNaN(val));

  // Check each unique Laufendenr against database
  const uniqueLaufendenr = Array.from(new Set(laufendenrValues));
  
  for (const laufendenr of uniqueLaufendenr) {
    try {
      const existingRecord = await getDeportedPersonByLaufendenr(laufendenr, false);
      
      if (existingRecord) {
        // Find all rows with this Laufendenr
        const conflictRows = parsedData.rows
          .map((row, index) => ({ row, index }))
          .filter(({ row }) => parseInt(row.Laufendenr?.trim() || '') === laufendenr)
          .map(({ index }) => index + 2); // +2 for header and 0-indexing

        conflictRows.forEach(rowNumber => {
          warnings.push({
            row: rowNumber,
            field: 'Laufendenr',
            value: laufendenr.toString(),
            message: `Record with Laufendenr ${laufendenr} already exists (${(existingRecord as any).Familienname}, ${(existingRecord as any).Vorname})`,
            severity: 'warning'
          });
        });
      }
    } catch (error) {
      console.error(`Error checking Laufendenr ${laufendenr}:`, error);
    }
  }
}

/**
 * Identifies duplicate conflicts and suggests resolution actions
 */
export async function identifyDuplicateConflicts(parsedData: ParsedCsvData): Promise<DuplicateConflict[]> {
  const conflicts: DuplicateConflict[] = [];
  
  for (let rowIndex = 0; rowIndex < parsedData.rows.length; rowIndex++) {
    const row = parsedData.rows[rowIndex];
    const laufendenr = parseInt(row.Laufendenr?.trim() || '');
    
    if (isNaN(laufendenr)) continue;

    try {
      const existingRecord = await getDeportedPersonByLaufendenr(laufendenr, false);
      
      if (existingRecord) {
        conflicts.push({
          row: rowIndex + 2, // +2 for header and 0-indexing
          laufendenr,
          existingRecord: {
            id: (existingRecord as any).id,
            Familienname: (existingRecord as any).Familienname,
            Vorname: (existingRecord as any).Vorname,
            valid_from: (existingRecord as any).valid_from
          },
          action: 'skip' // Default action
        });
      }
    } catch (error) {
      console.error(`Error checking for conflicts with Laufendenr ${laufendenr}:`, error);
    }
  }

  return conflicts;
}
