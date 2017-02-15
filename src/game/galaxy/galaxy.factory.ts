import { Observable } from 'rxjs';
import { GameRunner } from '../game';
import { GalaxyRunner } from './galaxy';
import { BetaAlatheiaGalaxy } from './galaxies/beta-alatheia';

export class VoidGalaxy extends GalaxyRunner {
  getRun$(): Observable<any> {
    return Observable.empty();
  }
}

export function GalaxyFactory(game: GameRunner, key$: Observable<string>): Observable<GalaxyRunner> {
  return key$.map((key) => {
    let constructor = GALAXY_OBJECT[key];
    return constructor
      ? new constructor(game)
      : new VoidGalaxy(game);
  });
}

const GALAXY_OBJECT: { [key: string]: typeof GalaxyRunner & Function } = {
  'beta-alatheia': BetaAlatheiaGalaxy,
};
