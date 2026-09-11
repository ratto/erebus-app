import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { ROUTES } from '@/routes';

const Title = styled.h1`
  font-size: var(--fs-h1);
  color: var(--ink);
  margin-bottom: var(--sp-4);
`;

const Lede = styled.p`
  max-width: 62ch;
  color: var(--ink-muted);
  margin-bottom: var(--sp-5);
`;

/** Institutional landing page. Static copy for now — LLD §15 item 6 is open. */
export default function HomePage() {
  return (
    <section aria-labelledby="home-title">
      <Title id="home-title">Erebus</Title>
      <Lede>
        A read-only catalogue for the Daemon system: weapons, protections, skills and enhancements,
        each shown with the provenance of the record.
      </Lede>
      <Link to={ROUTES.about}>About this project</Link>
    </section>
  );
}
