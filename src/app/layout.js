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
        <Navigation />
        {children}
      </body>
    </html>
  );
} 