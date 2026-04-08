import { createI18n } from 'vue-i18n';

import messages from 'src/i18n';

export type MessageLanguages = keyof typeof messages;
// Type-define 'pt-BR' as the master schema for the resource
export type MessageSchema = (typeof messages)['pt-BR'];

// See https://vue-i18n.intlify.dev/guide/advanced/typescript.html#global-resource-schema-type-definition
/* eslint-disable @typescript-eslint/no-empty-object-type */
declare module 'vue-i18n' {
  // define the locale messages schema
  export interface DefineLocaleMessage extends MessageSchema {}

  // define the datetime format schema
  export interface DefineDateTimeFormat {}

  // define the number format schema
  export interface DefineNumberFormat {}
}
/* eslint-enable @typescript-eslint/no-empty-object-type */

export const i18n = createI18n<{ message: MessageSchema }, MessageLanguages>({
  locale: (localStorage.getItem('erebus_locale') as MessageLanguages) ?? 'pt-BR',
  legacy: false,
  messages,
});

export default function ({ app }: { app: { use: (plugin: unknown) => unknown } }) {
  app.use(i18n);
}
