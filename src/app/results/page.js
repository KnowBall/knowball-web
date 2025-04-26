'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import useRequireAuth from '@/lib/useRequireAuth';

export default function Results() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const authLoading = useRequireAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;
        setCurrentUser(user);

        // Get leaderboard
        const { data, error: leaderboardError } = await supabase
          .from('scores')
          .select('user_id, score, total_questions')
          .order('score', { ascending: false })
          .limit(10);

        if (leaderboardError) throw leaderboardError;

        // Get user emails for the leaderboard
        const userIds = data.map(entry => entry.user_id);
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, email')
          .in('id', userIds);

        if (profilesError) throw profilesError;

        // Combine scores with user emails
        const leaderboardWithEmails = data.map(entry => ({
          ...entry,
          email: profiles.find(p => p.id === entry.user_id)?.email || 'Anonymous'
        }));

        setLeaderboard(leaderboardWithEmails);
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-500 to-purple-600 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-500 to-purple-600 flex flex-col items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Leaderboard</h1>
        
        <div className="space-y-4">
          {leaderboard.map((entry, index) => (
            <div
              key={entry.user_id}
              className={`p-4 rounded-lg ${
                entry.user_id === currentUser?.id
                  ? 'bg-blue-100 border-2 border-blue-500'
                  : 'bg-gray-50'
              }`}
            >
              <div className="flex justify-between items-center">
                <div>
                  <span className="font-bold text-gray-800">{index + 1}. {entry.email}</span>
                </div>
                <div className="text-right">
                  <span className="text-gray-600">{entry.score}/{entry.total_questions}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 space-y-4">
          <button
            onClick={() => router.push('/quiz')}
            className="block w-full bg-blue-600 text-white text-center py-3 rounded-lg hover:bg-blue-700 transition duration-200"
          >
            Play Again
          </button>
          <button
            onClick={() => router.push('/home')}
            className="block w-full bg-gray-200 text-gray-800 text-center py-3 rounded-lg hover:bg-gray-300 transition duration-200"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
} 