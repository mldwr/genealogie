'use client';

import React, { useState, useCallback } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { useToast } from '@/components/ui/Toasts/use-toast';
import { CsvUploadState, ParsedCsvData, ValidationResult, ImportResult, DuplicateConflict } from '../types/csvTypes';
import { parseCsvFile } from '../utils/csvParser';
import { validateCsvData, identifyDuplicateConflicts } from '../utils/dataValidator';
import { processCsvImport } from '../utils/importProcessor';

import FileUploadStep from './FileUploadStep';
import PreviewStep from './PreviewStep';
import ValidationStep from './ValidationStep';
import ImportStep from './ImportStep';
import ProgressIndicator from './ProgressIndicator';

interface CsvUploadWizardProps {
  onComplete?: (result: ImportResult) => void;
  onCancel?: () => void;
}

export default function CsvUploadWizard({ onComplete, onCancel }: CsvUploadWizardProps) {
  const { user } = useAuth();
  const { toast } = useToast();

  const [state, setState] = useState<CsvUploadState>({
    step: 'upload',
    file: null,
    parsedData: null,
    validationResult: null,
    importResult: null,
    isProcessing: false,
    error: null
  });

  const [duplicateConflicts, setDuplicateConflicts] = useState<DuplicateConflict[]>([]);
  const [importProgress, setImportProgress] = useState({ progress: 0, message: '' });

  // Handle file selection and parsing
  const handleFileSelected = useCallback(async (file: File) => {
    setState(prev => ({ ...prev, isProcessing: true, error: null }));

    try {
      const parsedData = await parseCsvFile(file);
      setState(prev => ({
        ...prev,
        file,
        parsedData,
        step: 'preview',
        isProcessing: false
      }));

      toast({
        title: 'File parsed successfully',
        description: `Found ${parsedData.totalRows} rows of data`
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to parse CSV file';
      setState(prev => ({
        ...prev,
        error: errorMessage,
        isProcessing: false
      }));

      toast({
        title: 'Parse Error',
        description: errorMessage,
        variant: 'destructive'
      });
    }
  }, [toast]);

  // Handle validation step
  const handleValidateData = useCallback(async () => {
    if (!state.parsedData) return;

    setState(prev => ({ ...prev, isProcessing: true, error: null }));

    try {
      const validationResult = await validateCsvData(state.parsedData);
      const conflicts = await identifyDuplicateConflicts(state.parsedData);

      setState(prev => ({
        ...prev,
        validationResult,
        step: 'validate',
        isProcessing: false
      }));

      setDuplicateConflicts(conflicts);

      if (validationResult.isValid) {
        toast({
          title: 'Validation completed',
          description: `${validationResult.validRows} of ${validationResult.totalRows} rows are valid`
        });
      } else {
        toast({
          title: 'Validation issues found',
          description: `${validationResult.errors.length} errors need to be resolved`,
          variant: 'destructive'
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Validation failed';
      setState(prev => ({
        ...prev,
        error: errorMessage,
        isProcessing: false
      }));

      toast({
        title: 'Validation Error',
        description: errorMessage,
        variant: 'destructive'
      });
    }
  }, [state.parsedData, toast]);

  // Handle import execution
  const handleExecuteImport = useCallback(async () => {
    if (!state.parsedData || !user?.email) return;

    setState(prev => ({ ...prev, isProcessing: true, error: null, step: 'import' }));

    try {
      const importResult = await processCsvImport(
        state.parsedData,
        user.email,
        duplicateConflicts,
        (progress, message) => {
          setImportProgress({ progress, message });
        }
      );

      setState(prev => ({
        ...prev,
        importResult,
        step: 'complete',
        isProcessing: false
      }));

      if (importResult.success) {
        toast({
          title: 'Import completed successfully',
          description: `${importResult.importedCount} records imported, ${importResult.skippedCount} skipped`
        });
      } else {
        toast({
          title: 'Import completed with errors',
          description: `${importResult.importedCount} imported, ${importResult.errorCount} errors`,
          variant: 'destructive'
        });
      }

      onComplete?.(importResult);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Import failed';
      setState(prev => ({
        ...prev,
        error: errorMessage,
        isProcessing: false
      }));

      toast({
        title: 'Import Error',
        description: errorMessage,
        variant: 'destructive'
      });
    }
  }, [state.parsedData, user?.email, duplicateConflicts, toast, onComplete]);

  // Handle conflict resolution updates
  const handleConflictResolution = useCallback((updatedConflicts: DuplicateConflict[]) => {
    setDuplicateConflicts(updatedConflicts);
  }, []);

  // Handle step navigation
  const handlePreviousStep = useCallback(() => {
    setState(prev => {
      switch (prev.step) {
        case 'preview':
          return { ...prev, step: 'upload' };
        case 'validate':
          return { ...prev, step: 'preview' };
        case 'import':
          return { ...prev, step: 'validate' };
        default:
          return prev;
      }
    });
  }, []);

  const handleReset = useCallback(() => {
    setState({
      step: 'upload',
      file: null,
      parsedData: null,
      validationResult: null,
      importResult: null,
      isProcessing: false,
      error: null
    });
    setDuplicateConflicts([]);
    setImportProgress({ progress: 0, message: '' });
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          CSV Import für Deportierte Personen
        </h1>
        <ProgressIndicator currentStep={state.step} />
      </div>

      {state.error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">
                {state.error}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="min-h-96">
        {state.step === 'upload' && (
          <FileUploadStep
            onFileSelected={handleFileSelected}
            isProcessing={state.isProcessing}
          />
        )}

        {state.step === 'preview' && state.parsedData && (
          <PreviewStep
            parsedData={state.parsedData}
            onNext={handleValidateData}
            onPrevious={handlePreviousStep}
            isProcessing={state.isProcessing}
          />
        )}

        {state.step === 'validate' && state.validationResult && (
          <ValidationStep
            validationResult={state.validationResult}
            duplicateConflicts={duplicateConflicts}
            onConflictResolution={handleConflictResolution}
            onNext={handleExecuteImport}
            onPrevious={handlePreviousStep}
            isProcessing={state.isProcessing}
          />
        )}

        {state.step === 'import' && (
          <ImportStep
            progress={importProgress.progress}
            message={importProgress.message}
            isProcessing={state.isProcessing}
          />
        )}

        {state.step === 'complete' && state.importResult && (
          <div className="text-center">
            <div className="mb-6">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">Import Complete</h3>
              <p className="mt-2 text-sm text-gray-500">
                {state.importResult.importedCount} records imported successfully
                {state.importResult.skippedCount > 0 && `, ${state.importResult.skippedCount} skipped`}
                {state.importResult.errorCount > 0 && `, ${state.importResult.errorCount} errors`}
              </p>
            </div>
            
            <div className="flex justify-center space-x-4">
              <button
                onClick={handleReset}
                className="btn bg-blue-600 text-white hover:bg-blue-700"
              >
                Import Another File
              </button>
              <button
                onClick={onCancel}
                className="btn bg-gray-600 text-white hover:bg-gray-700"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>

      {(state.step === 'upload' || state.step === 'preview' || state.step === 'validate') && (
        <div className="mt-6 flex justify-between">
          <button
            onClick={onCancel}
            className="btn bg-gray-600 text-white hover:bg-gray-700"
            disabled={state.isProcessing}
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}
