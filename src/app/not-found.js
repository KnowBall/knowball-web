import Link from 'next/link';
import { Button, Card } from '../../components/ui';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <Card className="w-full max-w-md p-6 text-center">
        <h1 className="text-4xl font-bold mb-4 dark:text-gray-100">404</h1>
        <p className="text-xl mb-6 dark:text-gray-300">Page not found</p>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          The page you are looking for doesn&apos;t exist or has been moved.
        </p>
        <Button variant="primary" as={Link} href="/">
          Go back home
        </Button>
      </Card>
    </div>
  );
} 