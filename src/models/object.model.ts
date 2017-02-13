import { Observable } from 'rxjs';
import { SharedNode, SharedValue, SharedBuilder, SharedSingleBuilder } from '../db/shared';
import { Game, GAME_HELPER } from './game.model';
import { Ailment, AILMENT_HELPER } from './ailment.model';
import { Item, ITEM_HELPER } from './item.model';
import { Job, JOB_HELPER } from './job.model';
import { Secret, SECRET_HELPER } from './secret.model';

export abstract class GameObject {
  protected _name: SharedValue<string>;
  protected _gameId: SharedValue<string>;
  protected _game$: Observable<Game>;
  protected _health: SharedValue<string>;
  protected _ailments$: Observable<Ailment[]>;
  protected _items$: Observable<Item[]>;
  protected _targeters$: Observable<User[]>;

  constructor(protected _node: SharedNode) {
    this._name = this._node.child('name').asValue<string>();
    this._gameId = this._node.child('game').asValue<string>();
    this._health = this._node.child('health').asValue<string>();
    this._game$ = GAME_HELPER.ref$(this._node, this._gameId.value$);
    this._ailments$ = AILMENT_HELPER.items$(_node, _node.key$, 'object');
    this._items$ = ITEM_HELPER.items$(_node, _node.key$, 'object');
    this._targeters$ = USER_HELPER.items$(_node, _node.key$, 'target');
  }

  get id(): string { return this._node.key; }
  get name$(): Observable<string> { return this._name.value$; }
  get game$(): Observable<Game> { return this._game$; }
  get health$(): Observable<string> { return this._health.value$; }
  get ailments$(): Observable<Ailment[]> { return this._ailments$; }
  get items$(): Observable<Item[]> { return this._items$; }
  get targeters$(): Observable<User[]> { return this._targeters$; }

  setGame(id: string) { return this._gameId.update(id); }
  setHealth(id: string) { return this._health.update(id); }
  setName(name: string) { return this._name.update(name); }
}

export class UnknownObject extends GameObject {

}

export class Location extends GameObject {
  protected _icon$: Observable<string>;

  constructor(_node: SharedNode) {
    super(_node);
    this._icon$ = this.name$.map((name) => `/assets/locations/${ name.toLowerCase() }.svg`);
  }
  
  get icon$(): Observable<string> { return this._icon$; }
}

export class User extends GameObject {
  protected _targetId: SharedValue<string>;
  protected _secret: Secret;
  protected _target$: Observable<GameObject>;
  protected _jobs$: Observable<Job[]>;

  constructor(_node: SharedNode) {
    super(_node);
    this._targetId = this._node.child('target').asValue<string>();
    this._target$ = OBJECT_HELPER.ref$(this._node, this._targetId.value$);
    this._jobs$ = JOB_HELPER.items$(_node, _node.key$, 'user');
    this._secret = SECRET_HELPER.ref(_node, this._node.key);
  }

  get secret$(): Observable<string> { return this._secret.secret$; }
  get target$(): Observable<GameObject> { return this._target$; }
  get jobs$(): Observable<Job[]> { return this._jobs$; }

  setSecret(secret: string) { return this._secret.setSecret(secret); }
  setTarget(id: string) { return this._targetId.update(id); }
}

export const OBJECT_HELPER = SharedBuilder.multiplex<GameObject>('objects', 'type', {
  user: User,
  location: Location,
  default: UnknownObject,
});

export const LOCATION_HELPER = SharedSingleBuilder.single<Location>('objects', Location);
export const USER_HELPER = SharedSingleBuilder.single<User>('objects', User);
