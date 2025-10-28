import mongoose from 'mongoose';
import { getConfig } from './env.js';
import { logger } from './logger.js';

const config = getConfig();

let connectionPromise = null;
let listenersRegistered = false;

const registerConnectionListeners = () => {
  if (listenersRegistered) {
    return;
  }

  mongoose.connection.on('connected', () => {
    logger.info('MongoDB connection established');
  });

  mongoose.connection.on('disconnected', () => {
    logger.warn('MongoDB connection lost');
  });

  mongoose.connection.on('reconnected', () => {
    logger.info('MongoDB connection re-established');
  });

  mongoose.connection.on('error', (error) => {
    logger.error({ error }, 'MongoDB connection error');
  });

  listenersRegistered = true;
};

export const connectToDatabase = async () => {
  registerConnectionListeners();

  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (!connectionPromise) {
    connectionPromise = mongoose
      .connect(config.mongo.uri, {
        dbName: config.mongo.dbName,
        ...config.mongo.options,
      })
      .then(() => mongoose.connection)
      .catch((error) => {
        connectionPromise = null;
        logger.error({ error }, 'Failed to connect to MongoDB');
        throw error;
      });
  }

  return connectionPromise;
};

export const disconnectFromDatabase = async () => {
  if (mongoose.connection.readyState === 0) {
    return;
  }

  try {
    await mongoose.disconnect();
    logger.info('MongoDB connection closed');
  } catch (error) {
    logger.error({ error }, 'Error while disconnecting MongoDB');
    throw error;
  }
};

export const getDatabaseConnection = () => mongoose.connection;
