import { unstable_noStore as noStore } from 'next/cache';
import { createClient } from '@/utils/supabase/server';
import type { BirthYearTimelineData, HistoricalEvent } from './types';

// Re-export types from types.ts for backward compatibility
export type { BirthYearTimelineData, HistoricalEvent } from './types';

export interface AgeDistributionData {
  ageRange: string;
  count: number;
}

export interface PersonDetails {
  name: string;
  age: number;
  birthYear: string;
  birthPlace: string | null;
  familyRole: string | null;
}

export interface FamilyNameStatistic {
  familyName: string;
  count: number;
}

const DEPORTATION_YEAR = 1941;

/**
 * Fetch age distribution data grouped into age ranges
 */
export async function fetchAgeDistribution(): Promise<AgeDistributionData[]> {
  noStore();

  try {
    const supabase = await createClient();
    
    // Fetch all persons with valid birth years
    const { data, error } = await supabase
      .from('deport')
      .select('Geburtsjahr')
      .is('valid_to', null) // Only current records
      .not('Geburtsjahr', 'is', null);

    if (error) throw error;

    // Calculate ages and group into bins
    const ageBins: { [key: string]: number } = {
      '0-10': 0,
      '11-20': 0,
      '21-30': 0,
      '31-40': 0,
      '41-50': 0,
      '51-60': 0,
      '61-70': 0,
      '71-80': 0,
      '81+': 0,
    };

    data?.forEach((person) => {
      const birthYear = parseInt(person.Geburtsjahr || '');
      if (!isNaN(birthYear) && birthYear > 1800 && birthYear < DEPORTATION_YEAR) {
        const age = DEPORTATION_YEAR - birthYear;
        
        if (age <= 10) ageBins['0-10']++;
        else if (age <= 20) ageBins['11-20']++;
        else if (age <= 30) ageBins['21-30']++;
        else if (age <= 40) ageBins['31-40']++;
        else if (age <= 50) ageBins['41-50']++;
        else if (age <= 60) ageBins['51-60']++;
        else if (age <= 70) ageBins['61-70']++;
        else if (age <= 80) ageBins['71-80']++;
        else ageBins['81+']++;
      }
    });

    // Convert to array format for Recharts
    return Object.entries(ageBins).map(([ageRange, count]) => ({
      ageRange,
      count,
    }));
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch age distribution.');
  }
}

/**
 * Fetch the youngest person at time of deportation
 */
export async function fetchYoungestPerson(): Promise<PersonDetails | null> {
  noStore();

  try {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('deport')
      .select('Vorname, Familienname, Geburtsjahr, Geburtsort, Familienrolle')
      .is('valid_to', null)
      .not('Geburtsjahr', 'is', null)
      .order('Geburtsjahr', { ascending: false })
      .limit(1);

    if (error) throw error;
    if (!data || data.length === 0) return null;

    const person = data[0];
    const birthYear = parseInt(person.Geburtsjahr || '');
    const age = DEPORTATION_YEAR - birthYear;

    return {
      name: `${person.Vorname || ''} ${person.Familienname || ''}`.trim(),
      age,
      birthYear: person.Geburtsjahr || '',
      birthPlace: person.Geburtsort,
      familyRole: person.Familienrolle,
    };
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch youngest person.');
  }
}

/**
 * Fetch the oldest person at time of deportation
 */
export async function fetchOldestPerson(): Promise<PersonDetails | null> {
  noStore();

  try {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('deport')
      .select('Vorname, Familienname, Geburtsjahr, Geburtsort, Familienrolle')
      .is('valid_to', null)
      .not('Geburtsjahr', 'is', null)
      .order('Geburtsjahr', { ascending: true })
      .limit(1);

    if (error) throw error;
    if (!data || data.length === 0) return null;

    const person = data[0];
    const birthYear = parseInt(person.Geburtsjahr || '');
    const age = DEPORTATION_YEAR - birthYear;

    return {
      name: `${person.Vorname || ''} ${person.Familienname || ''}`.trim(),
      age,
      birthYear: person.Geburtsjahr || '',
      birthPlace: person.Geburtsort,
      familyRole: person.Familienrolle,
    };
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch oldest person.');
  }
}

