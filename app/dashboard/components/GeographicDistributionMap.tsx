'use client';

import { useState, useMemo, useEffect } from 'react';
import { MapPinIcon, BriefcaseIcon, ListBulletIcon, MapIcon } from '@heroicons/react/24/outline';
import dynamic from 'next/dynamic';
import { GeographicDistributionData, LocationData } from '../data';
import {
  getCoordinates,
  DEFAULT_MAP_CENTER,
  DEFAULT_MAP_ZOOM,
  Coordinates,
} from '../lib/locationCoordinates';

// Dynamic import of Leaflet components to avoid SSR issues
// Leaflet requires window/document which aren't available on the server
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);
const CircleMarker = dynamic(
  () => import('react-leaflet').then((mod) => mod.CircleMarker),
  { ssr: false }
);
const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
);
const Tooltip = dynamic(
  () => import('react-leaflet').then((mod) => mod.Tooltip),
  { ssr: false }
);

interface GeographicDistributionMapProps {
  data: GeographicDistributionData;
}

/**
 * LocationWithCoords: Extended location data with resolved coordinates.
 */
interface LocationWithCoords extends LocationData {
  coords: Coordinates;
}

/**
 * COLOR_SCHEMES: Color configurations for birthplaces (blue) and workplaces (green).
 *
 * Design rationale:
 * - Blue tones for birthplaces: Represents origin/beginnings
 * - Green tones for workplaces: Represents work/productivity
 */
const COLOR_SCHEMES = {
  birthplace: {
    primary: '#3b82f6',    // blue-500
    secondary: '#dbeafe',  // blue-100
    border: '#2563eb',     // blue-600
    gradient: 'from-blue-500 to-blue-600',
    bgLight: 'bg-blue-50',
    textLight: 'text-blue-700',
    badgeBg: 'bg-blue-100',
    markerFill: '#3b82f6',
    markerStroke: '#1d4ed8',
  },
  workplace: {
    primary: '#22c55e',    // green-500
    secondary: '#dcfce7',  // green-100
    border: '#16a34a',     // green-600
    gradient: 'from-green-500 to-green-600',
    bgLight: 'bg-green-50',
    textLight: 'text-green-700',
    badgeBg: 'bg-green-100',
    markerFill: '#22c55e',
    markerStroke: '#15803d',
  },
};

/**
 * LocationListView: Table-based visualization of location data.
 * Used as fallback when map view is disabled or for showing unmapped locations.
 */
function LocationListView({
  locations,
  type,
  maxItems = 15,
}: {
  locations: LocationData[];
  type: 'birthplace' | 'workplace';
  maxItems?: number;
}) {
  const colors = COLOR_SCHEMES[type];
  const displayLocations = locations.slice(0, maxItems);
  const maxCount = Math.max(...locations.map((l) => l.count), 1);

  if (locations.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-500">
        {type === 'birthplace' ? 'Keine Geburtsorte verfügbar' : 'Keine Arbeitsorte verfügbar'}
      </div>
    );
  }

  return (
    <div className="space-y-2 max-h-[400px] overflow-y-auto">
      {displayLocations.map((loc, index) => {
        const percentage = (loc.count / maxCount) * 100;
        const hasCoords = !!getCoordinates(loc.location);
        return (
          <div key={loc.location} className="relative">
            {/* Background bar showing relative count */}
            <div
              className={`absolute inset-0 rounded-lg opacity-30 ${colors.bgLight}`}
              style={{ width: `${percentage}%` }}
            />
            <div className="relative flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400 w-6">#{index + 1}</span>
                <span className="font-medium text-gray-800">{loc.location}</span>
                {!hasCoords && (
                  <span className="text-xs text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
                    nicht kartiert
                  </span>
                )}
              </div>
              <span className={`text-sm font-semibold ${colors.textLight} ${colors.badgeBg} px-2 py-0.5 rounded-full`}>
                {loc.count} {loc.count === 1 ? 'Person' : 'Personen'}
              </span>
            </div>
          </div>
        );
      })}
      {locations.length > maxItems && (
        <div className="text-center text-sm text-gray-500 pt-2">
          ... und {locations.length - maxItems} weitere Standorte
        </div>
      )}
    </div>
  );
}

