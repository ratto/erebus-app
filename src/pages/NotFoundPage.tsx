import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { ROUTES } from '@/routes';

const Title = styled.h1`
  font-size: var(--fs-h2);
  color: var(--accent);
  margin-bottom: var(--sp-4);
`;

const Body = styled.p`
  max-width: 62ch;
  color: var(--ink-muted);
  margin-bottom: var(--sp-5);
`;

/** Catch-all route. */
export default function NotFoundPage() {
  return (
    <section aria-labelledby="not-found-title">
      <Title id="not-found-title">Page not found</Title>
      <Body>The page you asked for does not exist.</Body>
      <Link to={ROUTES.home}>Back to the home page</Link>
    </section>
  );
}