/**
 * Calculate average number of children per family
 */
export async function fetchAverageChildren(): Promise<number> {
  noStore();

  try {
    const supabase = await createClient();

    // Fetch all persons with family numbers
    const { data, error } = await supabase
      .from('deport')
      .select('Familiennr, Familienrolle')
      .is('valid_to', null)
      .not('Familiennr', 'is', null)
      .not('Familienrolle', 'is', null);

    if (error) throw error;
    if (!data || data.length === 0) return 0;

    // Count children per family
    const familyChildrenCount: { [key: number]: number } = {};

    data.forEach((person) => {
      const familyNr = person.Familiennr;
      const role = person.Familienrolle?.toLowerCase();

      if (familyNr && (role === 'sohn' || role === 'tochter')) {
        familyChildrenCount[familyNr] = (familyChildrenCount[familyNr] || 0) + 1;
      }
    });

    // Get unique families (not just those with children)
    const uniqueFamilies = new Set(data.map(p => p.Familiennr).filter(Boolean));
    const totalFamilies = uniqueFamilies.size;

    if (totalFamilies === 0) return 0;

    // Calculate average
    const totalChildren = Object.values(familyChildrenCount).reduce((sum, count) => sum + count, 0);
    return Math.round((totalChildren / totalFamilies) * 10) / 10; // Round to 1 decimal
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch average children.');
  }
}

/**
 * Fetch family name statistics sorted by frequency
 */
export async function fetchFamilyNameStatistics(): Promise<FamilyNameStatistic[]> {
  noStore();

  try {
    const supabase = await createClient();

    // Fetch all persons with family names
    const { data, error } = await supabase
      .from('deport')
      .select('Familienname')
      .is('valid_to', null)
      .not('Familienname', 'is', null);

    if (error) throw error;
    if (!data || data.length === 0) return [];

    // Count occurrences of each family name
    const nameCount: { [key: string]: number } = {};

    data.forEach((person) => {
      const name = person.Familienname?.trim();
      if (name) {
        nameCount[name] = (nameCount[name] || 0) + 1;
      }
    });

    // Convert to array and sort by count (descending)
    return Object.entries(nameCount)
      .map(([familyName, count]) => ({
        familyName,
        count,
      }))
      .sort((a, b) => b.count - a.count);
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch family name statistics.');
  }
}

/**
 * Fetch total count of persons
 */
export async function fetchTotalPersons(): Promise<number> {
  noStore();

  try {
    const supabase = await createClient();

    const { count, error } = await supabase
      .from('deport')
      .select('*', { count: 'exact', head: true })
      .is('valid_to', null);

    if (error) throw error;

    return count || 0;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch total persons.');
  }
}

// =============================================================================
// Family Structure Types for React Flow Network Visualization
// =============================================================================
// These types define the data structure for the interactive family network
// diagram component (FamilyStructureChart). The structure is optimized for
// React Flow's node-based rendering model.

/**
 * FamilyMember: Represents a single person within a family group.
 *
 * Fields are intentionally nullable to handle incomplete historical records
 * from the deportation database. The id field is required as it serves as
 * the unique node identifier in React Flow.
 */
export interface FamilyMember {
  id: string;                    // Unique identifier (maps to deport.id), used as React Flow node id
  Vorname: string | null;        // First name, displayed in node label
  Familienname: string | null;   // Family surname, used for family group naming
  Familienrolle: string | null;  // Role: Familienoberhaupt, Ehefrau, Sohn, Tochter - determines node color
  Geschlecht: string | null;     // Gender: männlich/weiblich - determines gender icon
  Geburtsjahr: string | null;    // Birth year, used for sorting children and display
  Familiennr: number | null;     // Family number - links members to their family group
}

/**
 * FamilyGroup: Represents a family unit with all its members.
 *
 * Groups persons by their shared Familiennr. The familienname is derived
 * from the first member's surname (typically the Familienoberhaupt).
 * Members are pre-sorted: parents first, then children by birth year.
 */
export interface FamilyGroup {
  familiennr: number;           // Unique family identifier from the source data
  familienname: string;         // Display name for the family (e.g., "Schmidt")
  members: FamilyMember[];      // Array of family members, sorted by role and age
}

