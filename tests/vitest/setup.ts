/**
 * Vitest global setup file.
 *
 * Configura plugins e componentes globais necessários para testes de
 * componentes Quasar + Vue I18n. Este arquivo é carregado via
 * `setupFiles` no vitest.config.ts e aplica configurações que valem
 * para toda a suite sem precisar alterar arquivos de teste individuais.
 *
 * Problemas resolvidos aqui:
 * 1. `injection "_q_" not found` — Quasar não estava registrado como plugin
 * 2. `Need to install with app.use function` — i18n não estava instalado
 * 3. `<erebus-input>` não resolvido — ErebusInput não estava registrado globalmente
 */

import { config } from '@vue/test-utils';
import { Quasar } from 'quasar';
import { createI18n } from 'vue-i18n';
import enUS from 'src/i18n/en-US';
import ptBR from 'src/i18n/pt-BR';
import ErebusInput from 'src/components/common/ErebusInput.vue';
import ErebusSelect from 'src/components/common/ErebusSelect.vue';
import ErebusTable from 'src/components/common/ErebusTable.vue';

// Instância de i18n compartilhada por todos os testes.
// Legacy: false é obrigatório para Composition API (useI18n).
const i18n = createI18n({
  locale: 'pt-BR',
  legacy: false,
  messages: { 'en-US': enUS, 'pt-BR': ptBR },
});

// Aplica configuração global padrão para todos os wrappers montados via
// mount() / shallowMount(). Testes que precisarem de configuração específica
// podem sobrescrever via mountOptions locais — os plugins são mergeados,
// não substituídos.
config.global.plugins = [[Quasar, {}], i18n];

// Registra os componentes Erebus globalmente para que <erebus-input>,
// <erebus-select> e <erebus-table> sejam resolvidos sem import explícito
// nos arquivos SFC que os utilizam (comportamento equivalente ao auto-import
// do Quasar CLI em ambiente de produção).
config.global.components = {
  ErebusInput,
  ErebusSelect,
  ErebusTable,
};
