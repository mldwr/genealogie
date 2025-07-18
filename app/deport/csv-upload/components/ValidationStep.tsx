'use client';

import React, { useState, useEffect } from 'react';
import { ValidationResult, ValidationError, DuplicateConflict } from '../types/csvTypes';
import {
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

interface ValidationStepProps {
  validationResult: ValidationResult;
  duplicateConflicts: DuplicateConflict[];
  onConflictResolution: (conflicts: DuplicateConflict[]) => void;
  onNext: () => void;
  onPrevious: () => void;
  isProcessing: boolean;
}

// Create a client-only wrapper component
function ValidationStepClient({
  validationResult,
  duplicateConflicts,
  onConflictResolution,
  onNext,
  onPrevious,
  isProcessing
}: ValidationStepProps) {
  const [activeTab, setActiveTab] = useState<'summary' | 'errors' | 'warnings' | 'conflicts'>('summary');
  const [conflictResolutions, setConflictResolutions] = useState<DuplicateConflict[]>(duplicateConflicts);

  const handleConflictActionChange = (laufendenr: number, action: 'skip' | 'update' | 'create_new_version') => {
    const updatedConflicts = conflictResolutions.map(conflict =>
      conflict.laufendenr === laufendenr ? { ...conflict, action } : conflict
    );
    setConflictResolutions(updatedConflicts);
    onConflictResolution(updatedConflicts);
  };

  const canProceed = validationResult.errors.length === 0;

  return (
    <div className="space-y-6">
      {/* Validation Summary */}
      <div className={`border rounded-md p-4 ${
        validationResult.isValid ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
      }`}>
        <div className="flex items-center">
          {validationResult.isValid ? (
            <CheckCircleIcon className="h-5 w-5 text-green-400" />
          ) : (
            <XCircleIcon className="h-5 w-5 text-red-400" />
          )}
          <div className="ml-3">
            <h3 className={`text-sm font-medium ${
              validationResult.isValid ? 'text-green-800' : 'text-red-800'
            }`}>
              {validationResult.isValid ? 'Validierung erfolgreich' : 'Validierungsprobleme gefunden'}
            </h3>
            <div className={`mt-1 text-sm ${
              validationResult.isValid ? 'text-green-700' : 'text-red-700'
            }`}>
              {validationResult.validRows} von {validationResult.totalRows} Zeilen sind gültig
              {validationResult.errors.length > 0 && ` • ${validationResult.errors.length} Fehler`}
              {validationResult.warnings.length > 0 && ` • ${validationResult.warnings.length} Warnungen`}
              {duplicateConflicts.length > 0 && ` • ${duplicateConflicts.length} Konflikte`}
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-sm font-medium text-gray-900">Gültige Zeilen</div>
          <div className="text-2xl font-bold text-green-600">{validationResult.validRows}</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-sm font-medium text-gray-900">Fehler</div>
          <div className="text-2xl font-bold text-red-600">{validationResult.errors.length}</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-sm font-medium text-gray-900">Warnungen</div>
          <div className="text-2xl font-bold text-yellow-600">{validationResult.warnings.length}</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-sm font-medium text-gray-900">Konflikte</div>
          <div className="text-2xl font-bold text-orange-600">{duplicateConflicts.length}</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { key: 'summary', label: 'Zusammenfassung', count: null },
            { key: 'errors', label: 'Fehler', count: validationResult.errors.length },
            { key: 'warnings', label: 'Warnungen', count: validationResult.warnings.length },
            { key: 'conflicts', label: 'Konflikte', count: duplicateConflicts.length }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.key
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
              {tab.count !== null && tab.count > 0 && (
                <span className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
                  tab.key === 'errors' ? 'bg-red-100 text-red-800' :
                  tab.key === 'warnings' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-orange-100 text-orange-800'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="min-h-64">
        {activeTab === 'summary' && (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <div className="flex">
                <InformationCircleIcon className="h-5 w-5 text-blue-400" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">Validierungszusammenfassung</h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <ul className="list-disc list-inside space-y-1">
                      <li>{validationResult.validRows} Zeilen haben die Validierung bestanden</li>
                      {validationResult.errors.length > 0 && (
                        <li className="text-red-700">{validationResult.errors.length} Zeilen haben Fehler, die behoben werden müssen</li>
                      )}
                      {validationResult.warnings.length > 0 && (
                        <li className="text-yellow-700">{validationResult.warnings.length} Zeilen haben Warnungen (können importiert werden)</li>
                      )}
                      {duplicateConflicts.length > 0 && (
                        <li className="text-orange-700">{duplicateConflicts.length} Zeilen stehen im Konflikt mit bestehenden Datensätzen</li>
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            
            {!canProceed && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <div className="flex">
                  <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">Aktion erforderlich</h3>
                    <div className="mt-2 text-sm text-red-700">
                      Bitte beheben Sie alle Fehler, bevor Sie mit dem Import fortfahren. Prüfen Sie den "Fehler"-Tab für Details.
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'errors' && (
          <ErrorList errors={validationResult.errors} />
        )}

        {activeTab === 'warnings' && (
          <ErrorList errors={validationResult.warnings} />
        )}

        {activeTab === 'conflicts' && (
          <ConflictResolution
            conflicts={conflictResolutions}
            onActionChange={handleConflictActionChange}
          />
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between">
        <button
          onClick={onPrevious}
          disabled={isProcessing}
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeftIcon className="h-4 w-4 mr-2" />
          Zurück zur Vorschau
        </button>
        <button
          onClick={onNext}
          disabled={isProcessing || !canProceed}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isProcessing ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Verarbeite...
            </>
          ) : (
            <>
              Import starten
              <ChevronRightIcon className="h-4 w-4 ml-2" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}

// Error List Component
function ErrorList({ errors }: { errors: ValidationError[] }) {
  if (errors.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        Keine Probleme gefunden
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {errors.map((error, index) => (
        <div
          key={index}
          className={`border rounded-md p-3 ${
            error.severity === 'error' 
              ? 'bg-red-50 border-red-200' 
              : 'bg-yellow-50 border-yellow-200'
          }`}
        >
          <div className="flex items-start">
            {error.severity === 'error' ? (
              <XCircleIcon className="h-4 w-4 text-red-400 mt-0.5" />
            ) : (
              <ExclamationTriangleIcon className="h-4 w-4 text-yellow-400 mt-0.5" />
            )}
            <div className="ml-2 flex-1">
              <div className="text-sm font-medium">
                Zeile {error.row}, Feld: {error.field}
              </div>
              <div className="text-sm text-gray-600 mt-1">
                {error.message}
              </div>
              {error.value && (
                <div className="text-xs text-gray-500 mt-1">
                  Wert: "{error.value}"
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Conflict Resolution Component
function ConflictResolution({ 
  conflicts, 
  onActionChange 
}: { 
  conflicts: DuplicateConflict[];
  onActionChange: (laufendenr: number, action: 'skip' | 'update' | 'create_new_version') => void;
}) {
  if (conflicts.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        Keine Konflikte gefunden
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {conflicts.map((conflict, index) => (
        <div key={index} className="border border-orange-200 rounded-md p-4 bg-orange-50">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="text-sm font-medium text-orange-800">
                Laufendenr {conflict.laufendenr} existiert bereits
              </div>
              <div className="text-sm text-orange-700 mt-1">
                Bestehender Datensatz: {conflict.existingRecord.Familienname}, {conflict.existingRecord.Vorname}
                <br />
                Erstellt: {new Date(conflict.existingRecord.valid_from || '').toLocaleDateString()}
              </div>
            </div>
            <div className="ml-4">
              <select
                value={conflict.action}
                onChange={(e) => onActionChange(conflict.laufendenr, e.target.value as any)}
                className="text-sm border border-orange-300 rounded-md px-2 py-1 bg-white"
              >
                <option value="skip">Überspringen (nicht importieren)</option>
                <option value="update">Bestehenden Datensatz aktualisieren</option>
                <option value="create_new_version">Neue Version erstellen</option>
              </select>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Main export with client-only wrapper
export default function ValidationStep(props: ValidationStepProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return <div>Lädt...</div>;
  }

  return <ValidationStepClient {...props} />;
}
