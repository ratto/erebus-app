import type { Key, ReactNode } from 'react';
import styled from 'styled-components';

/** How a row is weighted: a navigation node, one of its children, or neither. */
export type EntityRowVariant = 'default' | 'group' | 'child';

export interface EntityTableColumn {
  key: string;
  header: string;
  /** Renders the cell in the data font, for a value that is a number or a code. */
  numeric?: boolean;
}

export interface EntityTableProps<T> {
  caption: string;
  columns: readonly EntityTableColumn[];
  rows: readonly T[];
  /** Stable domain id — never the array index and never a name (LLD §11.3). */
  rowKey: (row: T) => Key;
  renderCell: (row: T, columnKey: string) => ReactNode;
  onRowClick?: (row: T) => void;
  /** Accessible name of the row's activation, e.g. "Open Condução". */
  rowActionLabel?: (row: T) => string;
  rowVariant?: (row: T) => EntityRowVariant;
}

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-family: var(--font-body);
  font-size: var(--fs-cell);
`;

const Caption = styled.caption`
  margin-bottom: var(--sp-2);
  color: var(--ink-muted);
  font-family: var(--font-mono);
  font-size: var(--fs-label);
  letter-spacing: 0.16em;
  text-align: left;
  text-transform: uppercase;
`;

const HeadCell = styled.th`
  padding: 9px 14px;
  background: var(--ink);
  color: var(--surface);
  font-family: var(--font-mono);
  font-size: var(--fs-label);
  font-weight: 500;
  letter-spacing: 0.1em;
  text-align: left;
  text-transform: uppercase;
`;

const Row = styled.tr<{ $variant: EntityRowVariant; $clickable: boolean }>`
  border-bottom: var(--hairline) solid var(--rule-table);
  border-left: var(--accent-rule) solid
    ${({ $variant }) => ($variant === 'group' ? 'var(--accent)' : 'transparent')};
  background: ${({ $variant }) => ($variant === 'group' ? 'var(--surface)' : 'transparent')};
  cursor: ${({ $clickable }) => ($clickable ? 'pointer' : 'default')};

  &:hover {
    background: var(--surface);
  }

  &:focus-visible {
    outline: var(--accent-rule) solid var(--accent);
    outline-offset: -3px;
  }
`;

const Cell = styled.td<{
  $numeric: boolean;
  $variant: EntityRowVariant;
  $first: boolean;
}>`
  padding: 9px 14px;
  padding-left: ${({ $first, $variant }) =>
    $first && $variant === 'child' ? 'var(--sp-7)' : '14px'};
  color: var(--ink);
  font-family: ${({ $numeric }) => ($numeric ? 'var(--font-mono)' : 'var(--font-body)')};
  font-size: ${({ $numeric }) => ($numeric ? 'var(--fs-data)' : 'var(--fs-cell)')};
  font-weight: ${({ $variant, $first }) => ($first && $variant === 'group' ? 500 : 400)};
  vertical-align: top;
`;

/**
 * The listing primitive: a real semantic table, per Códice's amendment 2.
 *
 * Generic over the row entity and deliberately dumb — it receives rows already
 * filtered, sorted and ordered by the ViewModel, and asks the caller to render
 * each cell. Rows are activatable by mouse **and** keyboard (Enter or Space), so
 * a hierarchy can be navigated without a pointer, and `rowVariant` lets a caller
 * mark a navigation node distinctly from a playable leaf without this component
 * knowing any domain rule.
 */
export function EntityTable<T>({
  caption,
  columns,
  rows,
  rowKey,
  renderCell,
  onRowClick,
  rowActionLabel,
  rowVariant,
}: EntityTableProps<T>) {
  const clickable = onRowClick !== undefined;

  return (
    <Table>
      <Caption>{caption}</Caption>
      <thead>
        <tr>
          {columns.map((column) => (
            <HeadCell key={column.key} scope="col">
              {column.header}
            </HeadCell>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => {
          const variant = rowVariant?.(row) ?? 'default';

          return (
            <Row
              key={rowKey(row)}
              $variant={variant}
              $clickable={clickable}
              {...(clickable
                ? {
                    tabIndex: 0,
                    role: 'button',
                    'aria-label': rowActionLabel?.(row),
                    onClick: () => onRowClick(row),
                    onKeyDown: (event) => {
                      if (event.key !== 'Enter' && event.key !== ' ') return;
                      event.preventDefault();
                      onRowClick(row);
                    },
                  }
                : {})}
            >
              {columns.map((column, index) => (
                <Cell
                  key={column.key}
                  $numeric={column.numeric ?? false}
                  $variant={variant}
                  $first={index === 0}
                >
                  {renderCell(row, column.key)}
                </Cell>
              ))}
            </Row>
          );
        })}
      </tbody>
    </Table>
  );
}
