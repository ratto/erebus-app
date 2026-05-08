import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { type QTableColumn } from 'quasar';
import ErebusTable from 'src/components/common/ErebusTable.vue';

// ─── Mount helper ─────────────────────────────────────────────────────────────

const mountOptions = {
  global: {
    plugins: [],
  },
};

function mountTable(props: Record<string, unknown> = {}, slots: Record<string, string> = {}) {
  return mount(ErebusTable, {
    ...mountOptions,
    props,
    slots,
  });
}

// ─── Fixtures ────────────────────────────────────────────────────────────────

const columns: QTableColumn[] = [
  { name: 'id', label: 'ID', field: 'id', align: 'left' },
  { name: 'name', label: 'Nome', field: 'name', align: 'left' },
];

const rows = [
  { id: 1, name: 'Item A' },
  { id: 2, name: 'Item B' },
];

// ─── Suite ───────────────────────────────────────────────────────────────────

describe('ErebusTable.vue', () => {
  // ── Default props ──────────────────────────────────────────────────────────

  describe('Default props', () => {
    it('renders a q-table', () => {
      const wrapper = mountTable();

      expect(wrapper.findComponent({ name: 'QTable' }).exists()).toBe(true);
    });

    it('applies the erebus-table CSS class to the q-table', () => {
      const wrapper = mountTable();

      expect(wrapper.find('.erebus-table').exists()).toBe(true);
    });

    it('uses rowKey "id" by default', () => {
      const wrapper = mountTable();
      const table = wrapper.findComponent({ name: 'QTable' });

      expect(table.props('rowKey')).toBe('id');
    });

    it('uses rowsPerPageOptions [10, 15, 25, 50] by default', () => {
      const wrapper = mountTable();
      const table = wrapper.findComponent({ name: 'QTable' });

      expect(table.props('rowsPerPageOptions')).toEqual([10, 15, 25, 50]);
    });

    it('passes loading=false by default', () => {
      const wrapper = mountTable();
      const table = wrapper.findComponent({ name: 'QTable' });

      expect(table.props('loading')).toBe(false);
    });

    it('shows the default no-data message when rows is empty', () => {
      const wrapper = mountTable({ rows: [] });

      expect(wrapper.text()).toContain('Nenhum resultado encontrado.');
    });
  });

  // ── Props passthrough ──────────────────────────────────────────────────────

  describe('Props passthrough', () => {
    it('passes rows to the q-table', () => {
      const wrapper = mountTable({ rows });
      const table = wrapper.findComponent({ name: 'QTable' });

      expect(table.props('rows')).toEqual(rows);
    });

    it('passes columns to the q-table', () => {
      const wrapper = mountTable({ columns });
      const table = wrapper.findComponent({ name: 'QTable' });

      expect(table.props('columns')).toEqual(columns);
    });

    it('passes loading=true to the q-table', () => {
      const wrapper = mountTable({ loading: true });
      const table = wrapper.findComponent({ name: 'QTable' });

      expect(table.props('loading')).toBe(true);
    });

    it('passes custom rowsPerPageOptions to the q-table', () => {
      const wrapper = mountTable({ rowsPerPageOptions: [5, 10, 20] });
      const table = wrapper.findComponent({ name: 'QTable' });

      expect(table.props('rowsPerPageOptions')).toEqual([5, 10, 20]);
    });
  });

  // ── noDataLabel ────────────────────────────────────────────────────────────

  describe('noDataLabel', () => {
    it('displays the custom noDataLabel when rows is empty', () => {
      const wrapper = mountTable({ rows: [], noDataLabel: 'Nenhuma arma encontrada.' });

      expect(wrapper.text()).toContain('Nenhuma arma encontrada.');
    });

    it('displays the search_off icon in the default no-data slot', () => {
      const wrapper = mountTable({ rows: [] });

      expect(wrapper.find('.q-icon').exists()).toBe(true);
    });
  });

  // ── Slot overrides ─────────────────────────────────────────────────────────

  describe('Slot overrides', () => {
    it('renders a custom #no-data slot when provided, replacing the default', () => {
      const wrapper = mountTable(
        { rows: [] },
        { 'no-data': '<div data-testid="custom-no-data">Sem dados customizado</div>' },
      );

      expect(wrapper.find('[data-testid="custom-no-data"]').exists()).toBe(true);
      expect(wrapper.text()).not.toContain('Nenhum resultado encontrado.');
    });

    it('renders content passed through the #body slot', () => {
      const wrapper = mountTable(
        { rows, columns, rowKey: 'id' },
        {
          body: '<tr data-testid="custom-body-row"><td>custom row</td></tr>',
        },
      );

      expect(wrapper.find('[data-testid="custom-body-row"]').exists()).toBe(true);
    });
  });

  // ── update:pagination ──────────────────────────────────────────────────────

  describe('update:pagination emit', () => {
    it('emits update:pagination when the q-table emits update:pagination', async () => {
      const wrapper = mountTable({ rows, columns });
      const table = wrapper.findComponent({ name: 'QTable' });

      const newPagination = { page: 2, rowsPerPage: 15 };
      await table.vm.$emit('update:pagination', newPagination);

      // The q-table may emit update:pagination on mount with defaults.
      // We look for our specific emission in all emitted events.
      const allEmits = wrapper.emitted('update:pagination') ?? [];
      expect(allEmits.length).toBeGreaterThan(0);
      const found = allEmits.some(
        (args) =>
          Array.isArray(args) &&
          typeof args[0] === 'object' &&
          (args[0] as Record<string, unknown>).page === 2 &&
          (args[0] as Record<string, unknown>).rowsPerPage === 15,
      );
      expect(found).toBe(true);
    });
  });
});
