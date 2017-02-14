import { Observable } from 'rxjs';
import { SharedNode, SharedValue, SharedSingleBuilder } from '../db/shared';
import { GameObject, OBJECT_HELPER } from './object.model';

export class Ailment {
  protected _hp: SharedValue<number>;
  protected _name: SharedValue<string>;
  protected _objectId: SharedValue<string>;
  protected _object$: Observable<GameObject>;
  protected _subtype: SharedValue<string>;

  constructor(protected _node: SharedNode) {
    this._hp = this._node.child('hp').asValue<number>();
    this._name = this._node.child('name').asValue<string>();
    this._objectId = this._node.child('object').asValue<string>();
    this._object$ = OBJECT_HELPER.ref$(_node, this._objectId.value$);
    this._subtype = this._node.child('subtype').asValue<string>();
  }

  get hp$(): Observable<number> { return this._hp.value$; }
  get name$(): Observable<string> { return this._name.value$; }
  get object$(): Observable<GameObject> { return this._object$; }
  get subtype$(): Observable<string> { return this._subtype.value$; }

  setHp(hp: number) { return this._hp.update(hp); }
  setName(name: string) { return this._name.update(name); }
}

export const AILMENT_HELPER = SharedSingleBuilder.single('ailments', Ailment);
