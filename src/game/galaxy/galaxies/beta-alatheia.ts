import { Observable } from 'rxjs';
import { GalaxyRunner } from '../galaxy';
import { LocationRunner } from '../../location/location';
import _ from 'lodash';

const TICKRATE = 1000;
const CHANCE = 12;  // Higher the rarer.
const COOLDOWN = 20000;

export class BetaAlatheiaGalaxy extends GalaxyRunner {
  getDamagable$(): Observable<LocationRunner[]> {
    return this.game.locations.items$.switchMap(
      (locations) =>
        Observable.combineLatest( _.map(locations, (location) => location.is.damagable$.map((damagable) => ({ location, damagable }))))
          .map((combinations) =>
            _.chain(combinations)
              .filter((combination) => combination.damagable)
              .map((combination) => combination.location)
              .value(),
          ),
    ).publishReplay(1).refCount();
  }

  runDamageLoop$(damagable$: Observable<LocationRunner[]>): Observable<any> {
    return Observable.interval(TICKRATE)
      .exhaustMap(() => {
        if (_.random(0, CHANCE) !== 0)
          return Observable.empty();

        return damagable$.first()
          .flatMap((locations) => {
            let location = _.sample(locations);
            if (!location)
              return Observable.empty();

            location.damage.push({
              subtype: 'mechanical',
              object: location.model.id,
            });

            return Observable.timer(COOLDOWN); // Timeout
          });
      });
  }

  getRun$(): Observable<any> {
    let damagable$ = this.getDamagable$();  // Keep this warmed up for faster lookups!
    return Observable.combineLatest(
      [
        damagable$,
        this.runDamageLoop$( damagable$ ),
      ],
    ).share();
  }
}
