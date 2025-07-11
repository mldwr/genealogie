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
        title: 'Import erfolgreich',
        description: `${result.importedCount} Datensätze erfolgreich importiert`
      });
    } else {
      toast({
        title: 'Import mit Problemen abgeschlossen',
        description: `${result.importedCount} importiert, ${result.errorCount} Fehler`,
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
              Zurück zu Deportationen
            </button>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">CSV-Datenimport</h1>
          <p className="mt-2 text-gray-600">
            Importieren Sie Deportationsdatensätze aus einer CSV-Datei mit Validierung und Konfliktlösung.
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
                  Deportationsdatensätze importieren
                </h2>
                <p className="mt-1 text-blue-100">
                  CSV-Daten mit unserem schrittweisen Assistenten hochladen und validieren
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
                <h3 className="text-lg font-medium text-gray-900 mb-2">Datenvalidierung</h3>
                <p className="text-sm text-gray-600">
                  Umfassende Validierung von Feldtypen, Pflichtfeldern und Geschäftsregeln
                </p>
              </div>

              <div className="text-center">
                <div className="mx-auto h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Konfliktlösung</h3>
                <p className="text-sm text-gray-600">
                  Behandlung doppelter Datensätze mit flexiblen Lösungsoptionen
                </p>
              </div>

              <div className="text-center">
                <div className="mx-auto h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <svg className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Schnelle Verarbeitung</h3>
                <p className="text-sm text-gray-600">
                  Effiziente Stapelverarbeitung mit Echtzeit-Fortschrittsverfolgung
                </p>
              </div>
            </div>

            {/* Requirements */}
            <div className="bg-gray-50 rounded-lg p-6 mb-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Dateianforderungen</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Format</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• CSV-Datei (.csv-Erweiterung)</li>
                    <li>• UTF-8-Kodierung</li>
                    <li>• Semikolon (;) als Trennzeichen</li>
                    <li>• Maximale Dateigröße 10MB</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Pflichtfelder</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Laufendenr (eindeutige Kennung)</li>
                    <li>• Alle anderen Felder sind optional</li>
                    <li>• Spaltenüberschriften müssen exakt der Vorlage entsprechen</li>
                    <li>• Leere Werte sind für optionale Felder erlaubt</li>
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
                CSV-Import starten
              </button>
            </div>
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-8 bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Benötigen Sie Hilfe?</h3>
          <div className="prose prose-sm text-gray-600">
            <p>
              Falls Sie Probleme mit dem CSV-Import haben, stellen Sie sicher, dass Ihre Datei dem erforderlichen Format entspricht.
              Sie können während des Importvorgangs eine Vorlagendatei herunterladen, die die korrekte Struktur zeigt.
            </p>
            <p className="mt-2">
              Der Importvorgang beinhaltet eine Validierung, um häufige Probleme wie fehlende Pflichtfelder,
              ungültige Datentypen und doppelte Datensätze zu erkennen. Alle Probleme werden klar erklärt mit
              Lösungsvorschlägen.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
