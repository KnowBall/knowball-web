export const metadata = {
  title: 'KnowBall',
  description: 'Test your football knowledge with KnowBall!',
};

import Navigation from '../components/Navigation';
import './globals.css';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <header className="w-full bg-white dark:bg-gray-800 shadow">
          <div className="max-w-screen-xl mx-auto px-4 py-3">
            <Navigation />
          </div>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
} 