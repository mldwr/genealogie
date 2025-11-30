/**
 * Static coordinate mapping for Volga German colony locations.
 * 
 * This file provides lat/lng coordinates for historical locations found in the
 * deportation records database. Most locations are former German colonies in the
 * Volga region (now Saratov and Volgograd Oblasts, Russia).
 * 
 * The mapping uses normalized location names as keys to handle variations in
 * how locations are recorded (e.g., "Pallasovka", "s. Pallasovka", "Pallosovka").
 * 
 * Sources for coordinates:
 * - Center for Volga German Studies (cvgs.cu-portland.edu)
 * - GeoNames database
 * - Historical maps of Volga German colonies
 */

export interface Coordinates {
  lat: number;
  lng: number;
}

/**
 * Normalizes a location name for lookup in the coordinate map.
 * Handles common variations like "s. Pallasovka" → "pallasovka"
 */
export function normalizeLocationName(location: string): string {
  return location
    .toLowerCase()
    .trim()
    // Remove common prefixes: s. (selo), g. (gorod), c. (city)
    .replace(/^[sg]\.\s*/i, '')
    // Remove question marks and parenthetical notes
    .replace(/\([^)]*\)/g, '')
    .replace(/\?/g, '')
    // Normalize whitespace
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Static coordinate mapping for known locations.
 * 
 * Key = normalized location name (lowercase, without prefixes)
 * Value = { lat, lng } coordinates
 * 
 * Main clusters:
 * 1. Pallasovka area (50.0°N, 46.8°E) - Volgograd Oblast
 * 2. Saratov/Engels area (51.5°N, 46.0°E) - Saratov Oblast  
 * 3. Major cities (Leningrad, Moscow, Karaganda, etc.)
 */
export const LOCATION_COORDINATES: Record<string, Coordinates> = {
  // ============================================================================
  // PALLASOVKA REGION (Volgograd Oblast) - Main cluster
  // Most deportees originated from this area
  // ============================================================================
  'pallasovka': { lat: 50.0481, lng: 46.8797 },
  'pallosovka': { lat: 50.0481, lng: 46.8797 }, // Spelling variant
  
  // Neu-Weimar (New Weimar) - colony near Pallasovka
  'neu-weimar': { lat: 50.1167, lng: 46.8333 },
  'neu-weimar/pallasovka': { lat: 50.1167, lng: 46.8333 },
  'alt-weimar': { lat: 50.0833, lng: 46.8667 },
  'alt-weimar / pallasovka': { lat: 50.0833, lng: 46.8667 },
  
  // Savinka - colony in Pallasovka district
  'savinka': { lat: 50.1500, lng: 46.7500 },
  
  // Strasburg (Strassburg) - German colony
  'strasburg': { lat: 50.2000, lng: 46.9000 },
  
  // Other Pallasovka area colonies
  'neu-galka': { lat: 50.0000, lng: 46.7500 },
  'gmelinka': { lat: 50.1833, lng: 46.6500 },
  'bursy': { lat: 50.0667, lng: 46.9333 },
  
  // ============================================================================
  // KANTON MARIENTAL REGION
  // ============================================================================
  'kanton mariental': { lat: 50.6500, lng: 45.3500 },
  'gnadendorf': { lat: 50.7000, lng: 45.4000 },
  'gnadentau': { lat: 50.6833, lng: 45.3667 },
  
  // ============================================================================
  // KANTON SEELMANN REGION
  // ============================================================================
  'kanton seelmann': { lat: 51.2000, lng: 45.8000 },
  'seelmann': { lat: 51.2000, lng: 45.8000 },
  'wanburg': { lat: 51.1833, lng: 45.8333 },
  'wartenburg': { lat: 51.2167, lng: 45.7667 },
  
  // ============================================================================
  // ENGELS/MARXSTADT REGION (Saratov Oblast)
  // ============================================================================
  'engels': { lat: 51.4988, lng: 46.1183 },
  'marxstadt': { lat: 51.7167, lng: 46.2000 },
  'kanton marxstadt': { lat: 51.7167, lng: 46.2000 },
  'balzer': { lat: 51.5167, lng: 45.4000 },
  
  // ============================================================================
  // DOBRINKA REGION
  // ============================================================================
  'dobrinka': { lat: 51.7000, lng: 45.8667 },
  'kanton dobrinskij': { lat: 51.7000, lng: 45.8667 },
  'dobrino': { lat: 51.6833, lng: 45.8500 },
  'keller': { lat: 51.7167, lng: 45.8833 },
  
  // ============================================================================
  // KMILINKA/KMELENKO REGION (Gmelinka Kanton)
  // ============================================================================
  'kmilinka kanton': { lat: 50.1833, lng: 46.6500 },
  'kmelenko': { lat: 50.1833, lng: 46.6500 },
  'kanton gmelinskij': { lat: 50.1833, lng: 46.6500 },
  'blumen': { lat: 50.2000, lng: 46.6333 },
  'blumenfeld': { lat: 50.2167, lng: 46.6167 },
  'morgentau': { lat: 50.1667, lng: 46.6833 },
  'morgenau': { lat: 50.1667, lng: 46.6833 },
  'mohnfeld': { lat: 50.1500, lng: 46.7000 },
  
  // ============================================================================
  // OTHER VOLGA GERMAN COLONIES
  // ============================================================================
  'neu-schilling': { lat: 51.3833, lng: 45.9500 },
  'holstein': { lat: 51.5500, lng: 45.6000 },
  'norka': { lat: 51.0167, lng: 45.8000 },
  'hussenbach': { lat: 51.4500, lng: 45.4500 },
  'schwed': { lat: 51.3000, lng: 45.7500 },
  'ehrenfeld': { lat: 50.9500, lng: 45.9000 },
  'moor': { lat: 51.1000, lng: 45.6500 },
  'fischer': { lat: 51.7333, lng: 46.1833 },
  'paro': { lat: 51.7500, lng: 46.1500 },
  'boaro': { lat: 51.6500, lng: 46.0500 },
  'kano': { lat: 51.5833, lng: 45.9167 },
  'provindal': { lat: 51.2333, lng: 45.7833 },
  'prokindal': { lat: 51.2333, lng: 45.7833 },
  'vadjanka': { lat: 50.1000, lng: 46.6000 },
  'baranovka': { lat: 50.2500, lng: 46.5000 },
  'anisovka': { lat: 51.4667, lng: 46.0833 },
  'wiesenmüller': { lat: 50.9000, lng: 45.7000 },
  'lysanderhöh': { lat: 51.0500, lng: 45.8500 },
  
  // ============================================================================
  // MAJOR CITIES
  // ============================================================================
  'saratov': { lat: 51.5336, lng: 46.0349 },
  'kanton saratov': { lat: 51.5336, lng: 46.0349 },
  'tatischevo': { lat: 51.6833, lng: 45.4167 },
  'leningrad': { lat: 59.9343, lng: 30.3351 },
  'astrachan': { lat: 46.3497, lng: 48.0408 },
  'karaganda': { lat: 49.8019, lng: 73.1021 },
  'moskauer gebiet': { lat: 55.7558, lng: 37.6173 },
  'krasnojarskij krai': { lat: 56.0097, lng: 92.8525 },
  
  // ============================================================================
  // KSSR (Kazakh SSR) LOCATIONS
  // ============================================================================
  'kssr': { lat: 48.0196, lng: 66.9237 }, // General Kazakhstan
  'zhenbitin': { lat: 47.5000, lng: 67.5000 },
  'terektin': { lat: 47.8000, lng: 66.0000 },
  'bogdanovka': { lat: 47.6000, lng: 66.5000 },
  
  // ============================================================================
  // OTHER / FOREIGN
  // ============================================================================
  'amerika': { lat: 40.7128, lng: -74.0060 }, // New York as default
  'frankreich': { lat: 48.8566, lng: 2.3522 }, // Paris as default

  // ============================================================================
  // STALINGRAD OBLAST (now Volgograd Oblast)
  // ============================================================================
  'stalingrad oblast': { lat: 48.7080, lng: 44.5133 },
  'nikolaev rayon': { lat: 50.0000, lng: 45.0000 },

  // ============================================================================
  // KANTON KRASNOKUTSK REGION
  // ============================================================================
  'kanton krasnokutsk': { lat: 50.9500, lng: 46.9667 },
  'krasnokutsk': { lat: 50.9500, lng: 46.9667 },
};

