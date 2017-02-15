import { Observable } from 'rxjs';
import { LocationSet } from './location.set';
import { DamageSet } from '../damage/damage.set';
import { Location } from '../../models/object.model';
import { Runner } from '../runner';
import _ from 'lodash';

const DAMAGED = 1;
const CRITICAL = 3;
const DESTROYED = 6;

export abstract class LocationRunner extends Runner {
  public readonly damage: DamageSet;

  public readonly dmg$: Observable<number>;
  public readonly health$: Observable<string>;

  public readonly is: {
    critical$?: Observable<boolean>;
    damagable$?: Observable<boolean>;
    functioning$?: Observable<boolean>;
  } = {};

  constructor(public readonly model: Location, protected readonly set: LocationSet) {
    super();
    this.damage = new DamageSet(this);
    this.dmg$ = this.getDmg$();
    this.health$ = this.getHealth$();

    this.is.critical$ = this.dmg$.map((dmg) => dmg >= CRITICAL);
    this.is.damagable$ = this.dmg$.map((dmg) => dmg < DESTROYED);
    this.is.functioning$ = this.health$.map((state) => state === 'stable' || state === 'damaged');
  }

  protected getDmg$(): Observable<number> {
    return this.damage.items$
      .switchMap((damages) =>
        damages.length
          ? Observable.combineLatest( _.map(damages, 'hp$') ).map((hps) => _.sum(hps))
          : Observable.of(0),
      )
      .publishReplay(1).refCount();
  }

  protected getHealth$(): Observable<string> {
    return this.dmg$
      .map((hp) => {
        if (hp < DAMAGED) return 'stable';
        if (hp < CRITICAL) return 'damaged';
        if (hp < DESTROYED) return 'critical';
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
