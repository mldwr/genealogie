import {
  fetchAgeDistribution,
  fetchYoungestPerson,
  fetchOldestPerson,
  fetchAverageChildren,
  fetchFamilyNameStatistics,
  fetchTotalPersons,
  fetchFamilyStructureData,
} from './data';
import MetricCard from './components/MetricCard';
import PersonCard from './components/PersonCard';
import AgeDistributionChart from './components/AgeDistributionChart';
import FamilyNameTable from './components/FamilyNameTable';
import FamilyStructureChart from './components/FamilyStructureChart';

export default async function Page() {
  // Fetch all dashboard data in parallel
  const [
    totalPersons,
    ageDistribution,
    youngestPerson,
    oldestPerson,
    averageChildren,
    familyNameStats,
    familyStructureData,
  ] = await Promise.all([
    fetchTotalPersons(),
    fetchAgeDistribution(),
    fetchYoungestPerson(),
    fetchOldestPerson(),
    fetchAverageChildren(),
    fetchFamilyNameStatistics(),
    fetchFamilyStructureData(),
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 lg:pt-32 pb-8 space-y-6">
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

      {/* Family Structure Network Diagram */}
      <FamilyStructureChart data={familyStructureData} />

      {/* Age Distribution Chart */}
      <AgeDistributionChart data={ageDistribution} />

      {/* Family Name Statistics Table */}
      <FamilyNameTable data={familyNameStats} />
    </div>
  );
}