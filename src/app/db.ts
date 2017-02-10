import { Observable } from 'rxjs';
import firebase from 'firebase';
import config from 'config';

export const app = firebase.initializeApp( config.get('firebaseConfig') );

export const auth = app.auth;
export const database = app.database;

export class FirebaseObjectObservable<T> {
  protected _ref: firebase.database.Reference;
  protected _subject$: Observable<{ $key: string, $value: T }>;
  protected _value$: Observable<T>;

  constructor(ref: string) {
    this._ref = database().ref(ref);

    this._subject$ = Observable.fromEventPattern<firebase.database.DataSnapshot>(
      (handler) => this._ref.on('value', <any>handler),
      (handler) => this._ref.off('value', <any>handler),
    ).map((snapshot) => ({
      $key: snapshot.key,
      $value: snapshot.val(),
    }));

    this._value$ = this._subject$.map((snap) => snap.$value);
  }

  get value$(): Observable<T> { return this._value$; }
}