/**
 * FamilyStructureData: Root data structure returned by fetchFamilyStructureData().
 *
 * Contains all information needed to render the family network visualization:
 * - families: Array of family groups for creating React Flow nodes
 * - totalFamilies: Count for statistics display
 * - totalMembers: Count for statistics display
 */
export interface FamilyStructureData {
  families: FamilyGroup[];
  totalFamilies: number;
  totalMembers: number;
}

/**
 * fetchFamilyStructureData: Fetches and processes family data for network visualization.
 *
 * This function queries the deport table, groups persons by their Familiennr,
 * and returns a structured format optimized for the React Flow visualization.
 *
 * Query Logic:
 * - valid_to IS NULL: Only fetch current/active records (historization pattern)
 * - Familiennr NOT NULL: Only persons with assigned family numbers can be visualized
 * - Ordered by Familiennr for efficient grouping
 *
 * @returns FamilyStructureData with families array and aggregate counts
 */
export async function fetchFamilyStructureData(): Promise<FamilyStructureData> {
  // noStore() prevents caching - ensures fresh data on each request
  // Important for dashboard that should reflect current database state
  noStore();

  try {
    const supabase = await createClient();

    // Query the deport table for persons with family assignments
    // Select only the fields needed for visualization to minimize data transfer
    const { data, error } = await supabase
      .from('deport')
      .select('id, Vorname, Familienname, Familienrolle, Geschlecht, Geburtsjahr, Familiennr')
      // valid_to IS NULL: Historization filter - only current records
      // When a record is updated, the old version gets a valid_to timestamp,
      // so null indicates the current/active version
      .is('valid_to', null)
      // Familiennr NOT NULL: Only include persons assigned to a family
      // Orphan records without family numbers cannot be visualized in the network
      .not('Familiennr', 'is', null)
      // Primary sort by Familiennr groups family members together in the result
      .order('Familiennr', { ascending: true })
      // Secondary sort by Familienrolle helps with consistent ordering
      .order('Familienrolle', { ascending: true });

    if (error) throw error;

    // Handle empty dataset gracefully
    if (!data || data.length === 0) {
      return { families: [], totalFamilies: 0, totalMembers: 0 };
    }

    // Grouping Algorithm: Use Map to organize persons by Familiennr
    // Map<familiennr, FamilyMember[]> provides O(1) lookup and efficient grouping
    const familyMap = new Map<number, FamilyMember[]>();

    data.forEach((person) => {
      const familiennr = person.Familiennr;
      // Skip records without id or Familiennr
      // id is required as it becomes the React Flow node identifier
      // Double-check Familiennr even though query filtered - defensive coding
      if (familiennr !== null && person.id !== null) {
        // Initialize array for new family numbers
        if (!familyMap.has(familiennr)) {
          familyMap.set(familiennr, []);
        }
        // Add person to their family's member array
        familyMap.get(familiennr)!.push({
          id: person.id,
          Vorname: person.Vorname,
          Familienname: person.Familienname,
          Familienrolle: person.Familienrolle,
          Geschlecht: person.Geschlecht,
          Geburtsjahr: person.Geburtsjahr,
          Familiennr: person.Familiennr,
        });
      }
    });

    // Convert Map to array of FamilyGroup objects
    const families: FamilyGroup[] = [];
    familyMap.forEach((members, familiennr) => {
      // Sorting Logic: Arrange family members in hierarchical display order
      // 1. Familienoberhaupt (head of household) - displayed top-left
      // 2. Ehefrau (wife) - displayed top-right
      // 3. Children (Sohn/Tochter) - displayed below parents, sorted by birth year
      const sortedMembers = members.sort((a, b) => {
        // Define role priority (lower number = higher priority)
        const roleOrder: Record<string, number> = {
          'Familienoberhaupt': 1,  // Head of household first
          'Ehefrau': 2,            // Wife second
          'Sohn': 3,               // Sons and daughters share same priority
          'Tochter': 3,
        };
        const roleA = roleOrder[a.Familienrolle || ''] || 99; // Unknown roles last
        const roleB = roleOrder[b.Familienrolle || ''] || 99;

        // Primary sort: by role priority
        if (roleA !== roleB) return roleA - roleB;

        // Secondary sort (for same role, i.e., children): by birth year
        // This orders siblings from oldest to youngest
        const yearA = parseInt(a.Geburtsjahr || '9999'); // Unknown years sort last
        const yearB = parseInt(b.Geburtsjahr || '9999');
        return yearA - yearB;
      });

      // Determining the family name:
      // Use the surname of the first member (after sorting, this is the Familienoberhaupt)
      // This ensures the family is named after the head of household
      families.push({
        familiennr,
        familienname: sortedMembers[0]?.Familienname || 'Unbekannt',
        members: sortedMembers,
      });
    });

    // Sort families by familiennr for consistent display order
    // This ensures families appear in the same order across page refreshes
    families.sort((a, b) => a.familiennr - b.familiennr);

    return {
      families,
      totalFamilies: families.length,
      totalMembers: data.length, // Use original data length (before grouping)
    };
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch family structure data.');
  }
}

