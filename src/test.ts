import { FirebaseObjectObservable } from './app/db';

let test = new FirebaseObjectObservable('/objects/76l1N2vsBnWoVMqzqjLz4Q7XiBg1/name');

test.value$.subscribe((name) => console.log(name));
