'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Menu, X } from 'lucide-react';

export default function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

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
        isActive(href) ? 'border-blue-500 text-gray-900' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
      }`}
      onClick={() => setIsOpen(false)}
    >
      {children}
    </Link>
  );

  return (
    <nav className="bg-white shadow-lg">
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
            className="block md:hidden p-2"
            aria-label="Toggle menu"
            aria-expanded={isOpen}
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Sign Out Button */}
          <div className="flex items-center">
            <button
              onClick={handleSignOut}
              className="text-gray-500 hover:text-gray-700"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      <div
        id="mobile-menu"
        className={`fixed inset-0 bg-white bg-opacity-95 flex flex-col items-center justify-center space-y-4 transform transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        aria-hidden={!isOpen}
      >
        <NavLink href="/home">Home</NavLink>
        <NavLink href="/quiz">Quiz</NavLink>
        <NavLink href="/leaderboard">Leaderboard</NavLink>
        <NavLink href="/analytics">Analytics</NavLink>
      </div>
    </nav>
  );
} 