'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import useRequireAuth from '@/lib/useRequireAuth';

export default function Quiz() {
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showScore, setShowScore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();
  const authLoading = useRequireAuth();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error || !user) {
          router.push('/login');
          return;
        }
        fetchQuestions();
      } catch (err) {
        console.error('Auth check error:', err);
        router.push('/login');
      }
    };

    checkAuth();
  }, [router]);

  const fetchQuestions = async () => {
    try {
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .order('id');

      if (error) throw error;

      setQuestions(data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching questions:', err);
      setError('Failed to load questions');
      setLoading(false);
    }
  };

  const handleAnswer = async (selectedAnswer) => {
    if (selectedAnswer === questions[currentQuestion].correct_answer) {
      setScore(score + 1);
    }

    // Save the user's answer to Supabase
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('user_answers')
        .insert([
          {
            user_id: user.id,
            question_id: questions[currentQuestion].id,
            selected_answer: selectedAnswer,
            is_correct: selectedAnswer === questions[currentQuestion].correct_answer
          }
        ]);

      if (error) throw error;
    } catch (err) {
      console.error('Error saving answer:', err);
    }

    if (currentQuestion + 1 < questions.length) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Save final score
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        const { error } = await supabase
          .from('scores')
          .insert([
            {
              user_id: user.id,
              score: score + (selectedAnswer === questions[currentQuestion].correct_answer ? 1 : 0),
              total_questions: questions.length
            }
          ]);

        if (error) throw error;
      } catch (err) {
        console.error('Error saving score:', err);
      }

      setShowScore(true);
    }
  };

  const handleSubmitScore = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('scores')
        .insert([
          { 
            user_id: user.id,
            score: score,
            total_questions: questions.length
          }
        ]);
      
      if (error) throw error;
      
      router.push('/results');
    } catch (err) {
      console.error('Error submitting score:', err);
    }
  };

  if (loading || authLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  if (showScore) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-500 to-purple-600 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Quiz Completed!</h2>
          <p className="text-lg text-gray-600 mb-6">
            You scored {score} out of {questions.length}
          </p>
          <button
            onClick={handleSubmitScore}
            className="block w-full bg-blue-600 text-white text-center py-3 rounded-lg hover:bg-blue-700 transition duration-200"
          >
            View Results
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-500 to-purple-600 flex flex-col items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full">
        <div className="mb-6">
          <span className="text-sm text-gray-600">
            Question {currentQuestion + 1}/{questions.length}
          </span>
        </div>
        
        <h2 className="text-xl font-bold text-gray-800 mb-6">
          {questions[currentQuestion]?.question}
        </h2>
        
        <div className="space-y-4">
          {questions[currentQuestion]?.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswer(option)}
              className="block w-full bg-gray-100 text-gray-800 text-center py-3 rounded-lg hover:bg-gray-200 transition duration-200"
            >
              {option}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
} 