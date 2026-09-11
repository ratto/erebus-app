import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SearchField } from '@/components/SearchField';

describe('SearchField', () => {
  it('renders a labelled search control bound to the given value', () => {
    render(<SearchField label="Search by name" value="Condu" onChange={vi.fn()} />);

    const field = screen.getByRole('searchbox', { name: 'Search by name' });
    expect(field).toHaveValue('Condu');
  });

  it('raises onChange once per keystroke, never calling the prop directly', async () => {
    const onChange = vi.fn();
    render(<SearchField label="Search by name" value="" onChange={onChange} />);

    await userEvent.type(screen.getByRole('searchbox', { name: 'Search by name' }), 'Esq');

    expect(onChange).toHaveBeenCalledTimes(3);
    expect(onChange).toHaveBeenNthCalledWith(1, 'E');
    expect(onChange).toHaveBeenNthCalledWith(3, 'q');
  });

  it('holds no state of its own: rerendering with a new value overrides what was typed', () => {
    const { rerender } = render(
      <SearchField label="Search by name" value="a" onChange={vi.fn()} />,
    );

    rerender(
      <SearchField label="Search by name" value="reset by the ViewModel" onChange={vi.fn()} />,
    );

    expect(screen.getByRole('searchbox')).toHaveValue('reset by the ViewModel');
  });
});
