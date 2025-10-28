import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import supertest from 'supertest';

let mongoServer;
let app;
let requestAgent;

const TEST_DB_NAME = 'gridspace_test_db';
const DEFAULT_MONGOMS_VERSION = '7.0.14';
const REQUIRED_ENV_VARS = {
  NODE_ENV: 'test',
  JWT_SECRET: 'test-jwt-secret-please-change-me-1234567890',
  REFRESH_TOKEN_SECRET: 'test-refresh-secret-please-change-me-0987654321',
  RATE_LIMIT_MAX: '1000',
  RATE_LIMIT_WINDOW_MS: `${15 * 60 * 1000}`,
  CLOUDINARY_CLOUD_NAME: 'test-cloud',
  CLOUDINARY_API_KEY: 'test-key',
  CLOUDINARY_API_SECRET: 'test-secret',
  MAIL_FROM_ADDRESS: 'no-reply@example.com',
  MAIL_FROM_NAME: 'GridSpace Test',
  MONGO_DB_NAME: TEST_DB_NAME,
  MONGOMS_START_TIMEOUT: '60000',
  MONGOMS_VERSION: DEFAULT_MONGOMS_VERSION,
};

const ensureEnvironmentVariables = () => {
  Object.entries(REQUIRED_ENV_VARS).forEach(([key, value]) => {
    if (!process.env[key]) {
      process.env[key] = value;
    }
  });
};

export const setupTestApplication = async () => {
  if (!mongoServer) {
    mongoServer = await MongoMemoryServer.create({
      binary: {
        version: process.env.MONGOMS_VERSION || DEFAULT_MONGOMS_VERSION,
      },
      instance: {
        dbName: TEST_DB_NAME,
      },
    });
    process.env.MONGO_URI = mongoServer.getUri();
  }

  ensureEnvironmentVariables();

  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGO_URI, {
      dbName: TEST_DB_NAME,
    });
  }

  if (!app) {
    ({ default: app } = await import('../../src/app.js'));
    requestAgent = supertest(app);
  }

  return {
    app,
    request: requestAgent,
    connection: mongoose.connection,
  };
};

export const teardownTestApplication = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  }

  if (mongoServer) {
    await mongoServer.stop();
    mongoServer = null;
  }

  app = null;
  requestAgent = null;
};

export const resetDatabase = async () => {
  if (mongoose.connection.readyState !== 0) {
    const collections = await mongoose.connection.db.collections();
    await Promise.all(collections.map((collection) => collection.deleteMany({})));
  }
};
