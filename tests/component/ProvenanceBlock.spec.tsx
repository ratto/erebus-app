import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProvenanceBlock } from '@/components/ProvenanceBlock';
import { SourceLevel } from '@/models/provenance';

describe('ProvenanceBlock', () => {
  it('renders the source citation and edition of a fully-provenanced record', () => {
    render(
      <ProvenanceBlock
        provenance={{
          sourceLevel: SourceLevel.Canonical,
          source: 'pericias.json → Condução.subgrupos · manual l.809',
          editionOrVersion: 'Manual Básico 1.04 (dez/2022)',
        }}
      />,
    );

    expect(screen.getByRole('region', { name: 'Provenance' })).toBeInTheDocument();
    expect(screen.getByText('L1 · CANONICAL')).toBeInTheDocument();
    expect(
      screen.getByText('Source: pericias.json → Condução.subgrupos · manual l.809'),
    ).toBeInTheDocument();
    expect(screen.getByText(/^Edition:/)).toHaveTextContent('Manual Básico 1.04 (dez/2022)');
  });

  it('does not collapse when editionOrVersion is null — the row states it is not recorded', () => {
    render(
      <ProvenanceBlock
        provenance={{
          sourceLevel: SourceLevel.Community,
          source: 'homebrew.json',
          editionOrVersion: null,
        }}
      />,
    );

    expect(screen.getByText(/^Edition:/)).toBeInTheDocument();
    expect(screen.getByText('not recorded')).toBeInTheDocument();
  });
});
