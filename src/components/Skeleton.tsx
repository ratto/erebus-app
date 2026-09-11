import styled from 'styled-components';

const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--sp-2);
`;

const Line = styled.div`
  height: var(--sp-5);
  border-bottom: var(--hairline) solid var(--rule-table);
  background: var(--surface);
`;

export interface SkeletonProps {
  /** How many placeholder lines to draw. */
  rows: number;
}

/**
 * Placeholder lines while a request is in flight.
 *
 * Códice has no shimmer: the placeholder is ruled paper, not a glass animation.
 * It announces itself as busy so the wait is not silent for a screen reader.
 */
export function Skeleton({ rows }: SkeletonProps) {
  return (
    <List role="status" aria-busy="true" aria-label="Loading">
      {Array.from({ length: rows }, (_, index) => (
        <Line key={index} />
      ))}
    </List>
  );
}
