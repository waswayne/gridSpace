import winston from '../libs/winston.js';
import { getConfig } from './env.js';

const { combine, timestamp, printf, colorize, splat, json } = winston.format;

const config = getConfig();

const consoleTransport = new winston.transports.Console({
  format: combine(
    colorize({ all: true }),
    splat(),
    timestamp(),
    printf(({ level, message, timestamp: ts, ...meta }) => {
      const metaString = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
      return `${ts} [${level}] ${message}${metaString}`;
    })
  ),
});

const jsonTransport = new winston.transports.Console({
  format: combine(timestamp(), json()),
});

const transports = process.stdout.isTTY ? [consoleTransport] : [jsonTransport];

export const logger = winston.createLogger({
  level: config.logLevel,
  defaultMeta: { service: 'gridspace-backend' },
  transports,
});

export const loggerStream = {
  write: (message) => {
    logger.info(message.trim());
  },
};