/**
 * InteractiveMap: Leaflet map component with circle markers.
 * Marker size is proportional to person count.
 */
function InteractiveMap({
  locations,
  type,
}: {
  locations: LocationWithCoords[];
  type: 'birthplace' | 'workplace';
}) {
  const [isClient, setIsClient] = useState(false);
  const colors = COLOR_SCHEMES[type];
  const maxCount = Math.max(...locations.map((l) => l.count), 1);

  // Ensure we only render on client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className="h-[400px] bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-gray-500">Karte wird geladen...</div>
      </div>
    );
  }

  // Calculate marker radius based on count (min 6, max 30)
  const getRadius = (count: number) => {
    const minRadius = 6;
    const maxRadius = 30;
    const ratio = count / maxCount;
    return minRadius + ratio * (maxRadius - minRadius);
  };

  return (
    <div className="h-[400px] rounded-lg overflow-hidden border border-gray-200">
      <MapContainer
        center={[DEFAULT_MAP_CENTER.lat, DEFAULT_MAP_CENTER.lng]}
        zoom={DEFAULT_MAP_ZOOM}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {locations.map((loc) => (
          <CircleMarker
            key={loc.location}
            center={[loc.coords.lat, loc.coords.lng]}
            radius={getRadius(loc.count)}
            pathOptions={{
              fillColor: colors.markerFill,
              fillOpacity: 0.7,
              color: colors.markerStroke,
              weight: 2,
            }}
          >
            <Tooltip direction="top" offset={[0, -10]} permanent={false}>
              <div className="text-center">
                <div className="font-semibold">{loc.location}</div>
                <div className="text-sm">
                  {loc.count} {loc.count === 1 ? 'Person' : 'Personen'}
                </div>
              </div>
            </Tooltip>
            <Popup>
              <div className="text-center min-w-[120px]">
                <div className="font-bold text-base">{loc.location}</div>
                <div className="text-sm text-gray-600 mt-1">
                  {type === 'birthplace' ? 'Geburtsort' : 'Arbeitsort'}
                </div>
                <div className="text-lg font-semibold mt-2" style={{ color: colors.primary }}>
                  {loc.count} {loc.count === 1 ? 'Person' : 'Personen'}
                </div>
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}

/**
 * GeographicDistributionMap: Main component for displaying geographic distribution.
 *
 * Features:
 * - Interactive Leaflet map with circle markers
 * - Toggle between birthplaces (Geburtsort) and workplaces (Arbeitsort)
 * - Toggle between map and list views
 * - Marker size proportional to person count
 * - Popups/tooltips with location details
 * - Summary statistics
 */
export default function GeographicDistributionMap({ data }: GeographicDistributionMapProps) {
  // State for toggling between birthplace and workplace view
  const [viewType, setViewType] = useState<'birthplace' | 'workplace'>('birthplace');
  // State for toggling between map and list view
  const [displayMode, setDisplayMode] = useState<'map' | 'list'>('map');

  // Get current dataset based on toggle state
  const currentLocations = viewType === 'birthplace' ? data.birthplaces : data.workplaces;
  const colors = COLOR_SCHEMES[viewType];

  // Separate locations into mapped and unmapped
  const { mappedLocations, unmappedLocations, mappedPersonCount, unmappedPersonCount } = useMemo(() => {
    const mapped: LocationWithCoords[] = [];
    const unmapped: LocationData[] = [];
    let mappedCount = 0;
    let unmappedCount = 0;

    currentLocations.forEach((loc) => {
      const coords = getCoordinates(loc.location);
      if (coords) {
        mapped.push({ ...loc, coords });
        mappedCount += loc.count;
      } else {
        unmapped.push(loc);
        unmappedCount += loc.count;
      }
    });

    return {
      mappedLocations: mapped,
      unmappedLocations: unmapped,
      mappedPersonCount: mappedCount,
      unmappedPersonCount: unmappedCount,
    };
  }, [currentLocations]);

  // Calculate statistics
  const stats = useMemo(() => {
    const topLocation = currentLocations[0];
    const totalPersonsInView = currentLocations.reduce((sum, loc) => sum + loc.count, 0);
    return {
      topLocation: topLocation?.location || '-',
      topCount: topLocation?.count || 0,
      uniqueLocations: currentLocations.length,
      totalPersons: totalPersonsInView,
      mappedLocations: mappedLocations.length,
      unmappedLocations: unmappedLocations.length,
    };
  }, [currentLocations, mappedLocations, unmappedLocations]);

  // Empty state when no location data at all
  if (data.birthplaces.length === 0 && data.workplaces.length === 0) {
    return (
      <div className="rounded-xl bg-white p-6 shadow-md border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Geografische Verteilung</h3>
        <div className="flex items-center justify-center h-64 text-gray-500">
          <div className="text-center">
            <MapPinIcon className="h-12 w-12 mx-auto mb-2 text-gray-400" />
            <p>Keine Standortdaten verfügbar</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-white p-6 shadow-md border border-gray-100">
      {/* Header with title and toggles */}
      <div className="mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Geografische Verteilung</h3>
            <p className="text-sm text-gray-500 mt-1">
              {displayMode === 'map'
                ? `${stats.mappedLocations} von ${stats.uniqueLocations} Orten auf der Karte`
                : `Alle ${stats.uniqueLocations} Orte`}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {/* Display mode toggle (map/list) */}
            <div className="flex rounded-lg bg-gray-100 p-1">
              <button
                onClick={() => setDisplayMode('map')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  displayMode === 'map'
                    ? 'bg-white shadow text-gray-800'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <MapIcon className="h-4 w-4" />
                Karte
              </button>
              <button
                onClick={() => setDisplayMode('list')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  displayMode === 'list'
                    ? 'bg-white shadow text-gray-800'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <ListBulletIcon className="h-4 w-4" />
                Liste
              </button>
            </div>

            {/* Birthplace/Workplace toggle */}
            <div className="flex rounded-lg bg-gray-100 p-1">
              <button
                onClick={() => setViewType('birthplace')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  viewType === 'birthplace'
                    ? 'bg-white shadow text-blue-600'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <MapPinIcon className="h-4 w-4" />
                Geburtsort
              </button>
              <button
                onClick={() => setViewType('workplace')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  viewType === 'workplace'
                    ? 'bg-white shadow text-green-600'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <BriefcaseIcon className="h-4 w-4" />
                Arbeitsort
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="mb-4 flex flex-wrap gap-4 text-xs">
        {displayMode === 'map' ? (
          <>
            <div className="flex items-center gap-1.5">
              <div
                className="w-4 h-4 rounded-full"
                style={{
                  backgroundColor: colors.markerFill,
                  border: `2px solid ${colors.markerStroke}`,
                }}
              />
              <span>
                {viewType === 'birthplace' ? 'Geburtsort' : 'Arbeitsort'} (Größe = Personenanzahl)
              </span>
            </div>
            {unmappedLocations.length > 0 && (
              <div className="flex items-center gap-1.5 text-amber-600">
                <span className="text-xs bg-amber-50 px-1.5 py-0.5 rounded">
                  {unmappedLocations.length} Orte nicht kartiert ({unmappedPersonCount} Personen)
                </span>
              </div>
            )}
          </>
        ) : (
          <div className="flex items-center gap-1.5">
            <div
              className="w-4 h-4 rounded"
              style={{
                backgroundColor: colors.secondary,
                border: `2px solid ${colors.primary}`,
              }}
            />
            <span>
              {viewType === 'birthplace' ? 'Geburtsort' : 'Arbeitsort'} (Balkenbreite = relative Häufigkeit)
            </span>
          </div>
        )}
      </div>

      {/* Main content: Map or List view */}
      {displayMode === 'map' ? (
        <InteractiveMap locations={mappedLocations} type={viewType} />
      ) : (
        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50/50">
          <LocationListView
            locations={currentLocations}
            type={viewType}
            maxItems={20}
          />
        </div>
      )}

      {/* Summary Statistics Footer */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-xs text-gray-500">Eindeutige Orte</p>
            <p className="text-lg font-semibold text-gray-900">{stats.uniqueLocations}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Erfasste Personen</p>
            <p className="text-lg font-semibold text-gray-900">{stats.totalPersons}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Häufigster Ort</p>
            <p className="text-lg font-semibold text-gray-900 truncate" title={stats.topLocation}>
              {stats.topLocation}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Max. Anzahl</p>
            <p className="text-lg font-semibold text-gray-900">{stats.topCount}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

