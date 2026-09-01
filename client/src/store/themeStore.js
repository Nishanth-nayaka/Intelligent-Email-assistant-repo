import { useEffect, useState } from 'react';

const STORAGE_KEY = 'theme';

export function getStoredTheme() {
  if (typeof window === 'undefined') return null;
  const stored = window.localStorage.getItem(STORAGE_KEY);
  return stored === 'light' || stored === 'dark' ? stored : null;
}

export function getInitialTheme() {
  const stored = getStoredTheme();
  if (stored) return stored;
  if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
  return 'light';
}

export function applyTheme(theme) {
  if (typeof document === 'undefined') return;
  document.documentElement.classList.toggle('dark', theme === 'dark');
}

export function saveTheme(theme) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, theme);
}

export function useTheme() {
  // Null until mounted so server and first client render agree (the inline
  // script in _document.js has already set the correct class on <html>).
  const [theme, setThemeState] = useState(null);
  useEffect(() => {
    setThemeState(getInitialTheme());
  }, []);
  function setTheme(next) {
    applyTheme(next);
    saveTheme(next);
    setThemeState(next);
  }
  return {
    theme,
    setTheme,
    toggle: () => setTheme((getInitialTheme() === 'dark' ? 'light' : 'dark'))
  };
}