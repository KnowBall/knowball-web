'use client';

import { useEffect, useState } from 'react';
import useRequireAuth from '../../lib/useRequireAuth';
import { supabase } from '@/lib/supabase';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';

export default function Analytics() {
  const { user, loading: authLoading } = useRequireAuth();
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    async function fetchStats() {
      try {
        let query = supabase
          .from('question_stats')
          .select('*')
          .order('total_attempts', { ascending: false });

        if (startDate) {
          query = query.gte('created_at', startDate);
        }
        if (endDate) {
          query = query.lte('created_at', endDate);
        }

        const { data, error } = await query;

        if (error) throw error;
        setStats(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    if (!authLoading) {
      fetchStats();
    }
  }, [authLoading, startDate, endDate]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
            <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-100 px-4 py-3 rounded">
            <p>Error loading analytics: {error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Question Analytics</h1>
        
        {/* Date Range Filter */}
        <Card className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Filter by Date Range</h2>
          <div className="flex space-x-4">
            <div className="flex-1">
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Start Date
              </label>
              <Input
                type="date"
                id="startDate"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="flex-1">
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                End Date
              </label>
              <Input
                type="date"
                id="endDate"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
        </Card>
        
        {/* Table */}
        <Card className="mb-8">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Question
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Total Attempts
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Correct Answers
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Success Rate
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {stats.map((stat) => (
                  <tr key={stat.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {stat.question}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {stat.total_attempts}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {stat.correct_count}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {stat.percentage_correct.toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Chart */}
        <Card>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Success Rate by Question</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={stats}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="question" 
                  angle={-45} 
                  textAnchor="end"
                  height={100}
                  interval={0}
                  stroke="#6b7280"
                />
                <YAxis stroke="#6b7280" />
                <Tooltip 
                  formatter={(value) => [`${value.toFixed(1)}%`, 'Success Rate']}
                  contentStyle={{ backgroundColor: '#ffffff', border: 'none' }}
                />
                <Bar 
                  dataKey="percentage_correct" 
                  fill="#3b82f6" 
                  name="Success Rate"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
} 