// =============================================================================
// Geographic Distribution Types for Map Visualization
// =============================================================================
// These types define the data structure for the interactive geographic map
// component (GeographicDistributionMap). The structure separates birthplace
// and workplace locations for toggle filtering.

/**
 * LocationData: Represents a single location with its occurrence count.
 *
 * The location name comes from the database fields Geburtsort (birthplace)
 * or Arbeitsort (workplace). Coordinates are optional and would require
 * geocoding to convert place names to lat/lng values.
 */
export interface LocationData {
  location: string;           // Location name (city/town)
  count: number;              // Number of persons at this location
  coordinates?: {             // Optional geocoded coordinates for map display
    lat: number;
    lng: number;
  };
}

/**
 * GeographicDistributionData: Root data structure returned by fetchGeographicDistributionData().
 *
 * Contains separate arrays for birthplaces and workplaces, allowing the UI
 * to toggle between them. Includes aggregate statistics for display.
 */
export interface GeographicDistributionData {
  birthplaces: LocationData[];   // Aggregated Geburtsort locations with counts
  workplaces: LocationData[];    // Aggregated Arbeitsort locations with counts
  totalBirthplaces: number;      // Total unique birthplace locations
  totalWorkplaces: number;       // Total unique workplace locations
  totalPersons: number;          // Total persons with at least one location
}

/**
 * fetchGeographicDistributionData: Fetches and aggregates location data for map visualization.
 *
 * This function queries the deport table for Geburtsort and Arbeitsort fields,
 * aggregates occurrences of each unique location, and returns them sorted by
 * frequency (most common first).
 *
 * Query Logic:
 * - valid_to IS NULL: Only fetch current/active records (historization pattern)
 * - Aggregates locations server-side for efficiency
 * - Filters out null/empty location values
 *
 * @returns GeographicDistributionData with birthplaces and workplaces arrays
 */
export async function fetchGeographicDistributionData(): Promise<GeographicDistributionData> {
  noStore();

  try {
    const supabase = await createClient();

    // Fetch Geburtsort and Arbeitsort fields from all current records
    // Select only location fields to minimize data transfer
    const { data, error } = await supabase
      .from('deport')
      .select('Geburtsort, Arbeitsort')
      .is('valid_to', null); // Only current records (historization pattern)

    if (error) throw error;

    // Handle empty dataset gracefully
    if (!data || data.length === 0) {
      return {
        birthplaces: [],
        workplaces: [],
        totalBirthplaces: 0,
        totalWorkplaces: 0,
        totalPersons: 0,
      };
    }

    // Aggregate birthplaces (Geburtsort)
    // Map<location_name, count> for efficient counting
    const birthplaceMap = new Map<string, number>();
    data.forEach((person) => {
      const location = person.Geburtsort?.trim();
      // Filter out null, empty, and whitespace-only values
      if (location && location.length > 0) {
        birthplaceMap.set(location, (birthplaceMap.get(location) || 0) + 1);
      }
    });

    // Aggregate workplaces (Arbeitsort)
    const workplaceMap = new Map<string, number>();
    data.forEach((person) => {
      const location = person.Arbeitsort?.trim();
      if (location && location.length > 0) {
        workplaceMap.set(location, (workplaceMap.get(location) || 0) + 1);
      }
    });

    // Convert Maps to sorted arrays (highest count first)
    // This ordering puts the most common locations at the top for better UX
    const birthplaces: LocationData[] = Array.from(birthplaceMap.entries())
      .map(([location, count]) => ({ location, count }))
      .sort((a, b) => b.count - a.count);

    const workplaces: LocationData[] = Array.from(workplaceMap.entries())
      .map(([location, count]) => ({ location, count }))
      .sort((a, b) => b.count - a.count);

    // Count persons with at least one location field populated
    const personsWithLocation = data.filter(
      (p) => (p.Geburtsort?.trim() || p.Arbeitsort?.trim())
    ).length;

    return {
      birthplaces,
      workplaces,
      totalBirthplaces: birthplaces.length,
      totalWorkplaces: workplaces.length,
      totalPersons: personsWithLocation,
    };
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch geographic distribution data.');
  }
}

