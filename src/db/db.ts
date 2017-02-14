import { Observable } from 'rxjs';
// import firebase from 'firebase';
import firebase from 'firebase-admin';
import config from 'config';
import _ from 'lodash';

const app = firebase.initializeApp(
  _.extend( config.get('firebaseConfig'), {
    credential: firebase.credential.cert( config.get('firebaseCredential' )),
  }),
);

export const auth = app.auth;
export const database = app.database;

export class FirebaseFactory {
  constructor(private appInstance: firebase.app.App) {

  }

  object<T>(ref: string): FirebaseObjectObservable<T> {
    return new FirebaseObjectObservable(this.appInstance, ref);
  }

  list<T>(ref: string, query: Query = undefined): FirebaseListObservable<T> {
    return new FirebaseListObservable(this.appInstance, ref, query);
  }

  public static readonly global = new FirebaseFactory(app);
}

export class FirebaseObjectObservable<T> {
  protected _ref: firebase.database.Reference;
  protected _subject$: Observable<{ $key: string, $value: T }>;
  protected _key$: Observable<string>;
  protected _value$: Observable<T>;

  constructor(appInstance: firebase.app.App, ref: string) {
    this._ref = app.database().ref(ref);

    this._subject$ = Observable.fromEventPattern<firebase.database.DataSnapshot>(
      (handler) => this._ref.on('value', <any>handler),
      (handler) => this._ref.off('value', <any>handler),
    ).map((snapshot) => ({
      $key: snapshot.key,
      $value: snapshot.val(),
    }));

    this._key$ = this._subject$.map((snap) => snap.$key);
    this._value$ = this._subject$.map((snap) => snap.$value);
  }

  get $ref(): firebase.database.Reference { return this._ref; }
  get key$(): Observable<string> { return this._key$; }
  get value$(): Observable<T> { return this._value$; }

  set(val: T): firebase.Promise<any> {
    return this._ref.set(val);
  }

  remove(): firebase.Promise<void> {
    return this._ref.remove();
  }
}

export interface Query {
  orderByChild?: string;
  equalTo?: string | Observable<string>;
}

interface ObservedQuery {
  orderByChild: string;
  equalTo: string;
}

export class FirebaseListObservable<T> {
  protected _ref: firebase.database.Reference;
  protected _ref$: Observable<firebase.database.Query>;
  protected _subject$: Observable<(T & { $key: string })[]>;

  constructor(appInstance: firebase.app.App, ref: string, query: Query = {}) {
    this._ref = appInstance.database().ref(ref);
    this._ref$ = observeQuery(query)
      .map((oq) =>
        _.chain<firebase.database.Query>(this._ref)
          .thru((q) => oq.orderByChild ? q.orderByChild(oq.orderByChild) : q)
          .thru((q) => oq.equalTo ? q.equalTo(oq.equalTo) : q)
          .value(),
      );

    this._subject$ = this._ref$
      .switchMap((dbRef) => Observable.fromEventPattern<firebase.database.DataSnapshot>(
        (handler) => dbRef.on('value', <any>handler),
        (handler) => dbRef.off('value', <any>handler),
      )).map((snapshot) =>
        _.map(snapshot.val(), (value: T, key: string) => _.extend(value, { $key: key })),
      );
  }

  get items$(): Observable<(T & { $key: string })[]> {
    return this._subject$;
  }

  push(val: any): firebase.database.ThenableReference {
    return this._ref.push(val);
  }
}

function observeQuery(query: Query): Observable<ObservedQuery> {
  return Observable.combineLatest( observeString(query.equalTo) )
    .map(([ equalTo ]) => ({
      orderByChild: query.orderByChild,
      equalTo,
    }));
}

function observeString(str: string | Observable<string>): Observable<string> {
  return str instanceof Observable
    ? str
    : Observable.of(str);
}
