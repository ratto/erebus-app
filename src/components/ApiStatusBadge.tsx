import styled from 'styled-components';
import { useApiHealth } from '@/hooks/use-api-health';
import { ApiErrorKind } from '@/models/api-error';

type BadgeVariant = 'pending' | 'ok' | 'degraded' | 'error';

const VARIANT_COLOUR: Record<BadgeVariant, string> = {
  pending: 'var(--ink-muted)',
  ok: 'var(--ink)',
  degraded: 'var(--accent-2-on-light)',
  error: 'var(--accent)',
};

/** Copy is chosen from the failure kind — never from a message or a detail. */
const ERROR_COPY: Record<ApiErrorKind, string> = {
  [ApiErrorKind.Network]: 'API unreachable',
  [ApiErrorKind.Timeout]: 'API timed out',
  [ApiErrorKind.Contract]: 'Unexpected API response',
  [ApiErrorKind.NotFound]: 'API error',
  [ApiErrorKind.Validation]: 'API error',
  [ApiErrorKind.Server]: 'API error',
};

const Badge = styled.span<{ $variant: BadgeVariant }>`
  display: inline-flex;
  align-items: center;
  padding: var(--sp-1) var(--sp-2);
  border: var(--hairline) ${({ $variant }) => ($variant === 'error' ? 'dashed' : 'solid')}
    ${({ $variant }) => VARIANT_COLOUR[$variant]};
  border-radius: 0;
  color: ${({ $variant }) => VARIANT_COLOUR[$variant]};
  font-family: var(--font-mono);
  font-size: var(--fs-badge);
  letter-spacing: 0.1em;
  text-transform: uppercase;
  white-space: nowrap;
`;

/**
 * Ambient indicator of the erebus-api health probe. Takes no props: it consumes
 * and destructures the ViewModel itself (LLD §8.7). A failing probe must never
 * block the surrounding layout, and raises no toast (ADR-003).
 */
export function ApiStatusBadge() {
  const { status, apiStatus, version, errorKind } = useApiHealth();

  if (status === 'error') {
    return (
      <Badge $variant="error" role="status" aria-live="polite">
        {errorKind === null ? 'API error' : ERROR_COPY[errorKind]}
      </Badge>
    );
  }

  if (status === 'ready' && apiStatus !== null) {
    const variant: BadgeVariant = apiStatus === 'ok' ? 'ok' : 'degraded';
    const label = apiStatus === 'ok' ? 'API online' : 'API degraded';

    return (
      <Badge $variant={variant} role="status" aria-live="polite">
        {version === null ? label : `${label} · v${version}`}
      </Badge>
    );
  }

  return (
    <Badge $variant="pending" role="status" aria-live="polite" aria-busy="true">
      Checking API…
    </Badge>
  );
}
