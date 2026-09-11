import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ThemeProvider, useTheme } from './use-theme';

const STORAGE_KEY = 'erebus-theme';

/** Drives clause 2 of the §9.3 contract — jsdom does not implement matchMedia. */
const stubPrefersDark = (matches: boolean): void => {
  vi.spyOn(window, 'matchMedia').mockImplementation(
    (query: string) =>
      ({
        matches,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }) as unknown as MediaQueryList,
  );
};

const renderTheme = () => renderHook(() => useTheme(), { wrapper: ThemeProvider });

describe('useTheme', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('reads a persisted theme from localStorage', () => {
    localStorage.setItem(STORAGE_KEY, 'dark');
    stubPrefersDark(false);

    const { result } = renderTheme();

    expect(result.current.theme).toBe('dark');
  });

  it.each([
    [true, 'dark'],
    [false, 'light'],
  ])(
    'falls back to prefers-color-scheme (dark: %s) when nothing is persisted',
    (dark, expected) => {
      stubPrefersDark(dark);

      const { result } = renderTheme();

      expect(result.current.theme).toBe(expected);
    },
  );

  it('ignores an invalid persisted value and falls back to the system preference', () => {
    localStorage.setItem(STORAGE_KEY, 'vermilion');
    stubPrefersDark(true);

    const { result } = renderTheme();

    expect(result.current.theme).toBe('dark');
  });

  it('writes data-theme on the document element', () => {
    localStorage.setItem(STORAGE_KEY, 'dark');
    stubPrefersDark(false);

    renderTheme();

    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('flips the theme and persists it on an explicit toggle', () => {
    stubPrefersDark(false);

    const { result } = renderTheme();
    act(() => result.current.toggle());

    expect(result.current.theme).toBe('dark');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    expect(localStorage.getItem(STORAGE_KEY)).toBe('dark');
  });

  it('toggles back from dark to light', () => {
    localStorage.setItem(STORAGE_KEY, 'dark');
    stubPrefersDark(true);

    const { result } = renderTheme();
    act(() => result.current.toggle());

    expect(result.current.theme).toBe('light');
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    expect(localStorage.getItem(STORAGE_KEY)).toBe('light');
  });

  it('never persists the system-derived value', () => {
    stubPrefersDark(true);

    const { result } = renderTheme();

    expect(result.current.theme).toBe('dark');
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it('survives a storage that throws on read', () => {
    stubPrefersDark(true);
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('Access to site data is blocked.');
    });

    const { result } = renderTheme();

    expect(result.current.theme).toBe('dark');
  });

  it('survives a storage that throws on write', () => {
    stubPrefersDark(false);
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('Quota exceeded.');
    });

    const { result } = renderTheme();
    act(() => result.current.toggle());

    expect(result.current.theme).toBe('dark');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('throws a descriptive error when used outside the provider', () => {
    stubPrefersDark(false);
    vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => renderHook(() => useTheme())).toThrow(/ThemeProvider/);
  });
});
