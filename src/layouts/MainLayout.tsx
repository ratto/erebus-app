import { Link, Outlet } from 'react-router-dom';
import styled from 'styled-components';
import { ApiStatusBadge } from '@/components/ApiStatusBadge';
import { ThemeToggle } from '@/components/ThemeToggle';
import { ROUTES } from '@/routes';

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
  gap: var(--sp-5);
  padding: var(--sp-4) var(--sp-6);
  border-bottom: var(--hairline) solid var(--rule);
  background: var(--surface);
`;

const Brand = styled(Link)`
  font-family: var(--font-display);
  font-size: var(--fs-h3);
  color: var(--ink);
  text-decoration: none;
`;

const Nav = styled.nav`
  display: flex;
  gap: var(--sp-4);
  font-family: var(--font-mono);
  font-size: var(--fs-label);
  letter-spacing: 0.12em;
  text-transform: uppercase;
`;

const Spacer = styled.div`
  flex: 1;
`;

const Main = styled.main`
  padding: var(--sp-7) var(--sp-6);
`;

/**
 * Shell for every non-landing route: brand, navigation, theme toggle and the
 * ambient API badge. Entity navigation items are added by each entity US
 * (LLD §7.11 step 10).
 */
export function MainLayout() {
  return (
    <>
      <SkipLink href="#main-content">Skip to main content</SkipLink>
      <Header>
        <Brand to={ROUTES.home}>Erebus</Brand>
        <Nav>
          <Link to={ROUTES.home}>Home</Link>
          <Link to={ROUTES.about}>About</Link>
        </Nav>
        <Spacer />
        <ApiStatusBadge />
        <ThemeToggle />
      </Header>
      <Main id="main-content">
        <Outlet />
      </Main>
    </>
  );
}
