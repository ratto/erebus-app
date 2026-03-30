import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { Quasar } from 'quasar'

// Mock do módulo de serviço ANTES de importar o componente
vi.mock('../../../src/services/skills.service', () => ({
  fetchAllSkills: vi.fn(),
}))

import { fetchAllSkills } from '../../../src/services/skills.service'
import SkillsPage from '../../../src/pages/SkillsPage.vue'

const mockedFetchAllSkills = vi.mocked(fetchAllSkills)

const mockSkills = [
  {
    id: 1,
    nome: 'Espada',
    grupo: 'Combate',
    atributoBase: 'FR',
    apenasComTreinamento: false,
    sinergia: 'Escudo',
    descricao: 'Habilidade com lâminas longas e combate direto.',
  },
  {
    id: 2,
    nome: 'Furtividade',
    grupo: 'Furtivo',
    atributoBase: 'AGI',
    apenasComTreinamento: true,
    sinergia: null,
    descricao: 'Mover-se sem ser detectado.',
  },
  {
    id: 3,
    nome: 'Ocultismo',
    grupo: 'Magia',
    atributoBase: 'INT',
    apenasComTreinamento: true,
    sinergia: null,
    descricao: 'Conhecimento de artes arcanas e rituais.',
  },
]

// QPage requer QLayout para não emitir warning; usamos stub simples
const quasarMountOptions = {
  global: {
    plugins: [[Quasar, {}]] as [typeof Quasar, Record<string, unknown>][],
    stubs: {
      QPage: { template: '<div><slot /></div>' },
    },
  },
}

function mountSkillsPage() {
  return mount(SkillsPage, quasarMountOptions)
}

describe('SkillsPage.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('RF-B1: renderiza a tabela com as skills mockadas após carregar', async () => {
    mockedFetchAllSkills.mockResolvedValue(mockSkills)

    const wrapper = mountSkillsPage()
    await flushPromises()

    expect(wrapper.find('.q-table').exists()).toBe(true)
    const tableText = wrapper.text()
    expect(tableText).toContain('Espada')
    expect(tableText).toContain('Furtividade')
    expect(tableText).toContain('Ocultismo')
  })

  it('RF-B2: clicar no chevron de uma linha expande a descrição', async () => {
    mockedFetchAllSkills.mockResolvedValue(mockSkills)

    const wrapper = mountSkillsPage()
    await flushPromises()

    // Antes de clicar, a descrição não deve estar visível
    expect(wrapper.text()).not.toContain('Habilidade com lâminas longas')

    // Clica no botão chevron da primeira linha (id=1)
    const chevronBtns = wrapper.findAll('[data-testid="chevron-btn"]')
    expect(chevronBtns.length).toBeGreaterThan(0)
    await chevronBtns[0]!.trigger('click')

    // Após o clique, a descrição deve aparecer
    expect(wrapper.text()).toContain('Habilidade com lâminas longas')
  })

  it('RF-B3: clicar novamente no chevron colapsa a descrição', async () => {
    mockedFetchAllSkills.mockResolvedValue(mockSkills)

    const wrapper = mountSkillsPage()
    await flushPromises()

    const chevronBtns = wrapper.findAll('[data-testid="chevron-btn"]')

    // Primeiro clique: expande
    await chevronBtns[0]!.trigger('click')
    expect(wrapper.text()).toContain('Habilidade com lâminas longas')

    // Segundo clique: colapsa
    await chevronBtns[0]!.trigger('click')
    expect(wrapper.text()).not.toContain('Habilidade com lâminas longas')
  })

  it('RF-B4: q-table recebe loading=true enquanto a chamada API está pendente', async () => {
    // Promise que não resolve imediatamente
    let resolveSkills!: (value: typeof mockSkills) => void
    const pendingPromise = new Promise<typeof mockSkills>((resolve) => {
      resolveSkills = resolve
    })
    mockedFetchAllSkills.mockReturnValue(pendingPromise)

    const wrapper = mountSkillsPage()

    // onMounted executa na montagem — mas antes de nextTick a UI ainda não re-renderizou
    // O loading é setado para true ANTES do await da API, então está true imediatamente
    // Precisamos verificar via nextTick (antes de flushPromises que resolve a promise)
    const { nextTick } = await import('vue')
    await nextTick()

    const table = wrapper.findComponent({ name: 'QTable' })
    expect(table.exists()).toBe(true)
    expect(table.props('loading')).toBe(true)

    // Resolve a promise
    resolveSkills(mockSkills)
    await flushPromises()

    expect(table.props('loading')).toBe(false)
  })

  it('RF-B5: filtro por nome funciona — filtra linhas pelo searchText', async () => {
    mockedFetchAllSkills.mockResolvedValue(mockSkills)

    const wrapper = mountSkillsPage()
    await flushPromises()

    // O data-testid no q-input cai diretamente no <input> nativo
    const searchInput = wrapper.find('[data-testid="search-input"]')
    expect(searchInput.exists()).toBe(true)

    // setValue no input nativo e trigger input event
    await searchInput.setValue('Espad')
    await searchInput.trigger('input')
    await flushPromises()

    const tableText = wrapper.text()
    expect(tableText).toContain('Espada')
    // Furtividade e Ocultismo não devem aparecer
    expect(tableText).not.toContain('Furtividade')
    expect(tableText).not.toContain('Ocultismo')
  })
})
