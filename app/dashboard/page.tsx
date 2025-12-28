import {
  fetchAgeDistribution,
  fetchYoungestPerson,
  fetchOldestPerson,
  fetchAverageChildren,
  fetchFamilyNameStatistics,
  fetchTotalPersons,
  // fetchFamilyStructureData: Fetches family structure data grouped by Familiennr
  // for the interactive network diagram visualization. Returns families with their
  // members organized hierarchically (parents first, then children sorted by birth year).
  fetchFamilyStructureData,
  // fetchGeographicDistributionData: Fetches and aggregates Geburtsort (birthplace)
  // and Arbeitsort (workplace) location data for the geographic distribution visualization.
  // Returns separate arrays for birthplaces and workplaces with occurrence counts.
  fetchGeographicDistributionData,
  // fetchBirthYearTimeline: Fetches birth year data aggregated into 5-year intervals
  // for the area chart visualization showing demographic patterns over time.
  fetchBirthYearTimeline,
  // fetchPatronymicData: Fetches and aggregates Vatersname (patronymic/father's name) data
  // for the patronymic analysis visualization showing naming patterns and conventions.
  fetchPatronymicData,
  // fetchFamilyRoleDistribution: Fetches and aggregates Familienrolle (family role) data
  // for the donut chart visualization showing family role distribution in deportation records.
  fetchFamilyRoleDistribution,
  // fetchAgePyramidData: Fetches and aggregates age spread data split by gender
  // for the population pyramid visualization.
  fetchAgePyramidData,
  // fetchFamilySizeDistribution: Fetches family size buckets and average size.
  fetchFamilySizeDistribution,
} from './data';
import MetricCard from './components/MetricCard';
import PersonCard from './components/PersonCard';
import AgeDistributionChart from './components/AgeDistributionChart';
import FamilyNameTable from './components/FamilyNameTable';
// FamilyStructureChart: Interactive React Flow visualization component that displays
// family relationships as a network diagram. Shows family members as nodes with
// color-coded roles and edges representing parent-child and marriage relationships.
import FamilyStructureChart from './components/FamilyStructureChart';
// GeographicDistributionMap: Visualization component showing the frequency of birthplaces
// (Geburtsort) and workplaces (Arbeitsort) from deportation records. Users can toggle
// between viewing birthplace or workplace data, with a ranked list showing location counts.
import GeographicDistributionMap from './components/GeographicDistributionMap';
// BirthYearTimeline: Area chart visualization showing birth counts aggregated by 5-year
// intervals. Includes historical event markers for contextualizing demographic patterns.
import BirthYearTimeline from './components/BirthYearTimeline';
// PatronymicAnalysisChart: Horizontal bar chart visualization showing the frequency of
// Vatersname (patronymic/father's name) values. Includes gender filtering to analyze
// different naming patterns for male/female persons.
import PatronymicAnalysisChart from './components/PatronymicAnalysisChart';
// FamilyRoleDistributionChart: Donut chart visualization showing the distribution of
// family roles (Familienrolle) in deportation records with counts and percentages.
import FamilyRoleDistributionChart from './components/FamilyRoleDistributionChart';
// AgePyramidChart: Population pyramid visualization showing demographic distribution
// by age and gender in 1941. Custom tooltip shows detailed counts.
import AgePyramidChart from './components/AgePyramidChart';
// FamilySizeChart: Bar chart showing distribution of family sizes (members per family).
import FamilySizeChart from './components/FamilySizeChart';