/**
 * Attempts to find coordinates for a location name.
 * Uses fuzzy matching to handle variations in how locations are recorded.
 *
 * @param location - The location name from the database
 * @returns Coordinates if found, undefined otherwise
 */
export function getCoordinates(location: string): Coordinates | undefined {
  const normalized = normalizeLocationName(location);

  // Direct lookup
  if (LOCATION_COORDINATES[normalized]) {
    return LOCATION_COORDINATES[normalized];
  }

  // Try to find a partial match for compound location names
  // e.g., "Kanton Mariental, s. Sandal(?)" → try "kanton mariental"
  const parts = normalized.split(',').map(p => p.trim());
  for (const part of parts) {
    if (LOCATION_COORDINATES[part]) {
      return LOCATION_COORDINATES[part];
    }
  }

  // Try matching just the last word (often the actual place name)
  const words = normalized.split(' ');
  const lastWord = words[words.length - 1];
  if (lastWord && LOCATION_COORDINATES[lastWord]) {
    return LOCATION_COORDINATES[lastWord];
  }

  // Try matching without the last word if it looks like a suffix
  if (words.length > 1) {
    const withoutLast = words.slice(0, -1).join(' ');
    if (LOCATION_COORDINATES[withoutLast]) {
      return LOCATION_COORDINATES[withoutLast];
    }
  }

  return undefined;
}

/**
 * Returns all locations with their coordinates for debugging/verification.
 */
export function getAllKnownLocations(): Array<{ name: string; coordinates: Coordinates }> {
  return Object.entries(LOCATION_COORDINATES).map(([name, coordinates]) => ({
    name,
    coordinates,
  }));
}

/**
 * Default map center for the Volga German region.
 * Centered on the area between Saratov and Pallasovka.
 */
export const DEFAULT_MAP_CENTER: Coordinates = {
  lat: 50.5,
  lng: 46.0,
};

/**
 * Default zoom level to show the entire Volga region.
 */
export const DEFAULT_MAP_ZOOM = 6;

