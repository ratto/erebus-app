import { useId } from 'react';
import styled from 'styled-components';
import { SourceLevel } from '@/models/provenance';

const Bar = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: var(--sp-4);
  margin-bottom: var(--sp-5);
  padding-bottom: var(--sp-3);
  border-bottom: var(--hairline) solid var(--rule);
`;

const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--sp-1);
`;

const Label = styled.label`
  color: var(--ink-muted);
  font-family: var(--font-mono);
  font-size: var(--fs-label);
  letter-spacing: 0.16em;
  text-transform: uppercase;
`;

const Select = styled.select`
  padding: var(--sp-1) var(--sp-2);
  border: var(--hairline) solid var(--rule);
  border-radius: 0;
  background: var(--surface);
  color: var(--ink);
  font-family: var(--font-mono);
  font-size: var(--fs-data);
  text-transform: uppercase;

  &:focus-visible {
    outline: var(--accent-rule) solid var(--accent);
  }
`;

const ClearButton = styled.button`
  padding: var(--sp-1) var(--sp-3);
  border: var(--hairline) solid var(--accent);
  border-radius: 0;
  background: transparent;
  color: var(--accent);
  font-family: var(--font-mono);
  font-size: var(--fs-label);
  letter-spacing: 0.12em;
  text-transform: uppercase;
  cursor: pointer;
`;

const SOURCE_LEVEL_LABEL: Record<SourceLevel, string> = {
  [SourceLevel.Canonical]: 'L1 · Canonical',
  [SourceLevel.Official]: 'L2 · Official',
  [SourceLevel.Community]: 'L3 · Community',
};

const ANY = '';

/** One extra facet, backed by a single Entity field of the listed entity. */
export interface FilterBarFacet<T extends string> {
  label: string;
  value: T | null;
  options: readonly T[];
  onChange: (value: T | null) => void;
}

export interface FilterBarProps<T extends string> {
  sourceLevel: SourceLevel | null;
  onSourceLevelChange: (sourceLevel: SourceLevel | null) => void;
  /** Omitted when the entity has no second facet worth filtering on. */
  facet?: FilterBarFacet<T>;
  isFiltered: boolean;
  onClear: () => void;
}

/**
 * The facet controls of a listing, plus the escape hatch that clears them.
 *
 * Only facets **backed by an Entity field** are rendered: the design system's
 * campaign/era facet is deferred out of Phase 1, because no entity in the API
 * carries such a field (LLD §15 item 3). The "clear" action appears only when
 * something is actually filtered, so it never invites a no-op.
 */
export function FilterBar<T extends string>({
  sourceLevel,
  onSourceLevelChange,
  facet,
  isFiltered,
  onClear,
}: FilterBarProps<T>) {
  const sourceLevelId = useId();
  const facetId = useId();

  return (
    <Bar>
      <Field>
        <Label htmlFor={sourceLevelId}>Source level</Label>
        <Select
          id={sourceLevelId}
          value={sourceLevel === null ? ANY : String(sourceLevel)}
          onChange={(event) =>
            onSourceLevelChange(
              event.target.value === ANY ? null : (Number(event.target.value) as SourceLevel),
            )
          }
        >
          <option value={ANY}>Any</option>
          {Object.values(SourceLevel).map((level) => (
            <option key={level} value={level}>
              {SOURCE_LEVEL_LABEL[level]}
            </option>
          ))}
        </Select>
      </Field>

      {facet !== undefined && (
        <Field>
          <Label htmlFor={facetId}>{facet.label}</Label>
          <Select
            id={facetId}
            value={facet.value ?? ANY}
            onChange={(event) =>
              facet.onChange(event.target.value === ANY ? null : (event.target.value as T))
            }
          >
            <option value={ANY}>Any</option>
            {facet.options.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </Select>
        </Field>
      )}

      {isFiltered && (
        <ClearButton type="button" onClick={onClear}>
          Clear filters
        </ClearButton>
      )}
    </Bar>
  );
}
