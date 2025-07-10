'use client';

import React, { useState, useEffect } from 'react';
import { ParsedCsvData } from '../types/csvTypes';
import { ChevronLeftIcon, ChevronRightIcon, EyeIcon } from '@heroicons/react/24/outline';

interface PreviewStepProps {
  parsedData: ParsedCsvData;
  onNext: () => void;
  onPrevious: () => void;
  isProcessing: boolean;
}

const ROWS_PER_PAGE = 10;

// Create a client-only wrapper component
function PreviewStepClient({ parsedData, onNext, onPrevious, isProcessing }: PreviewStepProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [showAllColumns, setShowAllColumns] = useState(false);

  const totalPages = Math.ceil(parsedData.rows.length / ROWS_PER_PAGE);
  const startIndex = (currentPage - 1) * ROWS_PER_PAGE;
  const endIndex = Math.min(startIndex + ROWS_PER_PAGE, parsedData.rows.length);
  const currentRows = parsedData.rows.slice(startIndex, endIndex);

  // Determine which columns to show
  const displayHeaders = showAllColumns 
    ? parsedData.headers 
    : parsedData.headers.slice(0, 6); // Show first 6 columns by default

  const handlePreviousPage = () => {
    setCurrentPage(prev => Math.max(1, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(totalPages, prev + 1));
  };

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
        <div className="flex items-center">
          <EyeIcon className="h-5 w-5 text-blue-400" />
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">
              Data Preview
            </h3>
            <div className="mt-1 text-sm text-blue-700">
              Found {parsedData.totalRows} rows with {parsedData.headers.length} columns
            </div>
          </div>
        </div>
      </div>

      {/* Column Toggle */}
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-600">
          Showing {startIndex + 1}-{endIndex} of {parsedData.totalRows} rows
        </div>
        <button
          onClick={() => setShowAllColumns(!showAllColumns)}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          {showAllColumns ? 'Show fewer columns' : `Show all ${parsedData.headers.length} columns`}
        </button>
      </div>

      {/* Data Table */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Row
                </th>
                {displayHeaders.map((header, index) => (
                  <th
                    key={index}
                    className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {header}
                  </th>
                ))}
                {!showAllColumns && parsedData.headers.length > 6 && (
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ... (+{parsedData.headers.length - 6} more)
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentRows.map((row, rowIndex) => (
                <tr key={startIndex + rowIndex} className="hover:bg-gray-50">
                  <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {startIndex + rowIndex + 1}
                  </td>
                  {displayHeaders.map((header, colIndex) => (
                    <td
                      key={colIndex}
                      className="px-3 py-4 whitespace-nowrap text-sm text-gray-900"
                    >
                      <div className="max-w-32 truncate" title={row[header] || ''}>
                        {row[header] || <span className="text-gray-400">—</span>}
                      </div>
                    </td>
                  ))}
                  {!showAllColumns && parsedData.headers.length > 6 && (
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-400">
                      ...
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex space-x-2">
            <button
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
              className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeftIcon className="h-4 w-4 mr-1" />
              Previous
            </button>
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
              <ChevronRightIcon className="h-4 w-4 ml-1" />
            </button>
          </div>
        </div>
      )}

      {/* Headers Summary */}
      <div className="bg-gray-50 rounded-md p-4">
        <h4 className="text-sm font-medium text-gray-900 mb-2">
          Detected Headers ({parsedData.headers.length}):
        </h4>
        <div className="flex flex-wrap gap-2">
          {parsedData.headers.map((header, index) => (
            <span
              key={index}
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
            >
              {header}
            </span>
          ))}
        </div>
      </div>

      {/* Data Quality Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-sm font-medium text-gray-900">Total Rows</div>
          <div className="text-2xl font-bold text-blue-600">{parsedData.totalRows}</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-sm font-medium text-gray-900">Columns</div>
          <div className="text-2xl font-bold text-green-600">{parsedData.headers.length}</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-sm font-medium text-gray-900">Empty Cells</div>
          <div className="text-2xl font-bold text-yellow-600">
            {parsedData.rows.reduce((count, row) => {
              return count + parsedData.headers.filter(header => !row[header] || row[header].trim() === '').length;
            }, 0)}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between">
        <button
          onClick={onPrevious}
          disabled={isProcessing}
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeftIcon className="h-4 w-4 mr-2" />
          Back to Upload
        </button>
        <button
          onClick={onNext}
          disabled={isProcessing}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isProcessing ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Validating...
            </>
          ) : (
            <>
              Validate Data
              <ChevronRightIcon className="h-4 w-4 ml-2" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}

// Main export with client-only wrapper
export default function PreviewStep(props: PreviewStepProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return <div>Loading...</div>;
  }

  return <PreviewStepClient {...props} />;
}
