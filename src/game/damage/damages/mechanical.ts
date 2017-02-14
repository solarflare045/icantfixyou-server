import { Observable } from 'rxjs';
import { Damage, Ailment } from '../damage';
import { DamageSet } from '../damage.set';

export class MechanicalDamage extends Damage {
  protected get _hp$(): Observable<number> { return Observable.of(1); }
  protected get _name$(): Observable<string> { return Observable.of('Mechanical Damage'); }

  constructor(ailment: Ailment, set: DamageSet) {
    super(ailment, set);
  }
}
