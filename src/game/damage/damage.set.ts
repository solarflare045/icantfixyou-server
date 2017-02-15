import { Observable } from 'rxjs';
import { SharedList } from '../../db/shared';
import { Ailment } from '../../models/ailment.model';
import { LocationRunner } from '../location/location';
import { Damage } from './damage';
import _ from 'lodash';

import { ObjectSet, Constructor } from '../set';

import { DestroyedDamage } from './damages/destroyed';
import { MechanicalDamage } from './damages/faults/mechanical';

export class DamageSet extends ObjectSet<Ailment, Damage, LocationRunner> {
  protected get Constructors() { return DAMAGE_CONSTRUCTORS; }
  protected get list(): SharedList { return this.parent.model.ailments; }
  protected get list$(): Observable<Ailment[]> { return this.parent.model.ailments$; }

  protected getSubtypeFromModel(model: Ailment) { return model.subtype$; }

  constructor(parent: LocationRunner) {
    super(parent);
  }

  protected getRun$(): Observable<any> {
    return this.items$
      .switchMap((items) => Observable.combineLatest(_.map(items, (item) => item.run$)))
      .share();
  }

  push(damage: IDamage): void {
    this.list.push(damage);
  }
}

export interface IDamage {
  subtype: 'mechanical';
  object: string;
}

const DAMAGE_CONSTRUCTORS: [{ subtype: string, constructor: Constructor<Ailment, Damage, LocationRunner> }] = [
  { subtype: 'mechanical', constructor: MechanicalDamage },
  { subtype: 'destroyed', constructor: DestroyedDamage },
];
