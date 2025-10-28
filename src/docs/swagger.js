import swaggerJSDoc from 'swagger-jsdoc';
import { API_PREFIX, DEFAULT_API_VERSION } from '../config/app.js';
import { getConfig } from '../config/env.js';

const config = getConfig();

const swaggerDefinition = {
  openapi: '3.1.0',
  info: {
    title: 'GridSpace API',
    version: '1.0.0',
    description: 'API documentation for the GridSpace backend scaffold.',
  },
  servers: [
    {
      url: `http://localhost:${config.port}${API_PREFIX}`,
      description: 'Local development server',
    },
  ],
  tags: [
    { name: 'Health', description: 'API health check endpoints' },
    { name: 'Workspaces', description: 'Workspace management endpoints' },
    { name: 'Auth', description: 'Authentication, onboarding, and OTP flows' },
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
  },
};

const options = {
  definition: swaggerDefinition,
  apis: ['src/routes/**/*.js'],
  failOnErrors: false,
};

export const swaggerSpec = swaggerJSDoc(options);
export const swaggerDocsMetadata = {
  path: `${API_PREFIX}/${DEFAULT_API_VERSION}/docs`,
  uiPath: `${API_PREFIX}/docs`,
  jsonPath: `${API_PREFIX}/docs/json`,
};
