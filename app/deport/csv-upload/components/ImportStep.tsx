'use client';

import React from 'react';

interface ImportStepProps {
  progress: number;
  message: string;
  isProcessing: boolean;
}

export default function ImportStep({ progress, message, isProcessing }: ImportStepProps) {
  return (
    <div className="flex flex-col items-center justify-center space-y-6 py-12">
      {/* Progress Circle */}
      <div className="relative w-32 h-32">
        <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
          {/* Background circle */}
          <circle
            cx="60"
            cy="60"
            r="54"
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            className="text-gray-200"
          />
          {/* Progress circle */}
          <circle
            cx="60"
            cy="60"
            r="54"
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            strokeDasharray={`${2 * Math.PI * 54}`}
            strokeDashoffset={`${2 * Math.PI * 54 * (1 - progress / 100)}`}
            className="text-blue-600 transition-all duration-300 ease-in-out"
            strokeLinecap="round"
          />
        </svg>
        {/* Progress percentage */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-bold text-blue-600">
            {Math.round(progress)}%
          </span>
        </div>
      </div>

      {/* Status Message */}
      <div className="text-center">
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {isProcessing ? 'Daten werden importiert...' : 'Import abgeschlossen'}
        </h3>
        <p className="text-sm text-gray-600">
          {message || 'Ihre CSV-Daten werden verarbeitet...'}
        </p>
      </div>

      {/* Progress Bar (Alternative/Additional) */}
      <div className="w-full max-w-md">
        <div className="bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-in-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>0%</span>
          <span>100%</span>
        </div>
      </div>

      {/* Animated Spinner (when processing) */}
      {isProcessing && (
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          <span className="text-sm text-gray-500">Bitte warten...</span>
        </div>
      )}

      {/* Import Steps Indicator */}
      <div className="bg-gray-50 rounded-lg p-4 w-full max-w-md">
        <h4 className="text-sm font-medium text-gray-900 mb-3">Importvorgang:</h4>
        <div className="space-y-2">
          {[
            { step: 'Daten validieren', completed: progress > 10 },
            { step: 'Konflikte prüfen', completed: progress > 30 },
            { step: 'Datensätze erstellen', completed: progress > 60 },
            { step: 'Import abschließen', completed: progress > 90 }
          ].map((item, index) => (
            <div key={index} className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${
                item.completed ? 'bg-green-500' : 'bg-gray-300'
              }`} />
              <span className={`text-xs ${
                item.completed ? 'text-green-700' : 'text-gray-500'
              }`}>
                {item.step}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Warning Message */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 max-w-md">
        <div className="flex">
          <div className="ml-3">
            <p className="text-sm text-yellow-700">
              Bitte schließen Sie dieses Fenster nicht und navigieren Sie nicht weg während des Importvorgangs.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
