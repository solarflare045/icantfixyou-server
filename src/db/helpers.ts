import { FirebaseFactory  } from './db';
import { SharedNode } from './shared';

export const root: SharedNode = new SharedNode('/', FirebaseFactory.global);
