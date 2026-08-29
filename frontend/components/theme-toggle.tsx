'use client';

import { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/lib/theme';

export const ThemeToggle = ({
  className = '',
  size = 'md',
}: {
  className?: string;
  size?: 'sm' | 'md';
}) => {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = theme === 'dark';

  const sizeClasses =
    size === 'sm'
      ? 'size-8 rounded-md p-1.5'
      : 'size-9 rounded-lg p-2';

  if (!mounted) {
    return (
      <div
        className={`inline-flex items-center justify-center border border-transparent opacity-0 ${sizeClasses} ${className}`}
        aria-hidden="true"
      />
    );
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      title={isDark ? 'Switch to Light Mode' : 'Switch to GitHub Dark Mode'}
      aria-label={isDark ? 'Switch to Light Mode' : 'Switch to GitHub Dark Mode'}
      className={`relative inline-flex items-center justify-center cursor-pointer transition-all duration-200 text-secondary hover:text-primary bg-surface hover:bg-elevated shadow active:scale-95 ${sizeClasses} ${className}`}
    > 
      <span className="sr-only">Toggle theme</span>
      {isDark ? (
        <Sun className="size-4 text-amber-400 transition-transform duration-200 hover:rotate-45" />
      ) : (
        <Moon className="size-4 text-indigo-600 transition-transform duration-200 hover:-rotate-12" />
      )}
    </button>
  );
};
