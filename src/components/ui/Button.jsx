'use client';

export default function Button({ children, onClick, variant = 'primary', className = '' }) {
  const baseClasses = 'px-4 py-2 rounded-md font-medium transition-colors duration-200';
  
  const variantClasses = {
    primary: 'bg-primary hover:bg-primary-dark text-white dark:bg-primary-dark dark:hover:bg-primary',
    secondary: 'bg-secondary hover:bg-secondary-dark text-gray-800 dark:bg-secondary-dark dark:text-gray-100 dark:hover:bg-secondary'
  };

  return (
    <button
      onClick={onClick}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
    >
      {children}
    </button>
  );
} 