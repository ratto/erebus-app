import { describe, it, expect, vi, beforeEach } from 'vitest'
import axios from 'axios'

vi.mock('axios')
const mockedAxios = vi.mocked(axios, true)

describe('skills.service', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  describe('fetchAllSkills()', () => {
    it('chama a URL correta e retorna array de Skills', async () => {
      const mockSkills = [
        {
          id: 1,
          nome: 'Espada',
          grupo: 'Combate',
          atributoBase: 'FR',
          apenasComTreinamento: false,
          sinergia: null,
          descricao: 'Habilidade com espadas.',
        },
        {
          id: 2,
          nome: 'Furtividade',
          grupo: 'Furtivo',
          atributoBase: 'AGI',
          apenasComTreinamento: true,
          sinergia: null,
          descricao: 'Mover-se sem ser visto.',
        },
      ]

      mockedAxios.get = vi.fn().mockResolvedValue({ data: { skills: mockSkills } })

      const { fetchAllSkills } = await import('../../../src/services/skills.service')
      const result = await fetchAllSkills()

      expect(mockedAxios.get).toHaveBeenCalledWith(
        'http://localhost:3000/api/v1/skills'
      )
      expect(result).toEqual(mockSkills)
      expect(result).toHaveLength(2)
    })

    it('usa VITE_API_URL do ambiente quando disponível', async () => {
      const originalEnv = import.meta.env.VITE_API_URL
      // Simula a variável de ambiente via mock do módulo
      vi.stubEnv('VITE_API_URL', 'http://custom-api:4000/api/v1')

      mockedAxios.get = vi.fn().mockResolvedValue({ data: { skills: [] } })

      // Re-importa para pegar o env atualizado
      vi.resetModules()
      const { fetchAllSkills } = await import('../../../src/services/skills.service')
      await fetchAllSkills()

      expect(mockedAxios.get).toHaveBeenCalledWith(
        'http://custom-api:4000/api/v1/skills'
      )

      vi.unstubAllEnvs()
      vi.resetModules()
    })

    it('propaga erro de rede corretamente', async () => {
      const networkError = new Error('Network Error')
      mockedAxios.get = vi.fn().mockRejectedValue(networkError)

      const { fetchAllSkills } = await import('../../../src/services/skills.service')

      await expect(fetchAllSkills()).rejects.toThrow('Network Error')
    })
  })
})
