// Database import processing utilities

import { 
  ParsedCsvData, 
  ImportResult, 
  ValidationError, 
  DuplicateConflict,
  DeportedPersonCsvRow 
} from '../types/csvTypes';
import { createDeportedPerson, updateDeportedPerson, getDeportedPersonByLaufendenr } from '@/app/deport/data';

/**
 * Processes CSV data import to database with proper historization
 */
export async function processCsvImport(
  parsedData: ParsedCsvData,
  userEmail: string,
  duplicateConflicts: DuplicateConflict[] = [],
  onProgress?: (progress: number, message: string) => void
): Promise<ImportResult> {
  const result: ImportResult = {
    success: false,
    importedCount: 0,
    skippedCount: 0,
    errorCount: 0,
    errors: [],
    duplicateConflicts: []
  };

  const totalRows = parsedData.rows.length;
  let processedRows = 0;

  // Create a map of conflict resolutions
  const conflictResolutions = new Map<number, 'skip' | 'update' | 'create_new_version'>();
  duplicateConflicts.forEach(conflict => {
    conflictResolutions.set(conflict.laufendenr, conflict.action);
  });

  // Process each row
  for (let rowIndex = 0; rowIndex < parsedData.rows.length; rowIndex++) {
    const row = parsedData.rows[rowIndex];
    const rowNumber = rowIndex + 2; // +2 for header and 0-indexing
    
    try {
      onProgress?.(
        Math.round((processedRows / totalRows) * 100),
        `Processing row ${rowNumber}...`
      );

      const personData = transformRowToPersonData(row);
      const laufendenr = parseInt(personData.Laufendenr || '');

      if (isNaN(laufendenr)) {
        result.errors.push({
          row: rowNumber,
          field: 'Laufendenr',
          value: personData.Laufendenr || '',
          message: 'Invalid Laufendenr',
          severity: 'error'
        });
        result.errorCount++;
        continue;
      }

      // Check for existing record
      const existingRecord = await getDeportedPersonByLaufendenr(laufendenr, false);
      
      if (existingRecord) {
        const resolution = conflictResolutions.get(laufendenr) || 'skip';
        
        switch (resolution) {
          case 'skip':
            result.skippedCount++;
            break;
            
          case 'update':
            await updateExistingRecord(existingRecord as any, personData, userEmail);
            result.importedCount++;
            break;
            
          case 'create_new_version':
            await createNewVersion(personData, userEmail);
            result.importedCount++;
            break;
        }
      } else {
        // Create new record
        await createNewRecord(personData, userEmail);
        result.importedCount++;
      }

    } catch (error) {
      result.errors.push({
        row: rowNumber,
        field: 'general',
        value: '',
        message: `Import error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        severity: 'error'
      });
      result.errorCount++;
    }

    processedRows++;
  }

  onProgress?.(100, 'Import completed');

  result.success = result.errorCount === 0;
  return result;
}

/**
 * Transforms CSV row data to person data format
 */
function transformRowToPersonData(row: any): DeportedPersonCsvRow & { id?: string } {
  return {
    Seite: row.Seite?.trim() || undefined,
    Familiennr: row.Familiennr?.trim() || undefined,
    Eintragsnr: row.Eintragsnr?.trim() || undefined,
    Laufendenr: row.Laufendenr?.trim() || undefined,
    Familienname: row.Familienname?.trim() || undefined,
    Vorname: row.Vorname?.trim() || undefined,
    Vatersname: row.Vatersname?.trim() || undefined,
    Familienrolle: row.Familienrolle?.trim() || undefined,
    Geschlecht: row.Geschlecht?.trim() || undefined,
    Geburtsjahr: row.Geburtsjahr?.trim() || undefined,
    Geburtsort: row.Geburtsort?.trim() || undefined,
    Arbeitsort: row.Arbeitsort?.trim() || undefined
  };
}

/**
 * Creates a new record in the database
 */
async function createNewRecord(personData: DeportedPersonCsvRow, userEmail: string): Promise<void> {
  await createDeportedPerson({
    Seite: personData.Seite,
    Familiennr: personData.Familiennr,
    Eintragsnr: personData.Eintragsnr,
    Laufendenr: personData.Laufendenr,
    Familienname: personData.Familienname,
    Vorname: personData.Vorname,
    Vatersname: personData.Vatersname,
    Familienrolle: personData.Familienrolle,
    Geschlecht: personData.Geschlecht,
    Geburtsjahr: personData.Geburtsjahr,
    Geburtsort: personData.Geburtsort,
    Arbeitsort: personData.Arbeitsort
  }, userEmail);
}

/**
 * Updates an existing record with new data
 */
async function updateExistingRecord(
  existingRecord: any, 
  personData: DeportedPersonCsvRow, 
  userEmail: string
): Promise<void> {
  await updateDeportedPerson({
    id: existingRecord.id,
    Seite: personData.Seite,
    Familiennr: personData.Familiennr,
    Eintragsnr: personData.Eintragsnr,
    Laufendenr: personData.Laufendenr,
    Familienname: personData.Familienname,
    Vorname: personData.Vorname,
    Vatersname: personData.Vatersname,
    Familienrolle: personData.Familienrolle,
    Geschlecht: personData.Geschlecht,
    Geburtsjahr: personData.Geburtsjahr,
    Geburtsort: personData.Geburtsort,
    Arbeitsort: personData.Arbeitsort
  }, userEmail);
}

/**
 * Creates a new version of a record (for cases where we want to preserve both)
 */
async function createNewVersion(personData: DeportedPersonCsvRow, userEmail: string): Promise<void> {
  // For now, this is the same as creating a new record
  // In the future, we might want to implement a different strategy
  await createNewRecord(personData, userEmail);
}

/**
 * Validates import data before processing
 */
export function validateImportData(parsedData: ParsedCsvData): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!parsedData || !parsedData.rows || parsedData.rows.length === 0) {
    errors.push('No data to import');
    return { isValid: false, errors };
  }

  // Check for required Laufendenr in all rows
  const rowsWithoutLaufendenr = parsedData.rows
    .map((row, index) => ({ row, index }))
    .filter(({ row }) => !row.Laufendenr || row.Laufendenr.trim() === '')
    .map(({ index }) => index + 2); // +2 for header and 0-indexing

  if (rowsWithoutLaufendenr.length > 0) {
    errors.push(`Rows missing Laufendenr: ${rowsWithoutLaufendenr.join(', ')}`);
  }

  // Check for duplicate Laufendenr within the CSV
  const laufendenrCounts = new Map<string, number[]>();
  parsedData.rows.forEach((row, index) => {
    const laufendenr = row.Laufendenr?.trim();
    if (laufendenr) {
      if (!laufendenrCounts.has(laufendenr)) {
        laufendenrCounts.set(laufendenr, []);
      }
      laufendenrCounts.get(laufendenr)!.push(index + 2);
    }
  });

  const duplicates = Array.from(laufendenrCounts.entries())
    .filter(([_, rows]) => rows.length > 1);

  if (duplicates.length > 0) {
    duplicates.forEach(([laufendenr, rows]) => {
      errors.push(`Duplicate Laufendenr ${laufendenr} in rows: ${rows.join(', ')}`);
    });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Estimates import time based on data size
 */
export function estimateImportTime(rowCount: number): string {
  // Rough estimate: ~100ms per row for database operations
  const estimatedMs = rowCount * 100;
  
  if (estimatedMs < 1000) {
    return 'Less than 1 second';
  } else if (estimatedMs < 60000) {
    return `About ${Math.ceil(estimatedMs / 1000)} seconds`;
  } else {
    return `About ${Math.ceil(estimatedMs / 60000)} minutes`;
  }
}

/**
 * Prepares import summary for user confirmation
 */
export function prepareImportSummary(
  parsedData: ParsedCsvData,
  duplicateConflicts: DuplicateConflict[]
): {
  totalRows: number;
  newRecords: number;
  updates: number;
  skips: number;
  estimatedTime: string;
} {
  const totalRows = parsedData.rows.length;
  const conflictActions = duplicateConflicts.reduce((acc, conflict) => {
    acc[conflict.action] = (acc[conflict.action] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const updates = conflictActions.update || 0;
  const skips = conflictActions.skip || 0;
  const newRecords = totalRows - duplicateConflicts.length;

  return {
    totalRows,
    newRecords,
    updates,
    skips,
    estimatedTime: estimateImportTime(totalRows - skips)
  };
}
