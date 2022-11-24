import { ToastMessage } from './toast-message';

export type Events = {
  toast: ToastMessage;
  '*': any;
};
