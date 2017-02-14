import { Observable } from 'rxjs';
import { SharedList } from '../../db/shared';
import { Location } from '../../models/object.model';
import { LocationRunner } from './location';
import { GameRunner } from '../game';
import _ from 'lodash';

import { ObjectSet, Constructor } from '../set';

import { Airlock } from './locations/airlock';
import { Bridge } from './locations/bridge';
import { CommsTower } from './locations/comms';
import { EngineRoom } from './locations/engine';
import { Firewall } from './locations/firewall';
import { LifeSupport } from './locations/life';
import { MedicalBay } from './locations/medical';
import { Radar } from './locations/radar';
import { ResearchLab } from './locations/research';
import { ShieldGenerator } from './locations/shields';
import { Storage } from './locations/storage';
import { WeaponsSystem } from './locations/weapons';

export class LocationSet extends ObjectSet<Location, LocationRunner, GameRunner> {
  protected get Constructors() { return LOCATION_CONSTRUCTORS; }
  protected get list(): SharedList { return this.parent.model.objects; }
  protected get list$(): Observable<Location[]> { return this.parent.model.locations$; }

  protected getSubtypeFromModel(model: Location) { return model.subtype$; }

  constructor(parent: GameRunner) {
    super(parent);
  }

  protected getRun$(): Observable<any> {
    return this.items$
      .switchMap((items) => Observable.combineLatest(_.map(items, (item) => item.run$)))
      .share();
  }
}

const LOCATION_CONSTRUCTORS: [{ subtype: string, constructor: Constructor<Location, LocationRunner, GameRunner> }] = [
  { subtype: 'airlock',   constructor: Airlock          },
  { subtype: 'bridge',    constructor: Bridge           },
  { subtype: 'comms',     constructor: CommsTower       },
  { subtype: 'firewall',  constructor: Firewall         },
  { subtype: 'engine',    constructor: EngineRoom       },
  { subtype: 'life',      constructor: LifeSupport      },
  { subtype: 'medical',   constructor: MedicalBay       },
  { subtype: 'radar',     constructor: Radar            },
  { subtype: 'research',  constructor: ResearchLab      },
  { subtype: 'shields',   constructor: ShieldGenerator  },
  { subtype: 'storage',   constructor: Storage          },
  { subtype: 'weapons',   constructor: WeaponsSystem    },
];
