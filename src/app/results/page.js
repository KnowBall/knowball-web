'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function Results() {
  const [score, setScore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const fetchScore = async () => {
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
          router.push('/login');
          return;
        }

        const { data, error } = await supabase
          .from('scores')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (error) throw error;

        setScore(data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching score:', err);
        setError('Failed to load your score');
        setLoading(false);
      }
    };

    fetchScore();
  }, [router]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  if (!score) {
    return <div>No score found</div>;
  }

  return (
    <div>
      <h1>Quiz Results</h1>
      <p>Your score: {score.score} out of {score.total_questions}</p>
      <p>Percentage: {((score.score / score.total_questions) * 100).toFixed(1)}%</p>
      <div>
        <Link href="/home">Back to Home</Link>
      </div>
    </div>
  );
} 