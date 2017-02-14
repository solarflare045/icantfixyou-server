import { Observable } from 'rxjs';
import _ from 'lodash';

export abstract class Runner {
  protected abstract getRun$(): Observable<any>;
  private runGetter: () => Observable<any>;
  public get run$(): Observable<any> { return this.runGetter(); }

  constructor() {
    this.runGetter = _.once(() => this.getRun$());
  }
}
