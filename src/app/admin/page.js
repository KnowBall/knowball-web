'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import useRequireAuth from '@/lib/useRequireAuth';

export default function Admin() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [formData, setFormData] = useState({
    question: '',
    options: ['', '', '', ''],
    correct_answer: ''
  });

  const authLoading = useRequireAuth();

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;

        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', user.id)
          .single();

        if (profileError) throw profileError;
        setIsAdmin(profile?.is_admin || false);

        if (!profile?.is_admin) {
          setError('You do not have admin privileges');
        }
      } catch (err) {
        console.error('Error checking admin status:', err);
        setError('Error checking admin privileges');
      }
    };

    checkAdmin();
  }, []);

  useEffect(() => {
    if (isAdmin) {
      fetchQuestions();
    }
  }, [isAdmin]);

  const fetchQuestions = async () => {
    try {
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .order('id');

      if (error) throw error;
      setQuestions(data);
    } catch (err) {
      console.error('Error fetching questions:', err);
      setError('Failed to load questions');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from('questions')
        .insert([{
          question: formData.question,
          options: formData.options,
          correct_answer: formData.correct_answer
        }]);

      if (error) throw error;

      setFormData({
        question: '',
        options: ['', '', '', ''],
        correct_answer: ''
      });
      fetchQuestions();
    } catch (err) {
      console.error('Error adding question:', err);
      setError('Failed to add question');
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from('questions')
        .update({
          question: formData.question,
          options: formData.options,
          correct_answer: formData.correct_answer
        })
        .eq('id', editingQuestion.id);

      if (error) throw error;

      setEditingQuestion(null);
      setFormData({
        question: '',
        options: ['', '', '', ''],
        correct_answer: ''
      });
      fetchQuestions();
    } catch (err) {
      console.error('Error updating question:', err);
      setError('Failed to update question');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this question?')) return;

    try {
      const { error } = await supabase
        .from('questions')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchQuestions();
    } catch (err) {
      console.error('Error deleting question:', err);
      setError('Failed to delete question');
    }
  };

  const startEditing = (question) => {
    setEditingQuestion(question);
    setFormData({
      question: question.question,
      options: question.options,
      correct_answer: question.correct_answer
    });
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-500 to-purple-600 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-500 to-purple-600 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Access Denied</h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-500 to-purple-600 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Question Management</h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-xl p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">
            {editingQuestion ? 'Edit Question' : 'Add New Question'}
          </h2>
          <form onSubmit={editingQuestion ? handleUpdate : handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-700 mb-2">Question</label>
              <input
                type="text"
                value={formData.question}
                onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                className="w-full border rounded p-2"
                required
              />
            </div>

            {formData.options.map((option, index) => (
              <div key={index}>
                <label className="block text-gray-700 mb-2">Option {index + 1}</label>
                <input
                  type="text"
                  value={option}
                  onChange={(e) => {
                    const newOptions = [...formData.options];
                    newOptions[index] = e.target.value;
                    setFormData({ ...formData, options: newOptions });
                  }}
                  className="w-full border rounded p-2"
                  required
                />
              </div>
            ))}

            <div>
              <label className="block text-gray-700 mb-2">Correct Answer</label>
              <select
                value={formData.correct_answer}
                onChange={(e) => setFormData({ ...formData, correct_answer: e.target.value })}
                className="w-full border rounded p-2"
                required
              >
                <option value="">Select correct answer</option>
                {formData.options.map((option, index) => (
                  <option key={index} value={option}>
                    Option {index + 1}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              {editingQuestion ? 'Update Question' : 'Add Question'}
            </button>
            {editingQuestion && (
              <button
                type="button"
                onClick={() => {
                  setEditingQuestion(null);
                  setFormData({
                    question: '',
                    options: ['', '', '', ''],
                    correct_answer: ''
                  });
                }}
                className="ml-4 bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
              >
                Cancel
              </button>
            )}
          </form>
        </div>

        <div className="bg-white rounded-lg shadow-xl p-6">
          <h2 className="text-xl font-semibold mb-4">Questions List</h2>
          <div className="overflow-x-auto">
            <table className="table-auto w-full">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-4 py-2 text-left">Question</th>
                  <th className="px-4 py-2 text-left">Options</th>
                  <th className="px-4 py-2 text-left">Correct Answer</th>
                  <th className="px-4 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {questions.map((q) => (
                  <tr key={q.id} className="border-t">
                    <td className="px-4 py-2">{q.question}</td>
                    <td className="px-4 py-2">{q.options.join(', ')}</td>
                    <td className="px-4 py-2">{q.correct_answer}</td>
                    <td className="px-4 py-2">
                      <button
                        onClick={() => startEditing(q)}
                        className="text-blue-600 hover:text-blue-800 mr-2"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(q.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
} 