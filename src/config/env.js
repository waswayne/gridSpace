import dotenv from 'dotenv';
import Joi from 'joi';

dotenv.config();

const envSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'test', 'production')
    .default('development'),
  PORT: Joi.number().integer().min(1024).max(65535).default(3000),
  LOG_LEVEL: Joi.string()
    .valid('fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent')
    .default('info'),
  RATE_LIMIT_WINDOW_MS: Joi.number().integer().positive().default(15 * 60 * 1000),
  RATE_LIMIT_MAX: Joi.number().integer().positive().default(100),
  CORS_ALLOWED_ORIGINS: Joi.string().allow('').default(''),
  METRICS_ENABLED: Joi.boolean().truthy('true').falsy('false').default(false),
  JWT_SECRET: Joi.string().min(32).required(),
  JWT_EXPIRES_IN: Joi.string().default('24h'),
  REFRESH_TOKEN_SECRET: Joi.string().min(32).required(),
  REFRESH_TOKEN_EXPIRES_IN: Joi.string().default('7d'),
  PASSWORD_RESET_TTL_MINUTES: Joi.number().integer().positive().default(60),
  EMAIL_VERIFICATION_TTL_MINUTES: Joi.number().integer().positive().default(30),
  CLOUDINARY_CLOUD_NAME: Joi.string().trim(),
  CLOUDINARY_API_KEY: Joi.string().trim(),
  CLOUDINARY_API_SECRET: Joi.string().trim(),
  MAIL_FROM_ADDRESS: Joi.string().trim().email(),
  MAIL_FROM_NAME: Joi.string().trim(),
  MAIL_SMTP_SERVICE: Joi.string().trim(),
  MAIL_SMTP_HOST: Joi.string().trim(),
  MAIL_SMTP_PORT: Joi.number().integer().positive(),
  MAIL_SMTP_SECURE: Joi.boolean().truthy('true').falsy('false'),
  MAIL_SMTP_USER: Joi.string().trim(),
  MAIL_SMTP_PASS: Joi.string().trim(),
  MAIL_SMTP_APP_PASSWORD: Joi.string().trim(),
  MAIL_FRONTEND_BASE_URL: Joi.string().uri(),
  GOOGLE_OAUTH_CLIENT_ID: Joi.string().trim(),
  GOOGLE_OAUTH_CLIENT_SECRET: Joi.string().trim(),
  GOOGLE_OAUTH_REDIRECT_URI: Joi.string().uri(),
  MONGO_URI: Joi.string()
    .uri({ scheme: ['mongodb', 'mongodb+srv'] })
    .required(),
  MONGO_DB_NAME: Joi.string().trim().min(1),
  MONGO_MAX_POOL_SIZE: Joi.number().integer().min(1).default(10),
  MONGO_MIN_POOL_SIZE: Joi.number().integer().min(0).default(0),
  MONGO_CONNECT_TIMEOUT_MS: Joi.number().integer().positive().default(10000),
  MONGO_SOCKET_TIMEOUT_MS: Joi.number().integer().positive().default(45000),
}).unknown();

let cachedConfig;

export const getConfig = () => {
  if (cachedConfig) {
    return cachedConfig;
  }

  const { value, error } = envSchema.validate(process.env, {
    abortEarly: false,
    convert: true,
    allowUnknown: true,
    stripUnknown: true,
  });

  if (error) {
    throw new Error(`Environment validation error: ${error.message}`);
  }

  const mongoUri = value.MONGO_URI;
  let derivedDbName = value.MONGO_DB_NAME;

  if (!derivedDbName) {
    try {
      const url = new URL(mongoUri);
      const pathname = url.pathname?.replace(/^\//, '');
      if (pathname) {
        derivedDbName = pathname;
      }
    } catch (err) {
      // Ignore URL parse errors; validation would have caught invalid URIs.
    }
  }

  const allowedOrigins = value.CORS_ALLOWED_ORIGINS.split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  cachedConfig = Object.freeze({
    nodeEnv: value.NODE_ENV,
    port: value.PORT,
    logLevel: value.LOG_LEVEL,
    rateLimit: {
      windowMs: value.RATE_LIMIT_WINDOW_MS,
      max: value.RATE_LIMIT_MAX,
    },
    cors: {
      allowedOrigins: allowedOrigins.length > 0 ? allowedOrigins : [],
    },
    metrics: {
      enabled: value.METRICS_ENABLED,
    },
    auth: {
      jwtSecret: value.JWT_SECRET,
      jwtExpiresIn: value.JWT_EXPIRES_IN,
      refreshTokenSecret: value.REFRESH_TOKEN_SECRET,
      refreshTokenExpiresIn: value.REFRESH_TOKEN_EXPIRES_IN,
      passwordResetTtlMinutes: value.PASSWORD_RESET_TTL_MINUTES,
      emailVerificationTtlMinutes: value.EMAIL_VERIFICATION_TTL_MINUTES,
    },
    cloudinary: {
      cloudName: value.CLOUDINARY_CLOUD_NAME,
      apiKey: value.CLOUDINARY_API_KEY,
      apiSecret: value.CLOUDINARY_API_SECRET,
    },
    mail: {
      fromAddress: value.MAIL_FROM_ADDRESS,
      fromName: value.MAIL_FROM_NAME,
      frontendBaseUrl: value.MAIL_FRONTEND_BASE_URL,
      smtp: {
        service: value.MAIL_SMTP_SERVICE,
        host: value.MAIL_SMTP_HOST,
        port: value.MAIL_SMTP_PORT,
        secure: value.MAIL_SMTP_SECURE,
        user: value.MAIL_SMTP_USER,
        pass: value.MAIL_SMTP_PASS,
        appPassword: value.MAIL_SMTP_APP_PASSWORD,
      },
    },
    googleOAuth: {
      clientId: value.GOOGLE_OAUTH_CLIENT_ID,
      clientSecret: value.GOOGLE_OAUTH_CLIENT_SECRET,
      redirectUri: value.GOOGLE_OAUTH_REDIRECT_URI,
    },
    mongo: {
      uri: mongoUri,
      dbName: derivedDbName,
      options: {
        maxPoolSize: value.MONGO_MAX_POOL_SIZE,
        minPoolSize: value.MONGO_MIN_POOL_SIZE,
        connectTimeoutMS: value.MONGO_CONNECT_TIMEOUT_MS,
        socketTimeoutMS: value.MONGO_SOCKET_TIMEOUT_MS,
      },
    },
  });

  return cachedConfig;
};
