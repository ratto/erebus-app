import { Outlet } from 'react-router-dom';
import styled from 'styled-components';
import { ApiStatusBadge } from '@/components/ApiStatusBadge';
import { ThemeToggle } from '@/components/ThemeToggle';

const SkipLink = styled.a`
  position: absolute;
  left: -9999px;

  &:focus {
    position: static;
    display: inline-block;
    padding: var(--sp-2);
    background: var(--surface);
  }
`;

const Header = styled.header`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: var(--sp-4);
  padding: var(--sp-4) var(--sp-6);
`;

const Main = styled.main`
  padding: var(--sp-8) var(--sp-6);
`;

/** Shell for the institutional landing route. */
export function LandingLayout() {
  return (
    <>
      <SkipLink href="#main-content">Skip to main content</SkipLink>
      <Header>
        <ApiStatusBadge />
        <ThemeToggle />
      </Header>
      <Main id="main-content">
        <Outlet />
      </Main>
    </>
  );
}
