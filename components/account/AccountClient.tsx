'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useAuth } from '@/components/providers/AuthProvider';

export default function AccountClient() {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const { user } = useAuth();
  const [userData, setUserData] = useState<{ role: string, email: string } | null>(null);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    if (!user) {
      router.push('/signin');
      return;
    }

    const fetchUserData = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('role, email')
        .single();

      if (error) {
        console.error('Error fetching user data:', error);
        return;
      }

      setUserData(data);
    };

    fetchUserData();
  }, [user, supabase, router]);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    // Add password change logic here
  };

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