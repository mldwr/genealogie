'use client';

import React, { useState } from 'react';
import { ValidationError } from '../types/csvTypes';
import { 
  XCircleIcon, 
  ExclamationTriangleIcon, 
  ChevronDownIcon, 
  ChevronUpIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

interface ErrorDisplayProps {
  errors: ValidationError[];
  title?: string;
  maxVisible?: number;
  collapsible?: boolean;
}

export default function ErrorDisplay({ 
  errors, 
  title = 'Validation Issues', 
  maxVisible = 5,
  collapsible = true 
}: ErrorDisplayProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedSeverity, setSelectedSeverity] = useState<'all' | 'error' | 'warning'>('all');

  if (errors.length === 0) {
    return null;
  }

  // Filter errors by severity
  const filteredErrors = errors.filter(error => 
    selectedSeverity === 'all' || error.severity === selectedSeverity
  );

  // Group errors by field for better organization
  const errorsByField = filteredErrors.reduce((acc, error) => {
    const key = error.field;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(error);
    return acc;
  }, {} as Record<string, ValidationError[]>);

  const visibleErrors = isExpanded ? filteredErrors : filteredErrors.slice(0, maxVisible);
  const hasMore = filteredErrors.length > maxVisible;

  const errorCount = errors.filter(e => e.severity === 'error').length;
  const warningCount = errors.filter(e => e.severity === 'warning').length;

  return (
    <div className="space-y-4">
      {/* Header with filters */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">
          {title} ({filteredErrors.length})
        </h3>
        
        <div className="flex items-center space-x-2">
          {/* Severity Filter */}
          <select
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value as any)}
            className="text-sm border border-gray-300 rounded-md px-2 py-1"
          >
            <option value="all">All ({errors.length})</option>
            {errorCount > 0 && <option value="error">Errors ({errorCount})</option>}
            {warningCount > 0 && <option value="warning">Warnings ({warningCount})</option>}
          </select>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <div className="flex items-center">
            <XCircleIcon className="h-4 w-4 text-red-400" />
            <div className="ml-2">
              <div className="text-sm font-medium text-red-800">Errors</div>
              <div className="text-lg font-bold text-red-600">{errorCount}</div>
            </div>
          </div>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="h-4 w-4 text-yellow-400" />
            <div className="ml-2">
              <div className="text-sm font-medium text-yellow-800">Warnings</div>
              <div className="text-lg font-bold text-yellow-600">{warningCount}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Error List */}
      <div className="space-y-2">
        {visibleErrors.map((error, index) => (
          <ErrorItem key={index} error={error} />
        ))}
      </div>

      {/* Expand/Collapse Button */}
      {hasMore && collapsible && (
        <div className="text-center">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="inline-flex items-center px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-800"
          >
            {isExpanded ? (
              <>
                <ChevronUpIcon className="h-4 w-4 mr-1" />
                Show Less
              </>
            ) : (
              <>
                <ChevronDownIcon className="h-4 w-4 mr-1" />
                Show {filteredErrors.length - maxVisible} More
              </>
            )}
          </button>
        </div>
      )}

      {/* Field Summary */}
      {Object.keys(errorsByField).length > 1 && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Issues by Field:</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {Object.entries(errorsByField).map(([field, fieldErrors]) => (
              <div key={field} className="text-sm">
                <span className="font-medium text-gray-700">{field}:</span>
                <span className="ml-1 text-gray-600">
                  {fieldErrors.length} issue{fieldErrors.length !== 1 ? 's' : ''}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Help Text */}
      <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
        <div className="flex">
          <InformationCircleIcon className="h-4 w-4 text-blue-400 mt-0.5" />
          <div className="ml-2 text-sm text-blue-700">
            <strong>Errors</strong> must be fixed before import. <strong>Warnings</strong> can be imported but may need attention.
          </div>
        </div>
      </div>
    </div>
  );
}

// Individual Error Item Component
function ErrorItem({ error }: { error: ValidationError }) {
  const isError = error.severity === 'error';
  
  return (
    <div className={`border rounded-md p-3 ${
      isError 
        ? 'bg-red-50 border-red-200' 
        : 'bg-yellow-50 border-yellow-200'
    }`}>
      <div className="flex items-start">
        {isError ? (
          <XCircleIcon className="h-4 w-4 text-red-400 mt-0.5 flex-shrink-0" />
        ) : (
          <ExclamationTriangleIcon className="h-4 w-4 text-yellow-400 mt-0.5 flex-shrink-0" />
        )}
        
        <div className="ml-2 flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <div className={`text-sm font-medium ${
              isError ? 'text-red-800' : 'text-yellow-800'
            }`}>
              Row {error.row} • {error.field}
            </div>
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
              isError 
                ? 'bg-red-100 text-red-800' 
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {error.severity}
            </span>
          </div>
          
          <div className={`text-sm mt-1 ${
            isError ? 'text-red-700' : 'text-yellow-700'
          }`}>
            {error.message}
          </div>
          
          {error.value && (
            <div className="text-xs text-gray-500 mt-1 font-mono bg-white px-2 py-1 rounded border">
              Value: "{error.value}"
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
