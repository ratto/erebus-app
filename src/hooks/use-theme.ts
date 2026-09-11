import {
  createContext,
  createElement,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { ReactElement, ReactNode } from 'react';

export type Theme = 'light' | 'dark';

export interface ThemeContextValue {
  theme: Theme;
  /** Flips the theme AND persists the result — the only persisting path. */
  toggle: () => void;
}

/** The single key this application is allowed to keep in localStorage (LLD §9.3). */
const STORAGE_KEY = 'erebus-theme';

const ThemeContext = createContext<ThemeContextValue | null>(null);

const isTheme = (value: unknown): value is Theme => value === 'light' || value === 'dark';

/** Reads the persisted preference. Blocked site data MUST NOT break the app. */
function readStoredTheme(): Theme | null {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return isTheme(stored) ? stored : null;
  } catch {
    return null;
  }
}

/** Persists an explicit user choice. Never called with a system-derived value. */
function storeTheme(theme: Theme): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // A blocked or full storage costs the user persistence, never the app.
  }
}

const systemTheme = (): Theme =>
  window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

/** Applies the theme where the Sass tokens expect it: `data-theme` on <html>. */
function applyTheme(theme: Theme): void {
  document.documentElement.setAttribute('data-theme', theme);
}

const resolveInitialTheme = (): Theme => readStoredTheme() ?? systemTheme();

/**
 * Owns the only shared state of the application — a UI preference, not domain
 * data (LLD §4.4, §9.3).
 *
 * Written with `createElement` rather than JSX so the file keeps the `.ts`
 * extension the LLD §3 tree and CONTRACT §4.3 name.
 */
export function ThemeProvider({ children }: { children: ReactNode }): ReactElement {
  const [theme, setTheme] = useState<Theme>(resolveInitialTheme);

  // The document is an external system: synchronising it belongs in an effect,
  // never in the render pass.
  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const toggle = useCallback(() => {
    setTheme((current) => {
      const next: Theme = current === 'dark' ? 'light' : 'dark';
      storeTheme(next);
      return next;
    });
  }, []);

  const value = useMemo<ThemeContextValue>(() => ({ theme, toggle }), [theme, toggle]);

  return createElement(ThemeContext.Provider, { value }, children);
}

/**
 * Reads the current theme and the toggle action.
 *
 * @throws Error when called outside ThemeProvider.
 */
export function useTheme(): ThemeContextValue {
  const value = useContext(ThemeContext);
  if (value === null) {
    throw new Error('useTheme must be called inside a ThemeProvider.');
  }
  return value;
}
