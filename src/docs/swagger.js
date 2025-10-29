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
    { name: 'Bookings', description: 'Space booking lifecycle management endpoints' },
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      Booking: {
        type: 'object',
        properties: {
          _id: { type: 'string', format: 'objectId', example: '665f0d9c2f8fae3efd4a1b01' },
          spaceId: { type: 'string', format: 'objectId', example: '665f0d9c2f8fae3efd4a1b02' },
          userId: { type: 'string', format: 'objectId', example: '665f0d9c2f8fae3efd4a1b03' },
          startTime: { type: 'string', format: 'date-time' },
          endTime: { type: 'string', format: 'date-time' },
          bookingType: {
            type: 'string',
            enum: ['hourly', 'daily', 'weekly', 'monthly'],
          },
          guestCount: { type: 'integer', minimum: 1, example: 4 },
          status: {
            type: 'string',
            enum: ['pending', 'upcoming', 'in_progress', 'completed', 'cancelled'],
          },
          paymentStatus: {
            type: 'string',
            enum: ['pending', 'paid', 'failed', 'refunded', 'partially_refunded'],
          },
          markupPercentage: { type: 'number', example: 15 },
          totalAmount: { type: 'number', example: 15000 },
          hostEarnings: { type: 'number', example: 12000 },
          canCancel: { type: 'boolean', example: true },
          canReschedule: { type: 'boolean', example: true },
          specialRequests: { type: 'string', example: 'Need projector ready' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      Pagination: {
        type: 'object',
        properties: {
          currentPage: { type: 'integer', example: 1 },
          totalPages: { type: 'integer', example: 5 },
          totalBookings: { type: 'integer', example: 42 },
          hasNextPage: { type: 'boolean', example: true },
          hasPrevPage: { type: 'boolean', example: false },
        },
      },
      BookingListResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'Bookings retrieved successfully' },
          data: {
            type: 'object',
            properties: {
              bookings: {
                type: 'array',
                items: { $ref: '#/components/schemas/Booking' },
              },
              pagination: { $ref: '#/components/schemas/Pagination' },
            },
          },
        },
      },
      BookingResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'Booking created successfully' },
          data: {
            oneOf: [
              { $ref: '#/components/schemas/Booking' },
              {
                type: 'object',
                properties: {
                  booking: { $ref: '#/components/schemas/Booking' },
                  refund: {
                    type: 'object',
                    properties: {
                      amount: { type: 'number', example: 7500 },
                      type: { type: 'string', example: 'partial_refund_50p' },
                    },
                  },
                },
              },
            ],
          },
        },
      },
      BookingCreatePayload: {
        type: 'object',
        required: ['spaceId', 'startTime', 'endTime'],
        properties: {
          spaceId: { type: 'string', format: 'objectId' },
          startTime: { type: 'string', format: 'date-time' },
          endTime: { type: 'string', format: 'date-time' },
          bookingType: {
            type: 'string',
            enum: ['hourly', 'daily', 'weekly', 'monthly'],
            default: 'hourly',
          },
          guestCount: { type: 'integer', minimum: 1, default: 1 },
          specialRequests: { type: 'string', maxLength: 500 },
        },
      },
      BookingStatusUpdatePayload: {
        type: 'object',
        required: ['status'],
        properties: {
          status: {
            type: 'string',
            enum: ['upcoming', 'in_progress', 'completed', 'cancelled'],
          },
          hostNotes: { type: 'string', maxLength: 500 },
          cancellationReason: {
            type: 'string',
            enum: ['user_request', 'host_request', 'payment_timeout', 'system_error', 'other'],
          },
        },
      },
      BookingReschedulePayload: {
        type: 'object',
        required: ['newStartTime', 'newEndTime'],
        properties: {
          newStartTime: { type: 'string', format: 'date-time' },
          newEndTime: { type: 'string', format: 'date-time' },
          reason: { type: 'string', maxLength: 500 },
        },
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          message: { type: 'string', example: 'Validation failed' },
          errors: {
            type: 'array',
            items: { type: 'string' },
          },
        },
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