export default async function Page() {
  // Fetch all dashboard data in parallel using Promise.all() for optimal performance.
  // This allows all independent database queries to execute concurrently rather than
  // sequentially, significantly reducing the total page load time.
  const [
    totalPersons,
    ageDistribution,
    youngestPerson,
    oldestPerson,
    averageChildren,
    familyNameStats,
    // familyStructureData: Contains grouped family data for the network visualization.
    // Added to the parallel fetch to load family structure data alongside other dashboard
    // metrics without blocking. The data is pre-processed server-side to minimize
    // client-side computation when rendering the React Flow diagram.
    familyStructureData,
    // geographicDistributionData: Contains aggregated birthplace (Geburtsort) and
    // workplace (Arbeitsort) location data. Loaded in parallel with other data to
    // avoid blocking. Data is pre-sorted by frequency for efficient rendering.
    geographicDistributionData,
    // birthYearTimelineData: Contains birth year counts aggregated by 5-year intervals.
    // Used for the area chart showing demographic patterns over time.
    birthYearTimelineData,
    // patronymicData: Contains aggregated Vatersname (patronymic) data with gender counts.
    // Used for the horizontal bar chart showing naming patterns and conventions.
    patronymicData,
    // familyRoleDistributionData: Contains aggregated family role (Familienrolle) data
    // with counts and percentages. Used for the donut chart visualization.
    familyRoleDistributionData,
    // agePyramidData: Contains age distribution data grouped by 5-year intervals and gender.
    // Used for the mirrored bar chart (population pyramid).
    agePyramidData,
    familySizeData,
  ] = await Promise.all([
    fetchTotalPersons(),
    fetchAgeDistribution(),
    fetchYoungestPerson(),
    fetchOldestPerson(),
    fetchAverageChildren(),
    fetchFamilyNameStatistics(),
    fetchFamilyStructureData(),
    // Fetch geographic distribution data for the location frequency visualization
    fetchGeographicDistributionData(),
    // Fetch birth year timeline data for the temporal visualization
    fetchBirthYearTimeline(),
    // Fetch patronymic data for the naming pattern visualization
    fetchPatronymicData(),
    // Fetch family role distribution data for the donut chart visualization
    fetchFamilyRoleDistribution(),
    // Fetch age pyramid data for demographic visualization
    fetchAgePyramidData(),
    fetchFamilySizeDistribution(),
  ]);

  return (
    <div className="max-w-7xl mx-auto lg:px-8 pt-24 lg:pt-32 pb-8 space-y-6">
      {/* Header */}
      <div className="mb-8">
        <p className="text-gray-600">
          Übersicht und Statistiken der deportierten Personen
        </p>
      </div>

      {/* Top Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Gesamt Personen"
          value={totalPersons}
          iconName="users"
          iconColor="text-blue-600"
          subtitle="Erfasste Datensätze"
        />
        <MetricCard
          title="Durchschn. Kinder"
          value={averageChildren}
          iconName="baby"
          iconColor="text-green-600"
          subtitle="Pro Familie"
        />
        <MetricCard
          title="Familiennamen"
          value={familyNameStats.length}
          iconName="userCheck"
          iconColor="text-purple-600"
          subtitle="Eindeutige Namen"
        />
        <MetricCard
          title="Altersgruppen"
          value={ageDistribution.filter(d => d.count > 0).length}
          iconName="trendingUp"
          iconColor="text-orange-600"
          subtitle="Mit Personen"
        />
      </div>

      {/* Youngest and Oldest Person Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PersonCard
          title="Jüngste Person"
          person={youngestPerson}
          accentColor="bg-green-500"
        />
        <PersonCard
          title="Älteste Person"
          person={oldestPerson}
          accentColor="bg-orange-500"
        />
      </div>

      {/* Family Structure Network Diagram
          Positioned before the Age Distribution Chart because:
          1. It provides high-level family relationship context that helps interpret other statistics
          2. Visual network diagrams are more engaging and draw user attention first
          3. Family groupings are the primary organizational unit in the deportation records
          4. Users can identify specific families to explore before diving into demographic details */}
      <FamilyStructureChart data={familyStructureData} />

      {/* Geographic Distribution Map
          Positioned after the Family Structure Chart because:
          1. Location data provides geographic context to complement the family network view
          2. Users can explore where families originated (Geburtsort) or worked (Arbeitsort)
          3. Toggle allows switching between birthplace and workplace views
          4. Ranked list shows most common locations with frequency bars for easy comparison */}
      <GeographicDistributionMap data={geographicDistributionData} />

      {/* Birth Year Timeline
          Area chart showing demographic patterns over time:
          1. Groups births by 5-year intervals for meaningful pattern recognition
          2. Includes historical event markers (WWI, WWII, etc.) for context
          3. Shows percentage and count in tooltips
          4. Helps identify generational patterns and population trends */}
      <BirthYearTimeline data={birthYearTimelineData} />

      {/* Family Role Distribution Chart
          Donut chart showing family role distribution:
          1. Visualizes the breakdown of family roles (Familienoberhaupt, Ehefrau, Sohn, Tochter, etc.)
          2. Shows both count and percentage for each role category
          3. Uses consistent colors for easy identification
          4. Provides insight into family composition and structure in the deported community */}
      <FamilyRoleDistributionChart data={familyRoleDistributionData} />

      {/* Age Pyramid Chart
          Population pyramid showing age/gender distribution:
          1. Visualizes demographic structure of the deported population
          2. Mirrored bar chart (Males left, Females right)
          3. 5-year age intervals
          4. Helps identify imbalances in age groups or genders */}
      <AgePyramidChart data={agePyramidData} />

      {/* Family Size Distribution Chart */}
      <FamilySizeChart data={familySizeData} />

      {/* Age Distribution Chart */}
      <AgeDistributionChart data={ageDistribution} />

      {/* Patronymic Analysis Chart
          Horizontal bar chart showing patronymic (Vatersname) frequency:
          1. Provides cultural insight into naming conventions
          2. Gender filter allows analyzing different patterns for male/female persons
          3. Configurable display count (Top 10/15/20/30)
          4. Shows statistics: unique patronymics, total persons, most common name */}
      <PatronymicAnalysisChart data={patronymicData} />

      {/* Family Name Statistics Table */}
      <FamilyNameTable data={familyNameStats} />
    </div>
  );
}
