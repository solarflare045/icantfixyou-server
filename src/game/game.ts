import { LocationSet } from './location/location.set';
import { Observable } from 'rxjs';
import { Runner } from './runner';
import { GalaxyRunner } from './galaxy/galaxy';
import { GalaxyFactory } from './galaxy/galaxy.factory';
import { Game } from '../models/game.model';

export class GameRunner extends Runner {
  public readonly locations: LocationSet;
  protected readonly galaxy$: Observable<GalaxyRunner>;

  constructor(public readonly model: Game) {
    super();
    this.locations = new LocationSet(this);
    this.galaxy$ = GalaxyFactory(this, this.model.galaxy$);
  }

  protected getRun$(): Observable<any> {
    return Observable.combineLatest(
      [
        this.locations.run$,
        this.galaxy$.switchMap((galaxy) => galaxy.run$),
      ],
    ).share();
  }
}
