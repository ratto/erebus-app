import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FilterBar } from '@/components/FilterBar';
import { SourceLevel } from '@/models/provenance';

describe('FilterBar', () => {
  it('renders the source level control with every level plus "Any"', () => {
    render(
      <FilterBar
        sourceLevel={null}
        onSourceLevelChange={vi.fn()}
        isFiltered={false}
        onClear={vi.fn()}
      />,
    );

    const select = screen.getByRole('combobox', { name: 'Source level' });
    expect(select).toHaveValue('');
    ['Any', 'L1 · Canonical', 'L2 · Official', 'L3 · Community'].forEach((label) => {
      expect(screen.getByRole('option', { name: label })).toBeInTheDocument();
    });
  });

  it('raises onSourceLevelChange with the numeric level, and null for "Any"', async () => {
    const onSourceLevelChange = vi.fn();
    render(
      <FilterBar
        sourceLevel={SourceLevel.Canonical}
        onSourceLevelChange={onSourceLevelChange}
        isFiltered
        onClear={vi.fn()}
      />,
    );

    await userEvent.selectOptions(
      screen.getByRole('combobox', { name: 'Source level' }),
      'L2 · Official',
    );
    expect(onSourceLevelChange).toHaveBeenCalledWith(2);

    await userEvent.selectOptions(screen.getByRole('combobox', { name: 'Source level' }), 'Any');
    expect(onSourceLevelChange).toHaveBeenCalledWith(null);
  });

  it('omits the second facet entirely when none is given (D21 — no unbacked facet)', () => {
    render(
      <FilterBar
        sourceLevel={null}
        onSourceLevelChange={vi.fn()}
        isFiltered={false}
        onClear={vi.fn()}
      />,
    );

    expect(screen.queryByRole('combobox', { name: 'Base attribute' })).not.toBeInTheDocument();
  });

  it('renders a facet backed by an Entity field, and raises its own onChange', async () => {
    const onChange = vi.fn();
    render(
      <FilterBar
        sourceLevel={null}
        onSourceLevelChange={vi.fn()}
        facet={{ label: 'Base attribute', value: 'AGI', options: ['AGI', 'DEX'], onChange }}
        isFiltered={false}
        onClear={vi.fn()}
      />,
    );

    const facetSelect = screen.getByRole('combobox', { name: 'Base attribute' });
    expect(facetSelect).toHaveValue('AGI');

    await userEvent.selectOptions(facetSelect, 'DEX');
    expect(onChange).toHaveBeenCalledWith('DEX');
  });

  it('shows the clear action only while something is filtered, and fires onClear', async () => {
    const onClear = vi.fn();
    const { rerender } = render(
      <FilterBar
        sourceLevel={null}
        onSourceLevelChange={vi.fn()}
        isFiltered={false}
        onClear={onClear}
      />,
    );
    expect(screen.queryByRole('button', { name: 'Clear filters' })).not.toBeInTheDocument();

    rerender(
      <FilterBar sourceLevel={null} onSourceLevelChange={vi.fn()} isFiltered onClear={onClear} />,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Clear filters' }));

    expect(onClear).toHaveBeenCalledTimes(1);
  });
});
