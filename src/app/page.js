import Link from 'next/link';

export default function Welcome() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-500 to-purple-600 flex flex-col items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full">
        <h1 className="text-4xl font-bold text-center text-gray-800 mb-8">Welcome to KnowBall</h1>
        <p className="text-center text-gray-600 mb-8">
          Test your knowledge and compete with others in this exciting quiz game!
        </p>
        <div className="space-y-4">
          <Link 
            href="/signup"
            className="block w-full bg-blue-600 text-white text-center py-3 rounded-lg hover:bg-blue-700 transition duration-200"
          >
            Sign Up
          </Link>
          <Link 
            href="/login"
            className="block w-full bg-gray-200 text-gray-800 text-center py-3 rounded-lg hover:bg-gray-300 transition duration-200"
          >
            Log In
          </Link>
        </div>
      </div>
    </div>
  );
} 