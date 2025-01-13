'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Account() {
  const router = useRouter();
  const [user, setUser] = useState<{ name: string, email: string } | null>(null);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    // Fetch user data from API or session
    const fetchUserData = async () => {
      // Replace with actual API call or session retrieval logic
      const userData = { name: 'John Doe', email: 'john.doe@example.com' };
      setUser(userData);
    };

    fetchUserData();
  }, []);

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    // Add logic to handle password change
    console.log('Password change submitted');
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto p-4 mt-20">
      <h1 className="text-2xl font-bold mb-4">Account Information</h1>
      <div className="mb-4">
        <p><strong>Name:</strong> {user.name}</p>
        <p><strong>Email:</strong> {user.email}</p>
      </div>
      <h2 className="text-xl font-bold mb-4">Change Password</h2>
      <form onSubmit={handlePasswordChange}>
        <div className="mb-4">
          <label htmlFor="current-password" className="block text-sm font-medium text-gray-700">Current Password</label>
          <input
            type="password"
            id="current-password"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
        </div>
        <div className="mb-4">
          <label htmlFor="new-password" className="block text-sm font-medium text-gray-700">New Password</label>
          <input
            type="password"
            id="new-password"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </div>
        <div className="mb-4">
          <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700">Confirm New Password</label>
          <input
            type="password"
            id="confirm-password"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>
        <button
          type="submit"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Change Password
        </button>
      </form>
    </div>
  );
}
