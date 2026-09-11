import toast from 'react-hot-toast';

/**
 * The only way the application raises a toast, so the library stays replaceable
 * and styled to Códice (LLD §12.3). `notify.success` does not exist in Phase 1:
 * this is a read-only application with no successful mutation to announce.
 */
export const notify = {
  error: (message: string): void => {
    toast.error(message);
  },
  info: (message: string): void => {
    toast(message);
  },
};
