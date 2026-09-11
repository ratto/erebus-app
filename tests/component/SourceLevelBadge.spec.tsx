import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SourceLevelBadge } from '@/components/SourceLevelBadge';
import { SourceLevel } from '@/models/provenance';

describe('SourceLevelBadge', () => {
  it.each([
    [SourceLevel.Canonical, 'L1 · CANONICAL'],
    [SourceLevel.Official, 'L2 · OFFICIAL'],
    [SourceLevel.Community, 'L3 · COMMUNITY'],
  ])('renders the long-form textual label for level %s', (level, label) => {
    render(<SourceLevelBadge level={level} />);

    expect(screen.getByText(label)).toBeInTheDocument();
  });

  it('renders the short form in a table cell while keeping the long form as the accessible name', () => {
    render(<SourceLevelBadge level={SourceLevel.Official} compact />);

    expect(screen.getByText('L2')).toBeInTheDocument();
    expect(screen.getByLabelText('L2 · OFFICIAL')).toBeInTheDocument();
  });

  it('distinguishes Level 3 (community) from canonical/official without relying on colour', () => {
    const { container: canonical } = render(<SourceLevelBadge level={SourceLevel.Canonical} />);
    const { container: community } = render(<SourceLevelBadge level={SourceLevel.Community} />);

    // The word "COMMUNITY" is always in the text — legible in monochrome. The
    // dashed-vs-solid border rule is also encoded as a distinct styled-components
    // class per level (jsdom does not resolve the underlying CSS custom
    // properties, so the class identity is the reliable proxy here).
    expect(screen.getByText('L3 · COMMUNITY')).toBeInTheDocument();
    const canonicalClass = canonical.querySelector('span')?.className;
    const communityClass = community.querySelector('span')?.className;
    expect(canonicalClass).not.toBe(communityClass);
  });

  it('every level renders a mutually distinct label, legible without colour', () => {
    const labels = [SourceLevel.Canonical, SourceLevel.Official, SourceLevel.Community].map(
      (level) => {
        const { unmount, container } = render(<SourceLevelBadge level={level} />);
        const text = container.textContent;
        unmount();
        return text;
      },
    );

    expect(new Set(labels).size).toBe(labels.length);
  });
});
