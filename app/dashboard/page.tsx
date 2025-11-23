import { fetchDeported } from '@/app/deport/data';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

export default async function Page() {
  const supabase = createClient();
  const { data: { user } } = await (await supabase).auth.getUser();

  if (!user) {
    return redirect('/signin');
  }

  const deportedData = await fetchDeported('', 1); // Fetch all data for now

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold">Total Deported Records</h2>
          <p className="text-3xl">{deportedData.length}</p>
        </div>
        {/* Add more visualization components here */}
      </div>
    </div>
  );
}