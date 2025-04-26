'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Menu, X } from 'lucide-react';
import { useTheme } from 'next-themes';

export default function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      router.push('/login');
    } catch (err) {
      console.error('Error signing out:', err);
    }
  };

  const isActive = (path) => pathname === path;

  const NavLink = ({ href, children }) => (
    <Link
      href={href}
      className={`inline-flex items-center px-1 pt-1 border-b-2 ${
        isActive(href) ? 'border-blue-500 text-gray-900 dark:text-white' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white'
      }`}
      onClick={() => setIsOpen(false)}
    >
      {children}
    </Link>
  );

  const ThemeToggle = () => (
    <button
      aria-label="Toggle dark mode"
      className="ml-4 p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
    >
      {theme === 'dark' ? '🌞' : '🌙'}
    </button>
  );

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-8">
            <NavLink href="/home">Home</NavLink>
            <NavLink href="/quiz">Quiz</NavLink>
            <NavLink href="/leaderboard">Leaderboard</NavLink>
            <NavLink href="/analytics">Analytics</NavLink>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="block md:hidden p-2 text-gray-500 dark:text-gray-300"
            aria-label="Toggle menu"
            aria-expanded={isOpen}
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Right Side Buttons */}
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <button
              onClick={handleSignOut}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      <div
        id="mobile-menu"
        className={`fixed inset-0 bg-white dark:bg-gray-800 bg-opacity-95 dark:bg-opacity-95 flex flex-col items-center justify-center space-y-4 transform transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        aria-hidden={!isOpen}
      >
        <NavLink href="/home">Home</NavLink>
        <NavLink href="/quiz">Quiz</NavLink>
        <NavLink href="/leaderboard">Leaderboard</NavLink>
        <NavLink href="/analytics">Analytics</NavLink>
        <ThemeToggle />
      </div>
    </nav>
  );
} 