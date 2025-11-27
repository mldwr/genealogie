import { unstable_noStore as noStore } from 'next/cache';
import { createClient } from '@/utils/supabase/server';

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

// Family Structure Types for React Flow visualization
export interface FamilyMember {
  id: string;
  Vorname: string | null;
  Familienname: string | null;
  Familienrolle: string | null;
  Geschlecht: string | null;
  Geburtsjahr: string | null;
  Familiennr: number | null;
}

export interface FamilyGroup {
  familiennr: number;
  familienname: string;
  members: FamilyMember[];
}

export interface FamilyStructureData {
  families: FamilyGroup[];
  totalFamilies: number;
  totalMembers: number;
}

/**
 * Fetch family structure data for network visualization
 * Groups persons by Familiennr and returns data suitable for React Flow
 */
export async function fetchFamilyStructureData(): Promise<FamilyStructureData> {
  noStore();

  try {
    const supabase = await createClient();

    // Fetch all persons with family numbers
    const { data, error } = await supabase
      .from('deport')
      .select('id, Vorname, Familienname, Familienrolle, Geschlecht, Geburtsjahr, Familiennr')
      .is('valid_to', null)
      .not('Familiennr', 'is', null)
      .order('Familiennr', { ascending: true })
      .order('Familienrolle', { ascending: true });

    if (error) throw error;
    if (!data || data.length === 0) {
      return { families: [], totalFamilies: 0, totalMembers: 0 };
    }

    // Group by Familiennr
    const familyMap = new Map<number, FamilyMember[]>();

    data.forEach((person) => {
      const familiennr = person.Familiennr;
      // Skip records without id or Familiennr
      if (familiennr !== null && person.id !== null) {
        if (!familyMap.has(familiennr)) {
          familyMap.set(familiennr, []);
        }
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

    // Convert to array of family groups
    const families: FamilyGroup[] = [];
    familyMap.forEach((members, familiennr) => {
      // Sort members: Familienoberhaupt first, then Ehefrau, then children by birth year
      const sortedMembers = members.sort((a, b) => {
        const roleOrder: Record<string, number> = {
          'Familienoberhaupt': 1,
          'Ehefrau': 2,
          'Sohn': 3,
          'Tochter': 3,
        };
        const roleA = roleOrder[a.Familienrolle || ''] || 99;
        const roleB = roleOrder[b.Familienrolle || ''] || 99;

        if (roleA !== roleB) return roleA - roleB;

        // For same role (children), sort by birth year
        const yearA = parseInt(a.Geburtsjahr || '9999');
        const yearB = parseInt(b.Geburtsjahr || '9999');
        return yearA - yearB;
      });

      families.push({
        familiennr,
        familienname: sortedMembers[0]?.Familienname || 'Unbekannt',
        members: sortedMembers,
      });
    });

    // Sort families by familiennr
    families.sort((a, b) => a.familiennr - b.familiennr);

    return {
      families,
      totalFamilies: families.length,
      totalMembers: data.length,
    };
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch family structure data.');
  }
}

