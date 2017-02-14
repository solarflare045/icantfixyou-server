import { Observable } from 'rxjs';
import { Damage, Ailment } from '../damage';
import { DamageSet } from '../damage.set';

export class DestroyedDamage extends Damage {
  protected get _hp$(): Observable<number> { return Observable.of(999); }
  protected get _name$(): Observable<string> { return Observable.of('Destroyed'); }

  constructor(ailment: Ailment, set: DamageSet) {
    super(ailment, set);
  }
}
