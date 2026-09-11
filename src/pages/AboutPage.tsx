import styled from 'styled-components';

const Title = styled.h1`
  font-size: var(--fs-h2);
  color: var(--ink);
  margin-bottom: var(--sp-4);
`;

const Body = styled.p`
  max-width: 62ch;
  color: var(--ink-muted);
`;

/** Institutional page. Static copy for now — LLD §15 item 6 is open. */
export default function AboutPage() {
  return (
    <section aria-labelledby="about-title">
      <Title id="about-title">About</Title>
      <Body>
        Erebus is a consultation tool for players and game masters. Every record carries its source
        level, so canonical rules are never confused with community material.
      </Body>
    </section>
  );
}
