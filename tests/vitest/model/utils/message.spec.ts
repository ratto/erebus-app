import { vi, describe, test, expect, beforeEach } from 'vitest';

const { mockNotify } = vi.hoisted(() => ({
  mockNotify: vi.fn(),
}));

vi.mock('quasar', () => ({
  useQuasar: () => ({ notify: mockNotify }),
}));

import { erebusMessage } from 'src/model/utils/message';

describe('erebusMessage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('1. success() chama $q.notify com position top, classe --success, icon check_circle e timeout 2500', () => {
    const notify = erebusMessage();
    notify.success('Operação realizada com sucesso');

    expect(mockNotify).toHaveBeenCalledTimes(1);
    const call = mockNotify.mock.calls[0][0];
    expect(call.position).toBe('top');
    expect(call.classes).toContain('erebus-notify--success');
    expect(call.icon).toBe('check_circle');
    expect(call.timeout).toBe(2500);
  });

  test('2. info() chama $q.notify com classe --info, icon info e timeout 2500', () => {
    const notify = erebusMessage();
    notify.info('Informação importante');

    expect(mockNotify).toHaveBeenCalledTimes(1);
    const call = mockNotify.mock.calls[0][0];
    expect(call.classes).toContain('erebus-notify--info');
    expect(call.icon).toBe('info');
    expect(call.timeout).toBe(2500);
  });

  test('3. warning() chama $q.notify com classe --warning, icon warning e timeout 2500', () => {
    const notify = erebusMessage();
    notify.warning('Atenção ao limite de pontos');

    expect(mockNotify).toHaveBeenCalledTimes(1);
    const call = mockNotify.mock.calls[0][0];
    expect(call.classes).toContain('erebus-notify--warning');
    expect(call.icon).toBe('warning');
    expect(call.timeout).toBe(2500);
  });

  test('4. danger() chama $q.notify com classe --danger, icon error e timeout 2500', () => {
    const notify = erebusMessage();
    notify.danger('Falha ao carregar dados');

    expect(mockNotify).toHaveBeenCalledTimes(1);
    const call = mockNotify.mock.calls[0][0];
    expect(call.classes).toContain('erebus-notify--danger');
    expect(call.icon).toBe('error');
    expect(call.timeout).toBe(2500);
  });

  test('5. success() com timeout override usa o timeout fornecido', () => {
    const notify = erebusMessage();
    notify.success('Sucesso com timeout customizado', { timeout: 5000 });

    const call = mockNotify.mock.calls[0][0];
    expect(call.timeout).toBe(5000);
  });

  test('6. continuous() chama $q.notify com timeout 0 e classe --continuous', () => {
    mockNotify.mockReturnValue(vi.fn());
    const notify = erebusMessage();
    notify.continuous('Carregando dados...');

    expect(mockNotify).toHaveBeenCalledTimes(1);
    const call = mockNotify.mock.calls[0][0];
    expect(call.timeout).toBe(0);
    expect(call.classes).toContain('erebus-notify--continuous');
  });

  test('7. continuous() não inclui actions (sem botão fechar)', () => {
    mockNotify.mockReturnValue(vi.fn());
    const notify = erebusMessage();
    notify.continuous('Carregando dados...');

    const call = mockNotify.mock.calls[0][0];
    expect(call.actions).toBeUndefined();
  });

  test('8. continuous() retorna objeto com propriedade dismiss do tipo function', () => {
    mockNotify.mockReturnValue(vi.fn());
    const notify = erebusMessage();
    const result = notify.continuous('Carregando dados...');

    expect(result).toHaveProperty('dismiss');
    expect(typeof result.dismiss).toBe('function');
  });

  test('9. invocar dismiss() chama a função retornada pelo mock de $q.notify', () => {
    const dismissFn = vi.fn();
    mockNotify.mockReturnValue(dismissFn);

    const notify = erebusMessage();
    const { dismiss } = notify.continuous('Carregando dados...');
    dismiss();

    expect(dismissFn).toHaveBeenCalledTimes(1);
  });

  test('10. todos os tipos incluem position: top', () => {
    mockNotify.mockReturnValue(vi.fn());
    const notify = erebusMessage();

    notify.success('msg');
    notify.info('msg');
    notify.warning('msg');
    notify.danger('msg');
    notify.continuous('msg');

    for (const call of mockNotify.mock.calls) {
      expect(call[0].position).toBe('top');
    }
  });

  test('11. todos os tipos passam o argumento message para $q.notify', () => {
    mockNotify.mockReturnValue(vi.fn());
    const notify = erebusMessage();
    const msg = 'Mensagem de teste única';

    notify.success(msg);
    notify.info(msg);
    notify.warning(msg);
    notify.danger(msg);
    notify.continuous(msg);

    for (const call of mockNotify.mock.calls) {
      expect(call[0].message).toBe(msg);
    }
  });

  test('12. success, info, warning e danger incluem actions com ícone close', () => {
    const notify = erebusMessage();

    notify.success('msg');
    notify.info('msg');
    notify.warning('msg');
    notify.danger('msg');

    for (const call of mockNotify.mock.calls) {
      const actions = call[0].actions as Array<{ icon: string }>;
      expect(Array.isArray(actions)).toBe(true);
      expect(actions.some((a) => a.icon === 'close')).toBe(true);
    }
  });
});
