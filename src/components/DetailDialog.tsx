import { useEffect, useId, useRef } from 'react';
import type { ReactNode } from 'react';
import styled from 'styled-components';

const Backdrop = styled.div`
  position: fixed;
  inset: 0;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: var(--sp-7) var(--sp-4);
  background: rgb(0 0 0 / 45%);
  overflow-y: auto;
`;

const Panel = styled.div`
  width: min(720px, 100%);
  padding: var(--sp-6);
  border: var(--hairline) solid var(--rule);
  border-left: var(--accent-rule) solid var(--accent);
  border-radius: 0;
  background: var(--surface);
`;

const Header = styled.header`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--sp-4);
  margin-bottom: var(--sp-4);
`;

const Title = styled.h2`
  color: var(--ink);
  font-family: var(--font-display);
  font-size: var(--fs-h3);
  font-weight: 500;
`;

const CloseButton = styled.button`
  padding: var(--sp-1) var(--sp-3);
  border: var(--hairline) solid var(--rule);
  border-radius: 0;
  background: transparent;
  color: var(--ink);
  font-family: var(--font-mono);
  font-size: var(--fs-label);
  letter-spacing: 0.12em;
  text-transform: uppercase;
  cursor: pointer;

  &:hover {
    border-color: var(--accent);
    color: var(--accent);
  }
`;

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea, [tabindex]:not([tabindex="-1"])';

export interface DetailDialogProps {
  title: string;
  onClose: () => void;
  children: ReactNode;
}

/**
 * The modal shell every detail route renders inside.
 *
 * The route is nested under its listing, so the dialog is deep-linkable and the
 * browser back button closes it (LLD §5.1, §5.3). Keyboard contract: focus moves
 * into the panel on open, `Tab` cycles inside it, `Escape` closes it, and focus
 * returns to the element that opened it — the row — when it unmounts.
 */
export function DetailDialog({ title, onClose, children }: DetailDialogProps) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);

  // Focus management is a mount/unmount concern, kept apart from the key handler
  // so a new `onClose` identity never re-steals focus mid-interaction.
  useEffect(() => {
    const opener = document.activeElement;
    panelRef.current?.focus();

    return () => {
      if (opener instanceof HTMLElement) opener.focus();
    };
  }, []);

  useEffect(() => {
    const panel = panelRef.current;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== 'Tab' || panel === null) return;

      const focusable = [...panel.querySelectorAll<HTMLElement>(FOCUSABLE)];
      const first = focusable[0] ?? panel;
      const last = focusable[focusable.length - 1] ?? panel;
      const active = document.activeElement;

      if (event.shiftKey && (active === first || active === panel)) {
        event.preventDefault();
        last.focus();
        return;
      }
      if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  return (
    <Backdrop>
      <Panel ref={panelRef} role="dialog" aria-modal="true" aria-labelledby={titleId} tabIndex={-1}>
        <Header>
          <Title id={titleId}>{title}</Title>
          <CloseButton type="button" onClick={onClose}>
            Close
          </CloseButton>
        </Header>
        {children}
      </Panel>
    </Backdrop>
  );
}
