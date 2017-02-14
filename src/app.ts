import { Observable } from 'rxjs';
import _ from 'lodash';

import { Game, GAME_HELPER } from './models/game.model';
// import { Location } from './models/object.model';

// import { PoweredLocationRunner } from './game/location/classes/powered';

import { GameRunner } from './game/game';

import { root } from './db/helpers';

let game: Game = GAME_HELPER.ref(root, 'abcabc');
let gameRunner: GameRunner = new GameRunner(game);

// gameRunner.locations.fetch$('engine')
//   .switchMap((location) => location.health$)
//   .subscribe((health) => console.log(health));

gameRunner.run$.subscribe();

// gameRunner.locations.items$
//   .switchMap((locations) => Observable.combineLatest( _.map(locations, (location) => location.health$) ))
//   .subscribe((healths) => console.log(healths));

// gameRunner.locations.fetch$('radar')
//   .switchMap((location: PoweredLocationRunner) => location.engine$)
//   .switchMap((location) => location.model.name$)
//   .subscribe((o) => console.log(o));
