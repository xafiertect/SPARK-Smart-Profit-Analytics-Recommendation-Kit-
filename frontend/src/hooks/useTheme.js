import { useState, useEffect, useCallback } from 'react';

const THEME_KEY = 'spark-theme';

export function useTheme() {
  const [theme, setThemeState] = useState(() => {
    return document.documentElement.dataset.theme || localStorage.getItem(THEME_KEY) || 'dark';
  });

  // Sync state when data-theme attribute changes (e.g. from AppShell toggle)
  useEffect(() => {
    const observer = new MutationObserver(() => {
      const current = document.documentElement.dataset.theme;
      if (current) setThemeState(current);
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, []);

  const setTheme = useCallback((newTheme) => {
    document.documentElement.dataset.theme = newTheme;
    localStorage.setItem(THEME_KEY, newTheme);
    setThemeState(newTheme);
  }, []);

  return { theme, setTheme };
}
