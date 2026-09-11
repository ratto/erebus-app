import styled from 'styled-components';
import type { Provenance } from '@/models/provenance';
import { SourceLevelBadge } from './SourceLevelBadge';

const Block = styled.section`
  display: flex;
  flex-direction: column;
  gap: var(--sp-2);
  margin-top: var(--sp-5);
  padding: var(--sp-3);
  border: var(--hairline) solid var(--rule);
  border-radius: 0;
  background: var(--surface);
`;

const Label = styled.h3`
  color: var(--ink-muted);
  font-family: var(--font-mono);
  font-size: var(--fs-label);
  font-weight: 500;
  letter-spacing: 0.16em;
  text-transform: uppercase;
`;

const Line = styled.p`
  color: var(--ink);
  font-family: var(--font-mono);
  font-size: var(--fs-badge);
  overflow-wrap: anywhere;
`;

const Muted = styled.span`
  color: var(--ink-muted);
`;

export interface ProvenanceBlockProps {
  provenance: Provenance;
}

/**
 * Where a record came from: level badge, citation and edition.
 *
 * Mandatory in every detail view (LLD §14 item 7). It does **not** collapse when
 * `editionOrVersion` is null — the row stays, stating that no edition is
 * recorded, so an absent edition is never mistaken for an unverified record.
 */
export function ProvenanceBlock({ provenance }: ProvenanceBlockProps) {
  return (
    <Block aria-label="Provenance">
      <Label>Provenance</Label>
      <SourceLevelBadge level={provenance.sourceLevel} />
      <Line>Source: {provenance.source}</Line>
      <Line>
        Edition:{' '}
        {provenance.editionOrVersion === null ? (
          <Muted>not recorded</Muted>
        ) : (
          provenance.editionOrVersion
        )}
      </Line>
    </Block>
  );
}
