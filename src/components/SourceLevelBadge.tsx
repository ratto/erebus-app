import styled from 'styled-components';
import { SourceLevel } from '@/models/provenance';

const LABEL: Record<SourceLevel, string> = {
  [SourceLevel.Canonical]: 'L1 · CANONICAL',
  [SourceLevel.Official]: 'L2 · OFFICIAL',
  [SourceLevel.Community]: 'L3 · COMMUNITY',
};

const COMPACT_LABEL: Record<SourceLevel, string> = {
  [SourceLevel.Canonical]: 'L1',
  [SourceLevel.Official]: 'L2',
  [SourceLevel.Community]: 'L3',
};

const COLOUR: Record<SourceLevel, string> = {
  [SourceLevel.Canonical]: 'var(--accent)',
  [SourceLevel.Official]: 'var(--accent-2-on-light)',
  [SourceLevel.Community]: 'var(--ink-muted)',
};

const Badge = styled.span<{ $level: SourceLevel }>`
  display: inline-block;
  padding: 0 var(--sp-1);
  border: var(--hairline) ${({ $level }) => ($level === SourceLevel.Community ? 'dashed' : 'solid')}
    ${({ $level }) => COLOUR[$level]};
  border-radius: 0;
  color: ${({ $level }) => COLOUR[$level]};
  font-family: var(--font-mono);
  font-size: var(--fs-badge);
  letter-spacing: 0.1em;
  white-space: nowrap;
`;

export interface SourceLevelBadgeProps {
  level: SourceLevel;
  /** Short form (`L1`) for a table cell; the long form carries the word. */
  compact?: boolean;
}

/**
 * The provenance level of a record, rendered as a rubric.
 *
 * Legible **without colour**: the level is spelled out in the label and L3 is
 * additionally distinguished by a dashed border, so a Level 2/3 record can never
 * be mistaken for canonical in monochrome (LLD §9.4, PRD §5 risk). The long form
 * is always in the accessible name, even when the short form is displayed.
 */
export function SourceLevelBadge({ level, compact = false }: SourceLevelBadgeProps) {
  return (
    <Badge $level={level} title={LABEL[level]} aria-label={LABEL[level]}>
      {compact ? COMPACT_LABEL[level] : LABEL[level]}
    </Badge>
  );
}
