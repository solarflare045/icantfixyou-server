import { Fault } from '../fault.class';

export class MechanicalDamage extends Fault {
  protected getNames(): string[] {
    return [
      'Mechanical Damage',
      'Technical Fault',
      'Sparking',
    ];
  }
}
