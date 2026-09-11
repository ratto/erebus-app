import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Skeleton } from '@/components/Skeleton';

describe('Skeleton', () => {
  it('announces itself as busy for assistive technology', () => {
    render(<Skeleton rows={3} />);

    const status = screen.getByRole('status', { name: 'Loading' });
    expect(status).toHaveAttribute('aria-busy', 'true');
  });

  it('draws exactly as many placeholder lines as requested', () => {
    const { container } = render(<Skeleton rows={5} />);

    expect(container.firstElementChild?.children).toHaveLength(5);
  });

  it('draws zero lines for an empty listing without crashing', () => {
    const { container } = render(<Skeleton rows={0} />);

    expect(container.firstElementChild?.children).toHaveLength(0);
  });
});
