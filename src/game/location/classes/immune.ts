import { Observable } from 'rxjs';
import { LocationRunner } from '../location';

import { LocationSet } from '../location.set';
import { Location } from '../../../models/object.model';

export abstract class ImmuneLocationRunner extends LocationRunner {
  constructor(model: Location, set: LocationSet) {
    super(model, set);
    this.is.damagable$ = Observable.of(false);
  }

  protected getDmg$(): Observable<number> { return Observable.of(0); }
}
