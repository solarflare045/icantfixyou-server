import { Fault } from '../classes/fault';

export class MechanicalDamage extends Fault {
  protected getNames(): string[] {
    return [
      'Mechanical Damage',
    ];
  }
}
