import styled from 'styled-components';
import { useTheme } from '@/hooks/use-theme';

const Button = styled.button`
  padding: var(--sp-1) var(--sp-3);
  border: var(--hairline) solid var(--rule);
  border-radius: 0;
  background: transparent;
  color: var(--ink);
  font-family: var(--font-mono);
  font-size: var(--fs-label);
  letter-spacing: 0.12em;
  text-transform: uppercase;
  cursor: pointer;

  &:hover {
    border-color: var(--accent);
    color: var(--accent);
  }
`;

/**
 * Flips the Códice light/dark theme. The accessible name states the **target**
 * theme, so a screen-reader user hears what activating it will do (LLD §9.3).
 */
export function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const target = theme === 'dark' ? 'light' : 'dark';

  return (
    <Button type="button" onClick={toggle}>
      Switch to {target} theme
    </Button>
  );
}
