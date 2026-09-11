import { useId } from 'react';
import styled from 'styled-components';

const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--sp-1);
  margin-bottom: var(--sp-4);
`;

const Label = styled.label`
  color: var(--ink-muted);
  font-family: var(--font-mono);
  font-size: var(--fs-label);
  letter-spacing: 0.16em;
  text-transform: uppercase;
`;

const Input = styled.input`
  max-width: 420px;
  padding: var(--sp-2) var(--sp-3);
  border: var(--hairline) solid var(--rule);
  border-radius: 0;
  background: var(--surface);
  color: var(--ink);
  font-family: var(--font-body);
  font-size: var(--fs-field);

  &:focus-visible {
    outline: var(--accent-rule) solid var(--accent);
    outline-offset: 0;
  }
`;

export interface SearchFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

/**
 * A single free-text search control, bound to a real `<label>`.
 *
 * Controlled by the ViewModel: it holds no state of its own, so the value in the
 * URL and the value on screen can never disagree. Typing raises `onChange` per
 * keystroke; the hook filters in memory and issues no request (LLD §4.6).
 */
export function SearchField({ label, value, onChange }: SearchFieldProps) {
  const id = useId();

  return (
    <Field>
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type="search"
        value={value}
        autoComplete="off"
        onChange={(event) => onChange(event.target.value)}
      />
    </Field>
  );
}
