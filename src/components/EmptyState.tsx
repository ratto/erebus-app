import styled from 'styled-components';

const Block = styled.div`
  padding: var(--sp-6);
  border: var(--hairline) dashed var(--rule);
  border-radius: 0;
  background: transparent;
  text-align: center;
`;

const Title = styled.p`
  color: var(--ink);
  font-family: var(--font-body);
  font-size: var(--fs-body);
  font-weight: 500;
`;

const Description = styled.p`
  margin-top: var(--sp-2);
  color: var(--ink-muted);
  font-family: var(--font-body);
  font-size: var(--fs-sm);
`;

const Action = styled.button`
  margin-top: var(--sp-4);
  padding: var(--sp-1) var(--sp-3);
  border: var(--hairline) solid var(--ink-muted);
  border-radius: 0;
  background: transparent;
  color: var(--ink);
  font-family: var(--font-mono);
  font-size: var(--fs-label);
  letter-spacing: 0.12em;
  text-transform: uppercase;
  cursor: pointer;
`;

export interface EmptyStateProps {
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
}

/**
 * Nothing to show — and nothing is wrong.
 *
 * Deliberately dashed and ink-coloured, so it can never be confused with
 * `ErrorState` (solid, accent-coloured). The caller supplies copy that says
 * whether the catalogue is empty or the filter simply matched nothing — the two
 * cases the ViewModel distinguishes through `isEmpty` and `isFiltered`.
 */
export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <Block role="status">
      <Title>{title}</Title>
      {description !== undefined && <Description>{description}</Description>}
      {action !== undefined && (
        <Action type="button" onClick={action.onClick}>
          {action.label}
        </Action>
      )}
    </Block>
  );
}
