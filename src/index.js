import http from 'http';
import app from './app.js';
import { API_PREFIX, DEFAULT_API_VERSION } from './config/app.js';
import { getConfig } from './config/env.js';
import { logger } from './config/logger.js';
import { connectToDatabase, disconnectFromDatabase } from './config/db.js';
import { swaggerDocsMetadata } from './docs/swagger.js';

const config = getConfig();
const server = http.createServer(app);

const onShutdown = (signal) => {
  return async () => {
    logger.info({ signal }, 'Received shutdown signal');

    try {
      await disconnectFromDatabase();
    } catch (error) {
      logger.error({ error }, 'Error during MongoDB disconnection');
    }

    server.close((err) => {
      if (err) {
        logger.error({ err }, 'Error shutting down HTTP server');
        process.exit(1);
      }

      logger.info('HTTP server closed gracefully');
      process.exit(0);
    });
  };
};

const startServer = async () => {
  try {
    await connectToDatabase();

    server.listen(config.port, () => {
      const baseUrl = `http://localhost:${config.port}`;
      const apiBaseUrl = `${baseUrl}${API_PREFIX}`;
      const defaultVersionUrl = `${baseUrl}${API_PREFIX}/${DEFAULT_API_VERSION}`;
      const healthCheckUrl = `${defaultVersionUrl}/health`;

      logger.info('🚀 Server is listening', { port: config.port, env: config.nodeEnv });
      logger.info(`📚 API root: ${apiBaseUrl}`);
      logger.info(`🔁 Default API version: ${defaultVersionUrl}`);
      logger.info(`❤️ Health check: ${healthCheckUrl}`);
      logger.info(`📖 Interactive API Docs: ${baseUrl}${swaggerDocsMetadata.uiPath}`);
      logger.info(`📄 Swagger JSON Spec: ${baseUrl}${swaggerDocsMetadata.jsonPath}`);
    });
  } catch (error) {
    logger.fatal({ error }, 'Failed to start server');
    process.exit(1);
  }
};

startServer();

process.on('SIGTERM', onShutdown('SIGTERM'));
process.on('SIGINT', onShutdown('SIGINT'));

process.on('unhandledRejection', (reason) => {
  logger.error({ reason }, 'Unhandled promise rejection detected');
  throw reason;
});

process.on('uncaughtException', (error) => {
  logger.fatal({ error }, 'Uncaught exception detected, shutting down');
  process.exit(1);
});
