'use client';

import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import Navigation from '@/components/Navigation';
import { ThemeProvider } from 'next-themes';
import { usePathname } from 'next/navigation';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Knowball',
  description: 'Test your knowledge with Knowball',
};

export default function RootLayout({ children }) {
  const path = usePathname();
  const showHeader = !['/login', '/signup'].includes(path);

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AuthProvider>
            {showHeader && (
              <header className="w-full bg-white dark:bg-gray-800 shadow">
                <div className="max-w-screen-xl mx-auto px-4 py-3">
                  <Navigation />
                </div>
              </header>
            )}
            <main>{children}</main>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
} 