export interface Enhancement {
  id: number;
  nome: string;
  tipo: 'positivo' | 'negativo';
  custo: number;
  descricao: string;
}
