import styled from 'styled-components';
import { ApiErrorKind } from '@/models/api-error';

const Block = styled.div`
  padding: var(--sp-5);
  border: var(--hairline) solid var(--accent);
  border-left: var(--accent-rule) solid var(--accent);
  border-radius: 0;
  background: var(--surface);
`;

const Title = styled.p`
  color: var(--accent);
  font-family: var(--font-body);
  font-size: var(--fs-cell);
  font-weight: 500;
`;

const Explanation = styled.p`
  margin-top: var(--sp-2);
  color: var(--ink-muted);
  font-family: var(--font-body);
  font-size: var(--fs-sm);
`;

const Retry = styled.button`
  margin-top: var(--sp-4);
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

/** One distinct message per failure kind — never the API's own message. */
const COPY: Record<ApiErrorKind, { title: string; explanation: string }> = {
  [ApiErrorKind.Network]: {
    title: 'The catalogue service could not be reached',
    explanation: 'The connection failed before the service answered. It may be offline.',
  },
  [ApiErrorKind.Timeout]: {
    title: 'The request took too long',
    explanation: 'The service did not answer in time. Trying again usually works.',
  },
  [ApiErrorKind.NotFound]: {
    title: 'This record no longer exists',
    explanation: 'It may have been removed from the catalogue since the link was made.',
  },
  [ApiErrorKind.Validation]: {
    title: 'The request was rejected',
    explanation: 'The catalogue service refused these parameters. This is a defect in the app.',
  },
  [ApiErrorKind.Contract]: {
    title: 'The catalogue answered in an unexpected shape',
    explanation:
      'The data did not match what this version of the app expects, so nothing is shown rather than showing it wrong.',
  },
  [ApiErrorKind.Server]: {
    title: 'The catalogue service failed',
    explanation: 'Something went wrong on the service side. Nothing was lost — it is read-only.',
  },
};

export interface ErrorStateProps {
  kind: ApiErrorKind;
  onRetry: () => void;
}

/**
 * A failed request, explained in the user's terms.
 *
 * Copy is chosen from `error.kind`; the `ApiError` message and the RFC 7807
 * `detail` are written for developers and are never rendered (LLD §7.2, §8.6).
 * Recovery is always the user's action — there is no automatic retry (§12.4).
 */
export function ErrorState({ kind, onRetry }: ErrorStateProps) {
  const { title, explanation } = COPY[kind];

  return (
    <Block role="alert">
      <Title>{title}</Title>
      <Explanation>{explanation}</Explanation>
      <Retry type="button" onClick={onRetry}>
        Try again
      </Retry>
    </Block>
  );
}
