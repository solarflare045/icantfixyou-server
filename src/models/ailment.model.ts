import { Observable } from 'rxjs';
import { SharedNode, SharedValue, SharedSingleBuilder } from '../db/shared';
import { GameObject, OBJECT_HELPER } from './object.model';

export class Ailment {
  protected _name: SharedValue<string>;
  protected _objectId: SharedValue<string>;
  protected _object$: Observable<GameObject>;

  constructor(protected _node: SharedNode) {
    this._name = this._node.child('name').asValue<string>();
    this._objectId = this._node.child('object').asValue<string>();
    this._object$ = OBJECT_HELPER.ref$(_node, this._objectId.value$);
  }

  get name$(): Observable<string> { return this._name.value$; }
  get object$(): Observable<GameObject> { return this._object$; }
}

export const AILMENT_HELPER = SharedSingleBuilder.single('ailments', Ailment);
