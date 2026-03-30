import axios from 'axios'
import type { Skill } from '../types/skill'

export async function fetchAllSkills(): Promise<Skill[]> {
  const apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api/v1'
  const response = await axios.get<{ skills: Skill[] }>(`${apiUrl}/skills`)
  return response.data.skills
}
