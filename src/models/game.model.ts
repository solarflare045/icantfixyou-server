import { Observable } from 'rxjs';
import { SharedNode, SharedValue, SharedList, SharedSingleBuilder } from '../db/shared';
import { GameObject, Location, User, OBJECT_HELPER } from './object.model';
import { Event, EVENT_HELPER } from './event.model';
import _ from 'lodash';

export class Game {
  protected _galaxy: SharedValue<string>;
  protected _name: SharedValue<string>;
  protected _objects: SharedList;
  protected _objects$: Observable<GameObject[]>;
  protected _events$: Observable<Event[]>;
  protected _locations$: Observable<Location[]>;
  protected _users$: Observable<User[]>;

  constructor(protected _node: SharedNode) {
    this._galaxy = this._node.child('galaxy').asValue<string>();
    this._name = this._node.child('name').asValue<string>();
    this._objects$ = OBJECT_HELPER.items$(_node, _node.key$, 'game');
    this._objects = OBJECT_HELPER.list(_node, _node.key$, 'game');
    this._events$ = EVENT_HELPER.items$(_node, _node.key$, 'game');
    this._locations$ = this._objects$.map((objects) => <any[]>_.filter(objects, (object) => object instanceof Location));
    this._users$ = this._objects$.map((objects) => <any[]>_.filter(objects, (object) => object instanceof User));
  }

  get id(): string { return this._node.key; }
  get galaxy$(): Observable<string> { return this._galaxy.value$; }
  get name$(): Observable<string> { return this._name.value$; }
  get events$(): Observable<Event[]> { return this._events$; }
  get objects(): SharedList { return this._objects; }
  get locations$(): Observable<Location[]> { return this._locations$; }
  get users$(): Observable<User[]> { return this._users$; }

  setGalaxy(galaxy: string) { return this._galaxy.update(galaxy); }
}

export const GAME_HELPER = SharedSingleBuilder.single('games', Game);
