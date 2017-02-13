import { Observable } from 'rxjs';
import { SharedNode, SharedValue, SharedSingleBuilder } from '../db/shared';
import { Game, GAME_HELPER } from './game.model';
import { GameObject, OBJECT_HELPER } from './object.model';

export class Job {
  protected _gameId: SharedValue<string>;
  protected _game$: Observable<Game>;
  protected _userId: SharedValue<string>;
  protected _user$: Observable<GameObject>;

  constructor(protected _node: SharedNode) {
    this._gameId = this._node.child('game').asValue<string>();
    this._game$ = GAME_HELPER.ref$(this._node, this._gameId.value$);
    this._userId = this._node.child('user').asValue<string>();
    this._user$ = OBJECT_HELPER.ref$(this._node, this._userId.value$);
  }

  get game$(): Observable<Game> { return this._game$; }
  get user$(): Observable<GameObject> { return this._user$; }
}

export const JOB_HELPER = SharedSingleBuilder.single('jobs', Job);
