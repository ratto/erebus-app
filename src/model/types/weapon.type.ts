export type Weapon = {
  id: number;
  nome: string;
  categoria: string;
  dano: string;
  iniciativa: string;
  fonte: string;
  tipo: 'branca' | 'branca_distancia' | 'fogo';
  tipoDano: string | null;
  ocultabilidade: string | null;
  alcanceMedio: string | null;
  alcanceMax: string | null;
  calibre: string | null;
  alcanceEfetivo: string | null;
  rof: string | null;
  pente: string | null;
};
