import { Observable } from 'rxjs';
import { DamageSet } from './damage.set';
import { Runner } from '../runner';

import { Ailment } from '../../models/ailment.model';
export { Ailment };

export abstract class Damage extends Runner {
  protected abstract get _hp$(): Observable<number>;
  protected abstract get _name$(): Observable<string>;

  constructor(protected readonly model: Ailment, protected readonly set: DamageSet) {
    super();
  }

  get hp$(): Observable<number> {
    return this._hp$;
  }

  get name$(): Observable<string> {
    return this._name$;
  }

  protected getRun$(): Observable<any> {
    return Observable.combineLatest(
      [
        this.hp$.do((hp) => this.model.setHp(hp)),
        this.name$.do((name) => this.model.setName(name)),
      ]
    ).share();
  }
}
