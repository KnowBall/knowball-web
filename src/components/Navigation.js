'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { Moon, Sun, Menu, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

function NavLink({ href, children }) {
  const pathname = usePathname();
  const isActive = pathname === href;
  
  return (
    <Link
      href={href}
      className={`px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${
        isActive ? 'text-primary dark:text-primary-dark font-medium' : 'text-gray-700 dark:text-gray-300'
      }`}
    >
      {children}
    </Link>
  );
}

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const { user, isAdmin } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const themeToggleButton = (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
    >
      {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  );

  const signOutButton = user && (
    <button
      onClick={handleSignOut}
      className="px-3 py-1 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
    >
      Sign Out
    </button>
  );

  return (
    <nav className="flex items-center justify-between">
      <div className="flex items-center space-x-6">
        {/* Desktop links */}
        <div className="hidden md:flex space-x-6">
          <NavLink href="/home">Home</NavLink>
          <NavLink href="/game">Quiz</NavLink>
          <NavLink href="/results">Leaderboard</NavLink>
          <NavLink href="/analytics">Analytics</NavLink>
          {isAdmin && <NavLink href="/admin">Admin</NavLink>}
        </div>
      </div>
      <div className="flex items-center space-x-4">
        {/* Theme toggle & sign-out */}
        {themeToggleButton}
        {signOutButton}
        {/* Mobile menu button */}
        <button
          className="md:hidden p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="absolute top-16 left-0 right-0 bg-white dark:bg-gray-800 shadow-lg md:hidden">
          <div className="flex flex-col space-y-2 p-4">
            <NavLink href="/home">Home</NavLink>
            <NavLink href="/game">Quiz</NavLink>
            <NavLink href="/results">Leaderboard</NavLink>
            <NavLink href="/analytics">Analytics</NavLink>
            {isAdmin && <NavLink href="/admin">Admin</NavLink>}
          </div>
        </div>
      )}
    </nav>
  );
} 