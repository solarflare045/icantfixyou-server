import { GameRunner } from '../game';
import { Runner } from '../runner';

export abstract class GalaxyRunner extends Runner {
  constructor(protected game: GameRunner) {
    super();
  }
}
