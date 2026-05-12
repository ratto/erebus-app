import { useQuasar } from 'quasar';

export type ErebusMessageTimeout = number;

export interface ErebusMessageOptions {
  timeout?: ErebusMessageTimeout;
}

export interface ErebusMessageResult {
  dismiss: () => void;
}

export interface ErebusMessageFactory {
  success: (message: string, options?: ErebusMessageOptions) => void;
  info: (message: string, options?: ErebusMessageOptions) => void;
  warning: (message: string, options?: ErebusMessageOptions) => void;
  danger: (message: string, options?: ErebusMessageOptions) => void;
  continuous: (message: string) => ErebusMessageResult;
}

export function erebusMessage(): ErebusMessageFactory {
  const $q = useQuasar();

  const closeAction = { icon: 'close', color: 'white', handler: () => undefined };

  return {
    success(message: string, options?: ErebusMessageOptions): void {
      $q.notify({
        message,
        position: 'top',
        timeout: options?.timeout ?? 2500,
        color: 'transparent',
        textColor: 'white',
        classes: 'erebus-notify erebus-notify--success',
        icon: 'check_circle',
        actions: [closeAction],
      });
    },

    info(message: string, options?: ErebusMessageOptions): void {
      $q.notify({
        message,
        position: 'top',
        timeout: options?.timeout ?? 2500,
        color: 'transparent',
        textColor: 'white',
        classes: 'erebus-notify erebus-notify--info',
        icon: 'info',
        actions: [closeAction],
      });
    },

    warning(message: string, options?: ErebusMessageOptions): void {
      $q.notify({
        message,
        position: 'top',
        timeout: options?.timeout ?? 2500,
        color: 'transparent',
        textColor: 'white',
        classes: 'erebus-notify erebus-notify--warning',
        icon: 'warning',
        actions: [closeAction],
      });
    },

    danger(message: string, options?: ErebusMessageOptions): void {
      $q.notify({
        message,
        position: 'top',
        timeout: options?.timeout ?? 2500,
        color: 'transparent',
        textColor: 'white',
        classes: 'erebus-notify erebus-notify--danger',
        icon: 'error',
        actions: [closeAction],
      });
    },

    continuous(message: string): ErebusMessageResult {
      const notif = $q.notify({
        message,
        position: 'top',
        timeout: 0,
        color: 'transparent',
        textColor: 'white',
        classes: 'erebus-notify erebus-notify--continuous',
        icon: 'hourglass_empty',
        spinner: true,
      });
      return { dismiss: () => notif() };
    },
  };
}
