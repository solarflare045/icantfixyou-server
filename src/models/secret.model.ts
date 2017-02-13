import { Observable } from 'rxjs';
import { SharedNode, SharedValue, SharedSingleBuilder } from '../db/shared';

export class Secret {
  protected _secret: SharedValue<string>;

  constructor(protected _node: SharedNode) {
    this._secret = this._node.child('secret').asValue<string>();
  }

  get secret$(): Observable<string> { return this._secret.value$; }

  setSecret(secret: string) { return this._secret.update(secret); }
}

export const SECRET_HELPER = SharedSingleBuilder.single('secrets', Secret);
