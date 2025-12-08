// =============================================================================
// Dashboard Shared Types
// =============================================================================
// These types are shared between server-side data fetching (data.ts)
// and client-side components. Keeping them separate ensures client
// components don't accidentally import server-side code.

/**
 * BirthYearTimelineData: Represents birth counts grouped by 5-year intervals.
 *
 * Used for the area chart visualization showing demographic patterns over time.
 * The startYear field allows for proper chronological sorting and tooltip display.
 */
export interface BirthYearTimelineData {
  period: string;        // Display label (e.g., "1860-1864")
  count: number;         // Number of births in this interval
  startYear: number;     // Start year of the interval (for sorting)
  percentage?: number;   // Percentage of total births (calculated client-side)
}

/**
 * HistoricalEvent: Represents a significant historical event for timeline annotations.
 *
 * These events are displayed as markers on the birth year timeline to provide
 * historical context for demographic patterns observed in the data.
 */
export interface HistoricalEvent {
  year: number;          // Year of the event
  label: string;         // Short label for display
  description: string;   // Full description for tooltip
}

/**
 * HISTORICAL_EVENTS: Significant historical events relevant to the dataset's time period.
 *
 * These events provide context for interpreting birth patterns in the data.
 * Events are specific to German-Russian (Wolhynien/Volhynian German) history.
 */
export const HISTORICAL_EVENTS: HistoricalEvent[] = [
  {
    year: 1871,
    label: 'Reichsgründung',
    description: 'Gründung des Deutschen Reiches',
  },
  {
    year: 1914,
    label: 'WK I',
    description: 'Beginn des Ersten Weltkriegs',
  },
  {
    year: 1918,
    label: 'Kriegsende',
    description: 'Ende des Ersten Weltkriegs',
  },
  {
    year: 1933,
    label: 'NS-Regime',
    description: 'Machtergreifung der Nationalsozialisten',
  },
  {
    year: 1939,
    label: 'WK II',
    description: 'Beginn des Zweiten Weltkriegs',
  },
  {
    year: 1941,
    label: 'Deportation',
    description: 'Deportation der Wolgadeutschen',
  },
];

// =============================================================================
// Patronymic Analysis Types
// =============================================================================

/**
 * PatronymicData: Represents a single patronymic (Vatersname) with its occurrence count.
 *
 * Used for the patronymic analysis visualization showing naming patterns.
 * Gender-specific counts allow filtering by male/female naming conventions.
 */
export interface PatronymicData {
  name: string;         // The patronymic (father's name)
  count: number;        // Total occurrences
  maleCount: number;    // Occurrences for male persons
  femaleCount: number;  // Occurrences for female persons
}

/**
 * PatronymicAnalysisData: Root data structure for the patronymic analysis visualization.
 *
 * Contains aggregated patronymic data with statistics for the dashboard.
 */
export interface PatronymicAnalysisData {
  patronymics: PatronymicData[];  // List of patronymics sorted by frequency (descending)
  totalPersons: number;           // Total persons with patronymic data
  uniquePatronymics: number;      // Count of unique patronymics
  totalMale: number;              // Total male persons with patronymic data
  totalFemale: number;            // Total female persons with patronymic data
}

// =============================================================================
// Age Pyramid Types
// =============================================================================

/**
 * AgePyramidData: Represents a single age group bin for the population pyramid.
 * 
 * Used for the age pyramid visualization showing demographic distribution.
 * Contains counts for both genders to allow mirrored bar chart display.
 */
export interface AgePyramidData {
  ageGroup: string;     // Age range label (e.g., "0-4", "5-9")
  male: number;         // Count of males (stored as positive, displayed as negative)
  female: number;       // Count of females
  maleLabel: number;    // Absolute count for males (for tooltips)
}


