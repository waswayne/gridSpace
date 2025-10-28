import Joi from 'joi';

const amenitiesEnum = [
  'WiFi',
  'Projector',
  'Whiteboard',
  'Air Conditioning',
  'Power Backup',
  'Parking',
  'Coffee/Tea',
  'Printer/Scanner',
  'Conference Phone',
  'Monitor',
  'Kitchen',
  'Restroom',
];

const purposesEnum = [
  'Remote Work',
  'Study Session',
  'Team Meetings',
  'Networking',
  'Presentations',
  'Creative Work',
  'Interview',
  'Training',
  'Client Meeting',
];

const timeSlotSchema = Joi.object({
  day: Joi.string()
    .valid('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday')
    .required(),
  startTime: Joi.string()
    .pattern(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .required()
    .messages({ 'string.pattern.base': 'startTime must be in HH:MM format' }),
  endTime: Joi.string()
    .pattern(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .required()
    .messages({ 'string.pattern.base': 'endTime must be in HH:MM format' }),
});

export const workspaceIdParamSchema = {
  params: Joi.object({
    id: Joi.string().hex().length(24).required(),
  }),
};

export const createWorkspaceSchema = {
  body: Joi.object({
    title: Joi.string().trim().min(5).max(100).required(),
    description: Joi.string().trim().min(10).max(1000).required(),
    location: Joi.string().trim().min(3).max(200).required(),
    address: Joi.string().trim().max(300).optional(),
    pricePerHour: Joi.number().min(500).max(50000).required(),
    capacity: Joi.number().integer().min(1).max(100).required(),
    amenities: Joi.array()
      .items(Joi.string().valid(...amenitiesEnum))
      .max(12)
      .optional(),
    purposes: Joi.array()
      .items(Joi.string().valid(...purposesEnum))
      .max(6)
      .optional(),
    timeSlots: Joi.array().items(timeSlotSchema).optional(),
    images: Joi.array()
      .items(Joi.string().uri({ scheme: [/https?/] }))
      .max(5)
      .optional(),
  }),
};

export const updateWorkspaceSchema = {
  params: workspaceIdParamSchema.params,
  body: Joi.object({
    title: Joi.string().trim().min(5).max(100),
    description: Joi.string().trim().min(10).max(1000),
    location: Joi.string().trim().min(3).max(200),
    address: Joi.string().trim().max(300),
    pricePerHour: Joi.number().min(500).max(50000),
    capacity: Joi.number().integer().min(1).max(100),
    amenities: Joi.array().items(Joi.string().valid(...amenitiesEnum)).max(12),
    purposes: Joi.array().items(Joi.string().valid(...purposesEnum)).max(6),
    timeSlots: Joi.array().items(timeSlotSchema),
    images: Joi.array().items(Joi.string().uri({ scheme: [/https?/] })).max(5),
  }).min(1),
};

export const searchWorkspaceSchema = {
  query: Joi.object({
    location: Joi.string().trim().min(2).max(200),
    priceMin: Joi.number().min(0).max(50000),
    priceMax: Joi.number().min(0).max(50000),
    capacity: Joi.number().integer().min(1).max(100),
    purposes: Joi.alternatives()
      .try(Joi.array().items(Joi.string().valid(...purposesEnum)), Joi.string().valid(...purposesEnum))
      .optional(),
    amenities: Joi.alternatives()
      .try(Joi.array().items(Joi.string().valid(...amenitiesEnum)), Joi.string().valid(...amenitiesEnum))
      .optional(),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(50).default(12),
    sortBy: Joi.string()
      .valid('price_low_high', 'price_high_low', 'rating', 'newest', 'most_popular')
      .default('newest'),
  }).with('priceMin', 'priceMax').with('priceMax', 'priceMin'),
};
