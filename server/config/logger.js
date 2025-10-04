import winston from '../libs/winston.js';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: { service: "gridspace-backend" },
  transports: [new winston.transports.Console()],
});

export default logger;