// =============================================================================
// Birth Year Timeline Data Fetching
// =============================================================================

// Re-export HISTORICAL_EVENTS from types.ts for backward compatibility
export { HISTORICAL_EVENTS } from './types';

/**
 * fetchBirthYearTimeline: Fetches and aggregates birth year data for timeline visualization.
 *
 * This function queries the deport table for Geburtsjahr (birth year) values,
 * groups them into 5-year intervals, and returns a sorted array optimized
 * for the Recharts AreaChart component.
 *
 * Query Logic:
 * - valid_to IS NULL: Only fetch current/active records (historization pattern)
 * - Geburtsjahr NOT NULL: Only include records with birth year data
 * - Groups by 5-year intervals for meaningful demographic patterns
 * - Filters out years outside expected range (1800-DEPORTATION_YEAR)
 *
 * @returns BirthYearTimelineData[] sorted chronologically by startYear
 */
export async function fetchBirthYearTimeline(): Promise<BirthYearTimelineData[]> {
  noStore();

  try {
    const supabase = await createClient();

    // Fetch all persons with valid birth years
    const { data, error } = await supabase
      .from('deport')
      .select('Geburtsjahr')
      .is('valid_to', null) // Only current records (historization pattern)
      .not('Geburtsjahr', 'is', null); // Only records with birth year

    if (error) throw error;

    // Handle empty dataset gracefully
    if (!data || data.length === 0) {
      return [];
    }

    // Aggregate births into 5-year interval bins
    // Map<startYear, count> for efficient counting
    const intervalBins = new Map<number, number>();

    // Track valid birth years for determining range
    const validYears: number[] = [];

    data.forEach((person) => {
      const birthYear = parseInt(person.Geburtsjahr || '');

      // Validate birth year is within expected range
      // 1800 is a reasonable lower bound for historical records
      // DEPORTATION_YEAR (1941) is the upper bound since deportees must be born before
      if (!isNaN(birthYear) && birthYear >= 1800 && birthYear < DEPORTATION_YEAR) {
        validYears.push(birthYear);

        // Calculate 5-year interval start year
        // e.g., 1867 -> 1865, 1890 -> 1890, 1923 -> 1920
        const intervalStart = Math.floor(birthYear / 5) * 5;
        intervalBins.set(intervalStart, (intervalBins.get(intervalStart) || 0) + 1);
      }
    });

    // Handle case where no valid birth years found
    if (validYears.length === 0) {
      return [];
    }

    // Determine the range of intervals to include
    const minYear = Math.min(...validYears);
    const maxYear = Math.max(...validYears);
    const minInterval = Math.floor(minYear / 5) * 5;
    const maxInterval = Math.floor(maxYear / 5) * 5;

    // Build the result array with all intervals in range
    // Include zero-count intervals to show gaps in the timeline
    const result: BirthYearTimelineData[] = [];

    for (let startYear = minInterval; startYear <= maxInterval; startYear += 5) {
      const count = intervalBins.get(startYear) || 0;
      const endYear = startYear + 4;

      result.push({
        period: `${startYear}-${endYear}`,
        count,
        startYear,
      });
    }

    // Sort by startYear (chronological order)
    result.sort((a, b) => a.startYear - b.startYear);

    return result;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch birth year timeline data.');
  }
}
