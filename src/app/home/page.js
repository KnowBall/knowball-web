'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import useRequireAuth from '@/lib/useRequireAuth';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

export default function Home() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const authLoading = useRequireAuth();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) throw error;
        setUser(user);
      } catch (err) {
        console.error('Error fetching user:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      router.push('/login');
    } catch (err) {
      console.error('Error signing out:', err);
    }
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-500 to-purple-600 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-500 to-purple-600 flex flex-col items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Welcome, {user?.email}</h1>
          <button
            onClick={handleSignOut}
            className="text-sm text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white"
          >
            Sign Out
          </button>
        </div>
        
        <div className="space-y-4">
          <Button
            variant="primary"
            onClick={() => router.push('/quiz')}
            className="w-full"
          >
            Start Quiz
          </Button>
          <Button
            variant="secondary"
            onClick={() => router.push('/leaderboard')}
            className="w-full"
          >
            View Leaderboard
          </Button>
          <Button
            variant="secondary"
            onClick={() => router.push('/analytics')}
            className="w-full"
          >
            View Analytics
          </Button>
        </div>
      </Card>
    </div>
  );
} 