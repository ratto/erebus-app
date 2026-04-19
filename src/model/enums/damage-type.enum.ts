/**
 * DamageType — Tipos de dano do Sistema Daemon (espelho do enum definido em erebus-api).
 *
 * Os valores DEVEM ser idênticos aos do erebus-api
 * (src/model/enums/damage-type.enum.ts) para garantir compatibilidade na
 * serialização JSON entre API e frontend.
 *
 * Convenção de uso padrão:
 *  - Armas brancas e de disparo (arco, besta): KINETIC (padrão, sem modificação mágica/elemental).
 *  - Armas de fogo: BALLISTIC, exceto lança-chamas (FIRE) e lançadores de granada (dano variável).
 */
export enum DamageType {
  KINETIC = 0,
  BALLISTIC = 1,
  FIRE = 2,
  COLD = 3,
  GAS = 4,
  ACID = 5,
  VACUUM = 6,
}
