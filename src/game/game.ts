import { LocationSet } from './location/location.set';
import { Observable } from 'rxjs';
import { Runner } from './runner';
import { Game } from '../models/game.model';

export class GameRunner extends Runner {
  public readonly locations: LocationSet;

  constructor(public readonly model: Game) {
    super();
    this.locations = new LocationSet(this);
  }

  protected getRun$(): Observable<any> {
    return this.locations.run$;
  }
}
