'use client';

export default function Input({ type = 'text', value, onChange, placeholder, className = '' }) {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`border rounded-md p-2 w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 
        focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-primary-dark
        ${className}`}
    />
  );
} 