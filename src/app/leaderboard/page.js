'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function Leaderboard() {
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error || !user) {
          router.push('/login');
          return;
        }
        fetchScores();
      } catch (err) {
        console.error('Auth check error:', err);
        router.push('/login');
      }
    };

    checkAuth();
  }, [router]);

  const fetchScores = async () => {
    try {
      const { data, error } = await supabase
        .from('scores')
        .select(`
          score,
          total_questions,
          created_at,
          profiles (
            email
          )
        `)
        .order('score', { ascending: false })
        .limit(10);

      if (error) throw error;

      setScores(data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching scores:', err);
      setError('Failed to load leaderboard');
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div>
      <h1>Leaderboard</h1>
      <div>
        {scores.map((score, index) => (
          <div key={index}>
            <span>{index + 1}. {score.profiles.email}</span>
            <span>Score: {score.score}/{score.total_questions}</span>
            <span>Percentage: {((score.score / score.total_questions) * 100).toFixed(1)}%</span>
          </div>
        ))}
      </div>
      <div>
        <Link href="/home">Back to Home</Link>
      </div>
    </div>
  );
} 