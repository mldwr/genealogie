'use client';

import React, { useCallback, useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { DocumentArrowUpIcon, DocumentTextIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import { validateCsvFile } from '../utils/csvParser';
import { downloadCsvTemplateWithDocs } from '../utils/csvTemplate';

interface FileUploadStepProps {
  onFileSelected: (file: File) => void;
  isProcessing: boolean;
}

// Create a client-only wrapper component
function FileUploadStepClient({ onFileSelected, isProcessing }: FileUploadStepProps) {
  const [fileError, setFileError] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    setFileError(null);

    if (rejectedFiles.length > 0) {
      setFileError('Bitte wählen Sie eine gültige CSV-Datei aus');
      return;
    }

    if (acceptedFiles.length === 0) {
      setFileError('Keine Datei ausgewählt');
      return;
    }

    const file = acceptedFiles[0];
    const validation = validateCsvFile(file);

    if (!validation.isValid) {
      setFileError(validation.error || 'Ungültige Datei');
      return;
    }

    onFileSelected(file);
  }, [onFileSelected]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/csv': ['.csv'],
      'text/plain': ['.csv']
    },
    multiple: false,
    disabled: isProcessing
  });

  const handleTemplateDownload = useCallback(() => {
    downloadCsvTemplateWithDocs();
  }, []);

  return (
    <div className="space-y-6">
      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
        <div className="flex">
          <InformationCircleIcon className="h-5 w-5 text-blue-400" />
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">
              Bevor Sie beginnen
            </h3>
            <div className="mt-2 text-sm text-blue-700">
              <ul className="list-disc list-inside space-y-1">
                <li>Bereiten Sie Ihre CSV-Datei mit Semikolon (;) als Trennzeichen vor</li>
                <li>Stellen Sie UTF-8-Kodierung sicher</li>
                <li>Fügen Sie alle erforderlichen Spaltenüberschriften hinzu</li>
                <li>Laden Sie die Vorlage unten für das korrekte Format herunter</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Template Download */}
      <div className="flex justify-center">
        <button
          onClick={handleTemplateDownload}
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          disabled={isProcessing}
        >
          <DocumentTextIcon className="h-4 w-4 mr-2" />
          CSV-Vorlage & Anweisungen herunterladen
        </button>
      </div>

      {/* File Upload Area */}
      <div
        {...getRootProps()}
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${isDragActive
            ? 'border-blue-400 bg-blue-50'
            : fileError
              ? 'border-red-400 bg-red-50'
              : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
          }
          ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input {...getInputProps()} />
        
        <div className="space-y-4">
          <div className="mx-auto h-12 w-12 text-gray-400">
            <DocumentArrowUpIcon className="h-full w-full" />
          </div>
          
          <div>
            <p className="text-lg font-medium text-gray-900">
              {isDragActive
                ? 'CSV-Datei hier ablegen'
                : 'CSV-Datei hier ablegen oder klicken zum Durchsuchen'
              }
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Maximale Dateigröße: 10MB
            </p>
          </div>

          {!isProcessing && (
            <div className="text-xs text-gray-400">
              Unterstütztes Format: CSV-Dateien mit Semikolon als Trennzeichen
            </div>
          )}

          {isProcessing && (
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span className="text-sm text-blue-600">Datei wird verarbeitet...</span>
            </div>
          )}
        </div>
      </div>

      {/* Error Display */}
      {fileError && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Dateifehler
              </h3>
              <div className="mt-2 text-sm text-red-700">
                {fileError}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* File Requirements */}
      <div className="bg-gray-50 rounded-md p-4">
        <h4 className="text-sm font-medium text-gray-900 mb-2">
          Dateianforderungen:
        </h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Dateiformat: CSV (.csv)</li>
          <li>• Kodierung: UTF-8</li>
          <li>• Trennzeichen: Semikolon (;)</li>
          <li>• Pflichtfelder: Laufendenr</li>
          <li>• Maximale Größe: 10MB</li>
        </ul>
      </div>

      {/* Expected Headers */}
      <div className="bg-gray-50 rounded-md p-4">
        <h4 className="text-sm font-medium text-gray-900 mb-2">
          Erwartete Spaltenüberschriften:
        </h4>
        <div className="text-sm text-gray-600">
          <code className="bg-white px-2 py-1 rounded text-xs">
            Seite;Familiennr;Eintragsnr;Laufendenr;Familienname;Vorname;Vatersname;Familienrolle;Geschlecht;Geburtsjahr;Geburtsort;Arbeitsort
          </code>
        </div>
      </div>
    </div>
  );
}

// Main export with client-only wrapper
export default function FileUploadStep(props: FileUploadStepProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return <div>Lädt...</div>;
  }

  return <FileUploadStepClient {...props} />;
}
