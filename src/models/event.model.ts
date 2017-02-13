import { Observable } from 'rxjs';
import { SharedNode, SharedValue, SharedSingleBuilder } from '../db/shared';
import { Game, GAME_HELPER } from './game.model';

export class Event {
  protected _name: SharedValue<string>;
  protected _gameId: SharedValue<string>;
  protected _game$: Observable<Game>;

  constructor(protected _node: SharedNode) {
    this._name = this._node.child('name').asValue<string>();
    this._gameId = this._node.child('game').asValue<string>();
    this._game$ = GAME_HELPER.ref$(this._node, this._gameId.value$);
  }

  get name$(): Observable<string> { return this._name.value$; }
  get game$(): Observable<Game> { return this._game$; }
}

export const EVENT_HELPER = SharedSingleBuilder.single('events', Event);
