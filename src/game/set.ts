import { SharedList } from '../db/shared';
import { Observable } from 'rxjs';
import { Runner } from './runner';
import _ from 'lodash';

export type Constructor<TModel, TRunner, TParent> = new (model: TModel, set: ObjectSet<TModel, TRunner, TParent>) => TRunner;

interface SubtypeCache<TRunner> {
  subtype: string;
  runner: TRunner;
}

export abstract class ObjectSet<TModel, TRunner, TParent> extends Runner {
  protected abstract get list(): SharedList;
  protected abstract get list$(): Observable<TModel[]>;
  protected abstract getSubtypeFromModel(model: TModel): Observable<string>;

  private _cache$: Observable<SubtypeCache<TRunner>[]>;
  private _all$: Observable<TRunner[]>;
  private _bySubtype$: Observable<{ [subtype: string]: TRunner }>;

  protected abstract get Constructors(): [{ subtype: string, constructor: Constructor<TModel, TRunner, TParent> }];

  protected getConstructorFromSubtype(subtype: string): Constructor<TModel, TRunner, TParent> {
    let config = _.find(this.Constructors, (lc) => lc.subtype === subtype);
    return config && config.constructor;
  }

  constructor(public readonly parent: TParent) {
    super();
    this._cache$ = this.list$
      .switchMap((items) =>
        items.length
          ? Observable.combineLatest(
              _.map(items, (item) => this.getSubtypeFromModel(item).map((subtype) => {
                let constructor = this.getConstructorFromSubtype(subtype);
                return constructor
                  ? { subtype, runner: new constructor(item, this) }
                  : { subtype, runner: null };
              })),
            )
          : Observable.of([]),
      ).publishReplay(1).refCount();

    this._all$ = this._cache$.map((cache) =>
      _.chain(cache)
        .map((item) => item.runner)
        .compact()
        .value(),
    );

    this._bySubtype$ = this._cache$.map((cache) =>
      _.chain(cache)
        .map((item) => [ item.subtype, item.runner ])
        .fromPairs()
        .value(),
    );
  }

  public get items$(): Observable<TRunner[]> {
    return this._all$;
  }

  public fetch$(subtype: string): Observable<TRunner> {
    return this._bySubtype$.map((obj) => obj[subtype]);
  }
}
