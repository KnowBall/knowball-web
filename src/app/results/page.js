'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import Link from 'next/link';

export default function Results() {
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const points = searchParams.get('pts');

  useEffect(() => {
    if (!currentUser) {
      router.push('/');
      return;
    }

    async function fetchScores() {
      try {
        const scoresRef = collection(db, 'scores');
        const q = query(
          scoresRef,
          orderBy('points', 'desc'),
          limit(5)
        );
        const scoresSnapshot = await getDocs(q);
        const scoresData = scoresSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setScores(scoresData);
      } catch (error) {
        console.error('Error fetching scores:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchScores();
  }, [currentUser, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-500 to-purple-600 flex items-center justify-center">
        <div className="text-white text-xl">Loading results...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-500 to-purple-600 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full">
        <h2 className="text-2xl font-bold text-center mb-6">Game Over!</h2>
        <p className="text-xl text-center mb-6">Your score: {points} points</p>
        
        <h3 className="text-lg font-semibold mb-4">Top Players</h3>
        <div className="space-y-3 mb-6">
          {scores.map((score, index) => (
            <div
              key={score.id}
              className={`flex justify-between items-center p-3 rounded-md ${
                score.userId === currentUser.uid
                  ? 'bg-blue-100 border border-blue-200'
                  : 'bg-gray-50'
              }`}
            >
              <div className="flex items-center">
                <span className="text-gray-500 mr-2">{index + 1}.</span>
                <span className="font-medium">{score.email}</span>
              </div>
              <span className="font-bold">{score.points} points</span>
            </div>
          ))}
        </div>

        <div className="space-y-4">
          <Link
            href="/home"
            className="block w-full bg-blue-600 text-white text-center py-3 rounded-lg hover:bg-blue-700 transition duration-200"
          >
            Go Home
          </Link>
          <Link
            href="/quiz"
            className="block w-full bg-gray-200 text-gray-800 text-center py-3 rounded-lg hover:bg-gray-300 transition duration-200"
          >
            Play Again
          </Link>
        </div>
      </div>
    </div>
  );
} 