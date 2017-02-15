import config from 'config';
import { Logger, transports } from 'winston';
import _ from 'lodash';

export const winston = new Logger({ transports: [] });

_.each(transports, (transport, key: string) => {
  let configKey = `logging.${ key.toLowerCase() }`;
  if (config.has(configKey))
    winston.add(transport, config.get(configKey));
});
