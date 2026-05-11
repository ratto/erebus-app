import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { Quasar } from 'quasar';
import ErebusDialog from 'src/components/common/ErebusDialog.vue';

// ─── Types ───────────────────────────────────────────────────────────────────

type DialogType = 'info' | 'warning' | 'danger' | 'success';

interface ErebusDialogProps {
  modelValue?: boolean;
  title?: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  hideCancelButton?: boolean;
  disableConfirm?: boolean;
  type?: DialogType;
  persistent?: boolean;
}

// ─── Mount helper ─────────────────────────────────────────────────────────────

function mountDialog(props: ErebusDialogProps = {}, slots: Record<string, string> = {}) {
  return mount(ErebusDialog, {
    props: { modelValue: true, title: 'Título de teste', ...props },
    slots,
    global: {
      plugins: [[Quasar, {}]],
      stubs: { QDialog: { template: '<div><slot /></div>' } },
    },
  });
}

// ─── Suite ───────────────────────────────────────────────────────────────────

describe('ErebusDialog.vue', () => {
  // ── 1. Título ──────────────────────────────────────────────────────────────

  it('renderiza data-testid="dialog-title" com o texto da prop title', () => {
    const wrapper = mountDialog({ title: 'Meu Título' });

    const title = wrapper.find('[data-testid="dialog-title"]');
    expect(title.exists()).toBe(true);
    expect(title.text()).toBe('Meu Título');
  });

  // ── 2. Label padrão do botão confirmar ────────────────────────────────────

  it('renderiza btn-confirm com label padrão "Confirmar"', () => {
    const wrapper = mountDialog();

    const btn = wrapper.find('[data-testid="btn-confirm"]');
    expect(btn.exists()).toBe(true);
    expect(btn.text()).toContain('Confirmar');
  });

  // ── 3. Label padrão do botão cancelar ────────────────────────────────────

  it('renderiza btn-cancel com label padrão "Cancelar"', () => {
    const wrapper = mountDialog();

    const btn = wrapper.find('[data-testid="btn-cancel"]');
    expect(btn.exists()).toBe(true);
    expect(btn.text()).toContain('Cancelar');
  });

  // ── 4. Emit confirm ───────────────────────────────────────────────────────

  it('emite confirm ao clicar em btn-confirm', async () => {
    const wrapper = mountDialog();

    await wrapper.find('[data-testid="btn-confirm"]').trigger('click');

    expect(wrapper.emitted('confirm')).toBeTruthy();
    expect(wrapper.emitted('confirm')).toHaveLength(1);
  });

  // ── 5. Emit cancel ────────────────────────────────────────────────────────

  it('emite cancel ao clicar em btn-cancel', async () => {
    const wrapper = mountDialog();

    await wrapper.find('[data-testid="btn-cancel"]').trigger('click');

    expect(wrapper.emitted('cancel')).toBeTruthy();
    expect(wrapper.emitted('cancel')).toHaveLength(1);
  });

  // ── 6. Emit update:modelValue false ao cancelar ───────────────────────────

  it('emite update:modelValue com false ao clicar em btn-cancel', async () => {
    const wrapper = mountDialog();

    await wrapper.find('[data-testid="btn-cancel"]').trigger('click');

    const emitted = wrapper.emitted('update:modelValue');
    expect(emitted).toBeTruthy();
    expect(emitted![emitted!.length - 1]).toEqual([false]);
  });

  // ── 7. Emit update:modelValue false ao fechar ─────────────────────────────

  it('emite update:modelValue com false ao clicar em btn-close (não-persistent)', async () => {
    const wrapper = mountDialog({ persistent: false });

    await wrapper.find('[data-testid="btn-close"]').trigger('click');

    const emitted = wrapper.emitted('update:modelValue');
    expect(emitted).toBeTruthy();
    expect(emitted![emitted!.length - 1]).toEqual([false]);
  });

  // ── 8. disableConfirm ────────────────────────────────────────────────────

  it('btn-confirm fica desabilitado quando disableConfirm=true', () => {
    const wrapper = mountDialog({ disableConfirm: true });

    // QBtn renderiza como <button> no DOM; verificar atributo disabled
    const btn = wrapper.find('[data-testid="btn-confirm"]');
    expect(btn.attributes('disabled')).toBeDefined();
  });

  // ── 9. hideCancelButton ───────────────────────────────────────────────────

  it('btn-cancel não renderiza quando hideCancelButton=true', () => {
    const wrapper = mountDialog({ hideCancelButton: true });

    expect(wrapper.find('[data-testid="btn-cancel"]').exists()).toBe(false);
  });

  // ── 10. btn-close ausente quando persistent ───────────────────────────────

  it('btn-close não renderiza quando persistent=true', () => {
    const wrapper = mountDialog({ persistent: true });

    expect(wrapper.find('[data-testid="btn-close"]').exists()).toBe(false);
  });

  // ── 11. Slot default ─────────────────────────────────────────────────────

  it('slot default renderiza conteúdo customizado no corpo', () => {
    const wrapper = mountDialog({}, { default: '<p data-testid="custom-body">Conteúdo customizado</p>' });

    expect(wrapper.find('[data-testid="custom-body"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="custom-body"]').text()).toBe('Conteúdo customizado');
  });

  // ── 12. Prop message ─────────────────────────────────────────────────────

  it('prop message renderiza <p> no corpo quando nenhum slot é fornecido', () => {
    const wrapper = mountDialog({ message: 'Esta ação não pode ser desfeita.' });

    const p = wrapper.find('.erebus-dialog-message');
    expect(p.exists()).toBe(true);
    expect(p.text()).toBe('Esta ação não pode ser desfeita.');
  });

  // ── 13. Variante danger aplica classe na card ─────────────────────────────

  it('variante danger aplica classe erebus-dialog-card--danger na card', () => {
    const wrapper = mountDialog({ type: 'danger' });

    expect(wrapper.find('.erebus-dialog-card--danger').exists()).toBe(true);
  });

  // ── 14. Variante danger aplica classe no botão confirm ────────────────────

  it('variante danger aplica classe btn-danger no botão confirm', () => {
    const wrapper = mountDialog({ type: 'danger' });

    const btn = wrapper.find('[data-testid="btn-confirm"]');
    expect(btn.classes()).toContain('btn-danger');
  });

  // ── 15. confirmLabel personalizado ───────────────────────────────────────

  it('confirmLabel personalizado é exibido no botão confirm', () => {
    const wrapper = mountDialog({ confirmLabel: 'Excluir' });

    const btn = wrapper.find('[data-testid="btn-confirm"]');
    expect(btn.text()).toContain('Excluir');
  });

  // ── 16. cancelLabel personalizado ────────────────────────────────────────

  it('cancelLabel personalizado é exibido no botão cancel', () => {
    const wrapper = mountDialog({ cancelLabel: 'Voltar' });

    const btn = wrapper.find('[data-testid="btn-cancel"]');
    expect(btn.text()).toContain('Voltar');
  });
});
