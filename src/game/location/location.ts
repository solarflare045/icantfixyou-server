import { Observable } from 'rxjs';
import { LocationSet } from './location.set';
import { DamageSet } from '../damage/damage.set';
import { Location } from '../../models/object.model';
import { Runner } from '../runner';
import _ from 'lodash';

export abstract class LocationRunner extends Runner {
  public readonly damage: DamageSet;

  public readonly health$: Observable<string>;

  constructor(public readonly model: Location, protected readonly set: LocationSet) {
    super();
    this.damage = new DamageSet(this);
    this.health$ = this.getHealth$();
  }

  protected getHealth$(): Observable<string> {
    return this.damage.items$
      .switchMap((damages) =>
        damages.length
          ? Observable.combineLatest( _.map(damages, 'hp$') ).map((hps) => _.sum(hps))
          : Observable.of(0),
      )
      .map((hp) => {
        if (hp < 1) return 'stable';
        if (hp < 3) return 'damaged';
        if (hp < 5) return 'critical';
        return 'destroyed';
      });
  }
  
  protected getRun$(): Observable<any> {
    return Observable.combineLatest(
      [
        this.health$.do((health) => this.model.setHealth(health)),
        this.damage.run$,
      ],
    ).share();
  }
}
