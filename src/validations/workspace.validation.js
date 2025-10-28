import Joi from 'joi';

export const createWorkspaceSchema = {
  body: Joi.object({
    name: Joi.string().trim().min(3).max(100).required(),
    description: Joi.string().trim().max(500).optional(),
    capacity: Joi.number().integer().positive().required(),
    amenities: Joi.array().items(Joi.string().trim().max(50)).default([]),
    location: Joi.object({
      address: Joi.string().trim().required(),
      city: Joi.string().trim().required(),
      country: Joi.string().trim().required(),
    }).required(),
  }),
};

export const updateWorkspaceSchema = {
  params: Joi.object({
    id: Joi.string().guid({ version: 'uuidv4' }).required(),
  }),
  body: Joi.object({
    name: Joi.string().trim().min(3).max(100),
    description: Joi.string().trim().max(500),
    capacity: Joi.number().integer().positive(),
    amenities: Joi.array().items(Joi.string().trim().max(50)),
    location: Joi.object({
      address: Joi.string().trim().required(),
      city: Joi.string().trim().required(),
      country: Joi.string().trim().required(),
    }),
  }).min(1),
};

export const workspaceIdParamSchema = {
  params: Joi.object({
    id: Joi.string().guid({ version: 'uuidv4' }).required(),
  }),
};
