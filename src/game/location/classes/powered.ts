import { Observable } from 'rxjs';
import { LocationRunner } from '../location';
import { EngineRoom } from '../locations/engine';

import { LocationSet } from '../location.set';
import { Location } from '../../../models/object.model';

export abstract class PoweredLocationRunner extends LocationRunner {
  protected get engine$(): Observable<EngineRoom> { return this.set.fetch$('engine'); }

  constructor(model: Location, set: LocationSet) {
    super(model, set);
  }

  protected getHealth$(): Observable<string> {
    return this.engine$
      .switchMap((engine) => engine.health$)
      .switchMap((health) =>
        (health === 'stable' || health === 'damaged')
          ? super.getHealth$()
          : Observable.of('offline'),
      );
  }
}
