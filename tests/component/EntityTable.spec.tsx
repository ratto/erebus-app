import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EntityTable } from '@/components/EntityTable';
import type { EntityTableColumn } from '@/components/EntityTable';

interface Row {
  id: number;
  name: string;
}

const columns: EntityTableColumn[] = [
  { key: 'name', header: 'Skill' },
  { key: 'id', header: 'Id', numeric: true },
];

const rows: Row[] = [
  { id: 1, name: 'Condução' },
  { id: 2, name: 'Automóvel' },
];

const renderCell = (row: Row, columnKey: string) => (columnKey === 'name' ? row.name : row.id);

describe('EntityTable', () => {
  it('renders a real semantic table with a caption and one row per entity', () => {
    render(
      <EntityTable
        caption="Skills catalogue"
        columns={columns}
        rows={rows}
        rowKey={(row) => row.id}
        renderCell={renderCell}
      />,
    );

    const table = screen.getByRole('table', { name: 'Skills catalogue' });
    expect(table).toBeInTheDocument();
    expect(screen.getAllByRole('columnheader')).toHaveLength(2);
    expect(screen.getByText('Condução')).toBeInTheDocument();
    expect(screen.getByText('Automóvel')).toBeInTheDocument();
  });

  it('does not make a row keyboard-activatable when no onRowClick is given', () => {
    render(
      <EntityTable
        caption="Skills catalogue"
        columns={columns}
        rows={rows}
        rowKey={(row) => row.id}
        renderCell={renderCell}
      />,
    );

    expect(screen.queryAllByRole('button')).toHaveLength(0);
  });

  it('activates a row by click, using the rowActionLabel as the accessible name', async () => {
    const onRowClick = vi.fn();
    render(
      <EntityTable
        caption="Skills catalogue"
        columns={columns}
        rows={rows}
        rowKey={(row) => row.id}
        renderCell={renderCell}
        onRowClick={onRowClick}
        rowActionLabel={(row) => `Open ${row.name}`}
      />,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Open Condução' }));

    expect(onRowClick).toHaveBeenCalledWith(rows[0]);
  });

  it('activates the focused row with Enter and with Space, and not with any other key', async () => {
    const onRowClick = vi.fn();
    render(
      <EntityTable
        caption="Skills catalogue"
        columns={columns}
        rows={rows}
        rowKey={(row) => row.id}
        renderCell={renderCell}
        onRowClick={onRowClick}
        rowActionLabel={(row) => `Open ${row.name}`}
      />,
    );

    const row = screen.getByRole('button', { name: 'Open Condução' });
    row.focus();

    await userEvent.keyboard('{Enter}');
    expect(onRowClick).toHaveBeenCalledTimes(1);

    await userEvent.keyboard(' ');
    expect(onRowClick).toHaveBeenCalledTimes(2);

    await userEvent.keyboard('{Escape}');
    expect(onRowClick).toHaveBeenCalledTimes(2);
  });

  it('marks a group row distinctly from a playable leaf via rowVariant (AC 7)', () => {
    render(
      <EntityTable
        caption="Skills catalogue"
        columns={columns}
        rows={rows}
        rowKey={(row) => row.id}
        renderCell={renderCell}
        rowVariant={(row) => (row.id === 1 ? 'group' : 'default')}
      />,
    );

    const [groupRow, leafRow] = screen.getAllByRole('row').slice(1); // skip the header row
    expect(groupRow).not.toBe(leafRow);
    // styled-components generates a distinct class per distinct set of styled
    // props ($variant here) — a different class name is this component's own
    // proof that "group" and "default" render with different rules, without
    // this test asserting on jsdom's limited CSS-variable resolution.
    expect(groupRow!.className).not.toBe(leafRow!.className);
  });
});
