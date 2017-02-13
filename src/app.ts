import { Observable } from 'rxjs';
import _ from 'lodash';

import { Game, GAME_HELPER } from './models/game.model';
import { Location } from './models/object.model';

import { root } from './db/helpers';

let game: Game = GAME_HELPER.ref(root, 'abcabc');
let locations$: Observable<Location[]> = game.locations$;

let healths = [ 'stable', 'damaged', 'critical', 'destroyed' ];
let health$ = Observable.interval(1000).map((i) => healths[i % healths.length]).do((health) => console.log('HEALTH = ', health));

Observable.combineLatest(locations$, health$)
  .do(([ locations, health ]) => {
    _.each(locations, (location) => location.setHealth(health));
  })
  .subscribe();
