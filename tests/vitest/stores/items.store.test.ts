import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useItemsStore } from 'src/stores/items.store';

describe('useItemsStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  // ── addItem() ──────────────────────────────────────────────────────────────────

  describe('addItem()', () => {
    it('adiciona item ao array com id gerado automaticamente', () => {
      const store = useItemsStore();

      const result = store.addItem({
        name: 'Tocha',
        type: 'mundane',
        description: 'Ilumina ambientes escuros.',
      });

      expect(store.items).toHaveLength(1);
      expect(typeof result.id).toBe('string');
      expect(result.id.length).toBeGreaterThan(0);
      expect(result.name).toBe('Tocha');
      expect(result.type).toBe('mundane');
      expect(result.description).toBe('Ilumina ambientes escuros.');
    });

    it('retorna o item criado com todos os campos', () => {
      const store = useItemsStore();

      const input = { name: 'Poção de Cura', type: 'consumable' as const, description: 'Restaura HP.' };
      const result = store.addItem(input);

      expect(result.name).toBe(input.name);
      expect(result.type).toBe(input.type);
      expect(result.description).toBe(input.description);
      expect(result.id).toBeDefined();
    });

    it('gera ids únicos para chamadas consecutivas', () => {
      const store = useItemsStore();

      const a = store.addItem({ name: 'Item A', type: 'mundane', description: '' });
      const b = store.addItem({ name: 'Item B', type: 'consumable', description: '' });

      expect(a.id).not.toBe(b.id);
    });

    it('acumula múltiplos itens na ordem de inserção', () => {
      const store = useItemsStore();

      store.addItem({ name: 'Primeiro', type: 'mundane', description: '' });
      store.addItem({ name: 'Segundo', type: 'consumable', description: '' });
      store.addItem({ name: 'Terceiro', type: 'mundane', description: '' });

      expect(store.items).toHaveLength(3);
      expect(store.items[0]!.name).toBe('Primeiro');
      expect(store.items[1]!.name).toBe('Segundo');
      expect(store.items[2]!.name).toBe('Terceiro');
    });

    it('aceita descrição vazia', () => {
      const store = useItemsStore();

      const result = store.addItem({ name: 'Corda', type: 'mundane', description: '' });

      expect(result.description).toBe('');
      expect(store.items).toHaveLength(1);
    });
  });

  // ── updateItem() ──────────────────────────────────────────────────────────────

  describe('updateItem()', () => {
    it('substitui os campos do item com o id informado', () => {
      const store = useItemsStore();
      const item = store.addItem({ name: 'Tocha', type: 'mundane', description: 'Velha descrição.' });

      store.updateItem(item.id, { name: 'Tocha Aprimorada', type: 'consumable', description: 'Nova descrição.' });

      const updated = store.items.find((i) => i.id === item.id);
      expect(updated).toBeDefined();
      expect(updated!.name).toBe('Tocha Aprimorada');
      expect(updated!.type).toBe('consumable');
      expect(updated!.description).toBe('Nova descrição.');
      expect(updated!.id).toBe(item.id);
    });

    it('não afeta outros itens ao atualizar um', () => {
      const store = useItemsStore();
      const a = store.addItem({ name: 'Item A', type: 'mundane', description: '' });
      const b = store.addItem({ name: 'Item B', type: 'consumable', description: '' });

      store.updateItem(a.id, { name: 'Item A Modificado', type: 'mundane', description: 'desc' });

      const bAfter = store.items.find((i) => i.id === b.id);
      expect(bAfter!.name).toBe('Item B');
    });

    it('é no-op silencioso quando id não existe', () => {
      const store = useItemsStore();
      store.addItem({ name: 'Existente', type: 'mundane', description: '' });

      expect(() =>
        store.updateItem('id-inexistente', { name: 'X', type: 'mundane', description: '' }),
      ).not.toThrow();

      expect(store.items).toHaveLength(1);
      expect(store.items[0]!.name).toBe('Existente');
    });

    it('preserva o mesmo id após atualização', () => {
      const store = useItemsStore();
      const item = store.addItem({ name: 'Original', type: 'mundane', description: '' });

      store.updateItem(item.id, { name: 'Atualizado', type: 'consumable', description: 'nova' });

      expect(store.items[0]!.id).toBe(item.id);
    });
  });

  // ── removeItem() ──────────────────────────────────────────────────────────────

  describe('removeItem()', () => {
    it('remove o item com o id informado', () => {
      const store = useItemsStore();
      const item = store.addItem({ name: 'Remover', type: 'mundane', description: '' });

      store.removeItem(item.id);

      expect(store.items).toHaveLength(0);
    });

    it('não afeta outros itens ao remover um', () => {
      const store = useItemsStore();
      const a = store.addItem({ name: 'Item A', type: 'mundane', description: '' });
      const b = store.addItem({ name: 'Item B', type: 'consumable', description: '' });

      store.removeItem(a.id);

      expect(store.items).toHaveLength(1);
      expect(store.items[0]!.id).toBe(b.id);
    });

    it('é no-op silencioso quando id não existe', () => {
      const store = useItemsStore();
      store.addItem({ name: 'Existente', type: 'mundane', description: '' });

      expect(() => store.removeItem('id-inexistente')).not.toThrow();
      expect(store.items).toHaveLength(1);
    });

    it('não lança erro quando o array já está vazio', () => {
      const store = useItemsStore();

      expect(() => store.removeItem('qualquer-id')).not.toThrow();
      expect(store.items).toHaveLength(0);
    });
  });

  // ── getItemById() ─────────────────────────────────────────────────────────────

  describe('getItemById()', () => {
    it('retorna o item correspondente ao id', () => {
      const store = useItemsStore();
      const item = store.addItem({ name: 'Bússola', type: 'mundane', description: 'Aponta norte.' });

      const found = store.getItemById(item.id);

      expect(found).toBeDefined();
      expect(found!.id).toBe(item.id);
      expect(found!.name).toBe('Bússola');
    });

    it('retorna undefined para id inexistente', () => {
      const store = useItemsStore();

      const result = store.getItemById('nao-existe');

      expect(result).toBeUndefined();
    });

    it('retorna undefined quando a store está vazia', () => {
      const store = useItemsStore();

      expect(store.getItemById('qualquer')).toBeUndefined();
    });
  });

  // ── operações em sequência ────────────────────────────────────────────────────

  describe('consistência em sequência de operações', () => {
    it('add → update → remove mantém consistência do array', () => {
      const store = useItemsStore();

      const a = store.addItem({ name: 'A', type: 'mundane', description: '' });
      const b = store.addItem({ name: 'B', type: 'consumable', description: '' });

      store.updateItem(a.id, { name: 'A-mod', type: 'mundane', description: 'desc' });
      store.removeItem(b.id);

      expect(store.items).toHaveLength(1);
      expect(store.items[0]!.name).toBe('A-mod');
      expect(store.getItemById(b.id)).toBeUndefined();
    });

    it('múltiplos adds e removes preservam os itens corretos', () => {
      const store = useItemsStore();

      const ids = Array.from({ length: 5 }, (_, i) =>
        store.addItem({ name: `Item ${i}`, type: 'mundane', description: '' }).id,
      );

      store.removeItem(ids[1]!);
      store.removeItem(ids[3]!);

      expect(store.items).toHaveLength(3);
      expect(store.getItemById(ids[0]!)).toBeDefined();
      expect(store.getItemById(ids[1]!)).toBeUndefined();
      expect(store.getItemById(ids[2]!)).toBeDefined();
      expect(store.getItemById(ids[3]!)).toBeUndefined();
      expect(store.getItemById(ids[4]!)).toBeDefined();
    });
  });
});
