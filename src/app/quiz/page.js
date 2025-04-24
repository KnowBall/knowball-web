'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, serverTimestamp, query, limit } from 'firebase/firestore';

export default function Quiz() {
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const [gameOver, setGameOver] = useState(false);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!currentUser) {
      router.push('/');
      return;
    }

    async function fetchQuestions() {
      try {
        const questionsRef = collection(db, 'questions');
        const q = query(questionsRef, limit(10));
        const questionsSnapshot = await getDocs(q);
        const questionsData = questionsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        // Shuffle questions
        const shuffled = questionsData.sort(() => 0.5 - Math.random());
        setQuestions(shuffled);
      } catch (error) {
        console.error('Error fetching questions:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchQuestions();
  }, [currentUser, router]);

  useEffect(() => {
    if (questions.length === 0 || gameOver) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleAnswer(null);
          return 15;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentQuestionIndex, gameOver, handleAnswer, questions.length]);

  const handleAnswer = useCallback(async (selectedOption) => {
    const currentQuestion = questions[currentQuestionIndex];
    const isCorrect = selectedOption === currentQuestion.correctAnswer;

    if (isCorrect) {
      setScore(prev => prev + 10);
    } else {
      setScore(prev => prev - 5);
    }

    if (currentQuestionIndex === questions.length - 1) {
      setGameOver(true);
      // Save score to Firestore
      try {
        await addDoc(collection(db, 'scores'), {
          userId: currentUser.uid,
          email: currentUser.email,
          points: score + (isCorrect ? 10 : -5),
          timestamp: serverTimestamp()
        });
        router.push(`/results?pts=${score + (isCorrect ? 10 : -5)}`);
      } catch (error) {
        console.error('Error saving score:', error);
      }
    } else {
      setCurrentQuestionIndex(prev => prev + 1);
      setTimeLeft(15);
    }
  }, [currentQuestionIndex, questions, currentUser, score, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-500 to-purple-600 flex items-center justify-center">
        <div className="text-white text-xl">Loading questions...</div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-500 to-purple-600 flex items-center justify-center">
        <div className="text-white text-xl">No questions available</div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-500 to-purple-600 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full">
        <div className="flex justify-between items-center mb-6">
          <div className="text-lg font-semibold">Score: {score}</div>
          <div className="text-lg font-semibold">Time: {timeLeft}s</div>
        </div>
        
        <div className="mb-6">
          <div className="h-2 bg-gray-200 rounded-full">
            <div
              className="h-2 bg-blue-600 rounded-full transition-all duration-1000"
              style={{ width: `${(timeLeft / 15) * 100}%` }}
            />
          </div>
        </div>

        <h2 className="text-xl font-bold mb-4">{currentQuestion.question}</h2>
        
        <div className="space-y-3">
          {currentQuestion.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswer(option)}
              className="block w-full text-left p-3 border rounded-md hover:bg-gray-50 transition-colors"
            >
              {option}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
} 