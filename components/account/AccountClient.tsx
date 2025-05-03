'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import { useAuth } from '@/components/providers/AuthProvider';

export default function AccountClient() {
  const router = useRouter();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const { user } = useAuth();
  const [userData, setUserData] = useState<{ role: string, email: string } | null>(null);

  useEffect(() => {
    if (!user) {
      router.push('/signin');
      return;
    }

    const fetchUserData = async () => {
      if (!user || !user.id) {
        console.error('No user ID available');
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('role, email')
        .eq('id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching user data:', error);
        return;
      }

      if (data) {
        setUserData(data);
      }
    };

    fetchUserData();
  }, [user, supabase, router]);

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto p-4 mt-28">
      <h1 className="text-2xl font-bold mb-4">Account Information</h1>
      <div className="mb-4">
        <p><strong>Email:</strong> {user.email}</p>
        {userData && <p><strong>Role:</strong> {userData.role}</p>}
      </div>
      <h2 className="text-xl font-bold mb-4">Change Password</h2>
      {/* Rest of your form JSX */}
    </div>
  );
}