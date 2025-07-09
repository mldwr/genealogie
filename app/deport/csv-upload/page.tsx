'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';
import { useToast } from '@/components/ui/Toasts/use-toast';
import CsvUploadWizard from './components/CsvUploadWizard';
import { ImportResult } from './types/csvTypes';
import { ArrowLeftIcon, DocumentArrowUpIcon } from '@heroicons/react/24/outline';

export default function CsvUploadPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const [showWizard, setShowWizard] = useState(false);

  // Redirect if not authenticated
  if (!user) {
    router.push('/signin');
    return null;
  }

  const handleImportComplete = (result: ImportResult) => {
    if (result.success) {
      toast({
        title: 'Import Successful',
        description: `${result.importedCount} records imported successfully`
      });
    } else {
      toast({
        title: 'Import Completed with Issues',
        description: `${result.importedCount} imported, ${result.errorCount} errors`,
        variant: 'destructive'
      });
    }

    // Optionally redirect back to main table after successful import
    setTimeout(() => {
      router.push('/deport');
    }, 3000);
  };

  const handleCancel = () => {
    setShowWizard(false);
    router.push('/deport');
  };

  if (showWizard) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <CsvUploadWizard
            onComplete={handleImportComplete}
            onCancel={handleCancel}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <button
              onClick={() => router.push('/deport')}
              className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-1" />
              Back to Deportations
            </button>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">CSV Data Import</h1>
          <p className="mt-2 text-gray-600">
            Import deportation records from a CSV file with validation and conflict resolution.
          </p>
        </div>

        {/* Main Content */}
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          {/* Hero Section */}
          <div className="px-6 py-8 bg-gradient-to-r from-blue-500 to-blue-600">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <DocumentArrowUpIcon className="h-12 w-12 text-white" />
              </div>
              <div className="ml-4">
                <h2 className="text-2xl font-bold text-white">
                  Import Deportation Records
                </h2>
                <p className="mt-1 text-blue-100">
                  Upload and validate CSV data with our step-by-step wizard
                </p>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="px-6 py-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <div className="text-center">
                <div className="mx-auto h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Data Validation</h3>
                <p className="text-sm text-gray-600">
                  Comprehensive validation of field types, required values, and business rules
                </p>
              </div>

              <div className="text-center">
                <div className="mx-auto h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Conflict Resolution</h3>
                <p className="text-sm text-gray-600">
                  Handle duplicate records with flexible resolution options
                </p>
              </div>

              <div className="text-center">
                <div className="mx-auto h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <svg className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Fast Processing</h3>
                <p className="text-sm text-gray-600">
                  Efficient batch processing with real-time progress tracking
                </p>
              </div>
            </div>

            {/* Requirements */}
            <div className="bg-gray-50 rounded-lg p-6 mb-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4">File Requirements</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Format</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• CSV file (.csv extension)</li>
                    <li>• UTF-8 encoding</li>
                    <li>• Semicolon (;) separator</li>
                    <li>• Maximum 10MB file size</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Required Fields</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Laufendenr (unique identifier)</li>
                    <li>• All other fields are optional</li>
                    <li>• Headers must match template exactly</li>
                    <li>• Empty values allowed for optional fields</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Action Button */}
            <div className="text-center">
              <button
                onClick={() => setShowWizard(true)}
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <DocumentArrowUpIcon className="h-5 w-5 mr-2" />
                Start CSV Import
              </button>
            </div>
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-8 bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Need Help?</h3>
          <div className="prose prose-sm text-gray-600">
            <p>
              If you're having trouble with the CSV import, make sure your file follows the required format. 
              You can download a template file during the import process that shows the correct structure.
            </p>
            <p className="mt-2">
              The import process includes validation to catch common issues like missing required fields, 
              invalid data types, and duplicate records. All issues will be clearly explained with 
              suggestions for resolution.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
