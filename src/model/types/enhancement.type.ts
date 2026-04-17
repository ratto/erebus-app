export interface Enhancement {
  id: number;
  nome: string;
  descricao: string;
  tipo: 'positivo' | 'negativo';
  custo: number;
}

export interface EnhancementsResponse {
  total: number;
  page: number;
  limit: number;
  data: Enhancement[];
}
