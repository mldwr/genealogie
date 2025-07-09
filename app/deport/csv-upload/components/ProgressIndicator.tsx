'use client';

import React from 'react';

interface ProgressIndicatorProps {
  currentStep: 'upload' | 'preview' | 'validate' | 'import' | 'complete';
}

const steps = [
  { key: 'upload', label: 'File Upload', description: 'Select CSV file' },
  { key: 'preview', label: 'Preview', description: 'Review data' },
  { key: 'validate', label: 'Validate', description: 'Check for errors' },
  { key: 'import', label: 'Import', description: 'Process data' },
  { key: 'complete', label: 'Complete', description: 'Finished' }
];

export default function ProgressIndicator({ currentStep }: ProgressIndicatorProps) {
  const currentStepIndex = steps.findIndex(step => step.key === currentStep);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isActive = index === currentStepIndex;
          const isCompleted = index < currentStepIndex;
          const isUpcoming = index > currentStepIndex;

          return (
            <div key={step.key} className="flex items-center">
              {/* Step Circle */}
              <div className="flex items-center">
                <div
                  className={`
                    flex items-center justify-center w-8 h-8 rounded-full border-2 text-sm font-medium
                    ${isCompleted 
                      ? 'bg-green-600 border-green-600 text-white' 
                      : isActive 
                        ? 'bg-blue-600 border-blue-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-500'
                    }
                  `}
                >
                  {isCompleted ? (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </div>

                {/* Step Label */}
                <div className="ml-3 hidden sm:block">
                  <div
                    className={`
                      text-sm font-medium
                      ${isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-500'}
                    `}
                  >
                    {step.label}
                  </div>
                  <div className="text-xs text-gray-400">
                    {step.description}
                  </div>
                </div>
              </div>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div
                  className={`
                    flex-1 h-0.5 mx-4
                    ${index < currentStepIndex ? 'bg-green-600' : 'bg-gray-300'}
                  `}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Mobile Step Labels */}
      <div className="mt-4 sm:hidden">
        <div className="text-center">
          <div
            className={`
              text-sm font-medium
              ${currentStep === 'complete' ? 'text-green-600' : 'text-blue-600'}
            `}
          >
            {steps[currentStepIndex]?.label}
          </div>
          <div className="text-xs text-gray-400">
            {steps[currentStepIndex]?.description}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Step {currentStepIndex + 1} of {steps.length}
          </div>
        </div>
      </div>
    </div>
  );
}
