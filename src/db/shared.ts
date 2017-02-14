import { FirebaseObjectObservable, FirebaseListObservable, FirebaseFactory, Query } from './db';
import { Observable } from 'rxjs';
import _ from 'lodash';
import firebase from 'firebase-admin';

export class SharedNode {
  protected _node: FirebaseObjectObservable<any>;
  protected _key: string;
  protected _key$: Observable<string>;

  constructor(public readonly path: string, protected af: FirebaseFactory) {
    this._node = this.af.object(this.path);
    this._key = _.last( path.split('/') );
    this._key$ = this._node.key$;
  }

  child(path: string): SharedNode {
    return new SharedNode(`${ this.path }/${ path }`, this.af);
  }

  childRef(path$: Observable<string>): Observable<SharedNode> {
    return path$.map((val) => val ? this.child(val) : null);
  }

  root(): SharedNode {
    return new SharedNode('/', this.af);
  }

  get key(): string {
    return this._key;
  }

  get key$(): Observable<string> {
    return this._key$;
  }

  asList(query: Query = null): SharedList {
    return new SharedList(this.path, this.af, query);
  }

  asValue<T>(): SharedValue<T> {
    return new SharedValue<T>(this.path, this.af);
  }

  remove(): firebase.Promise<void> {
    return this._node.remove();
  }
}

export class SharedValue<T> extends SharedNode {
  protected _subject: Observable<T>;

  constructor(path: string, af: FirebaseFactory) {
    super(path, af);
    this._subject = this._node.value$.publishReplay(1).refCount();
  }

  get value$(): Observable<T> {
    return this._subject;
  }

  transaction(update: (val: T) => T): firebase.Promise<any> {
    return this._node.$ref.transaction(update);
  }

  update(val: T): firebase.Promise<any> {
    return this._node.set(val);
  }
}

interface SharedObjectRef {
  key: string;
  object: SharedNode;
}

export class SharedList {
  protected _list$: FirebaseListObservable<any>;
  protected _subject$: Observable<SharedNode[]>;

  constructor(protected path: string, protected af: FirebaseFactory, query: Query = undefined) {
    this._list$ = this.af.list(path, query);
    this._subject$ = this._list$.items$
      .scan<SharedObjectRef[]>(
        (old: SharedObjectRef[], value: any[]) =>
          _.map(value, (obj) => {
            let key: string = obj.$key;
            let existing: SharedObjectRef = _.find(old, (o) => o.key === key);
            return existing || { key, object: this.child(key) };
          })
        , [])      
      .distinctUntilChanged((x, y) => _.isEqual(_.map(x, 'keys'), _.map(y, 'keys')))
      .map((objs) => _.map(objs, (obj) => obj.object));
  }

  private child(path: string): SharedNode {
    return new SharedNode(`${ this.path }/${ path }`, this.af);
  }

  get items$(): Observable<SharedNode[]> {
    return this._subject$;
  }

  push(val: any): SharedNode {
    return this.child( this._list$.push(val).key );
  }
}

type ConstructorWithNode<T> = new (node: SharedNode) => T;
interface ConstructorsWithNode<T> {
  default?: ConstructorWithNode<T>;
  [ key: string ]: ConstructorWithNode<T>;
}

export class SharedBuilder<T> {
  constructor(
    protected root: (anyNode: SharedNode) => SharedNode,
    protected factory$: (node: SharedNode) => Observable<T>,
  ) {
    
  }

  ref$(node: SharedNode, id: Observable<string>): Observable<T> {
    return this.root(node).childRef(id)
      .switchMap((childNode) => this.fact$(childNode));
  }

  list(node: SharedNode, id: Observable<string>, key: string): SharedList {
    return this.root(node).asList({ orderByChild: key, equalTo: id });
  }

  items$(node: SharedNode, id: Observable<string>, key: string): Observable<T[]> {
    return this.list(node, id, key).items$
      .switchMap((nodes) =>
        nodes.length
          ? Observable.combineLatest( _.map(nodes, (childNode) => this.fact$(childNode)) )
          : Observable.of([]),
      )
      .publishReplay(1).refCount();
  }

  private fact$(node: SharedNode): Observable<T> {
    return node ? this.factory$(node) : Observable.of(null);
  }

  static multiplex<T>(collection: string, typePath: string, constructors: ConstructorsWithNode<T>): SharedBuilder<T> {
    return new SharedBuilder<T>(
      (node) => node.root().child(collection),
      (node) => node.child(typePath).asValue<string>().value$
        .map((type) => {
          let constructor = constructors[type];
          if (constructor) return new constructor(node);
          if (constructors.default) return new constructors.default(node);
          throw new Error(`Type ${ type } not recognized at path ${ node.path }`);
        }),
    );
  }
}

export class SharedSingleBuilder<T> extends SharedBuilder<T> {
  constructor(
    root: (anyNode: SharedNode) => SharedNode,
    protected factory: (node: SharedNode) => T,
  ) {
    super(root, (node) => Observable.of(this.fact(node)));
  }

  ref(node: SharedNode, id: string): T {
    return this.fact(this.root(node).child(id));
  }

  private fact(node: SharedNode): T {
    return node ? this.factory(node) : null;
  }

  static single<T>(collection: string, constructor: ConstructorWithNode<T>): SharedSingleBuilder<T> {
    return new SharedSingleBuilder<T>(
      (node) => node.root().child(collection),
      (node) => new constructor(node),
    );
  }
}
