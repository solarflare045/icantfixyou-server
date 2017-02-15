import { Game, GAME_HELPER } from './models/game.model';
import { GameRunner } from './game/game';
import { root } from './db/helpers';

let game: Game = GAME_HELPER.ref(root, 'abcabc');
let gameRunner: GameRunner = new GameRunner(game);

gameRunner.run$.subscribe();
