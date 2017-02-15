import { Observable } from 'rxjs';
import { Damage } from '../../damage';
import _ from 'lodash';

export abstract class Fault extends Damage {
  protected get _hp$(): Observable<number> { return Observable.of(1); }
  protected abstract getNames(): string[];

  protected get _name$(): Observable<string> {
    return this._variety$.map((i) => {
      let names = this.getNames();
      return names[i % names.length];
    });
  }

  protected get _variety$(): Observable<number> {
    return this.model.variety$.map((variety) => {
      if (variety)
        return variety;

      let rnd = _.random(0, 65536);
      this.model.setVariety(rnd);
      return rnd;
    });
  }
}
