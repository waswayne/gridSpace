import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import supertest from 'supertest';

import { setupTestApplication, teardownTestApplication, resetDatabase } from '../utils/test-app.js';
import { WorkspaceRepository } from '../../src/repositories/workspace.repository.js';
import { WorkspaceService } from '../../src/services/workspace.service.js';
import { WorkspaceModel } from '../../src/models/workspace.model.js';
import { UserModel } from '../../src/models/user.model.js';
import { SearchAnalyticsModel } from '../../src/models/search-analytics.model.js';
import { getConfig } from '../../src/config/env.js';

const baseWorkspacePayload = ({ hostId, index = 1 }) => ({
  hostId,
  title: `Test Space ${index}`,
  description: 'A comfortable workspace for testing purposes',
  location: 'Lagos',
  address: '123 Test Street',
  pricePerHour: 5000,
  images: [],
  amenities: ['WiFi', 'Projector'],
  purposes: ['Team Meetings'],
  capacity: 10,
  timeSlots: [
    {
      day: 'monday',
      startTime: '09:00',
      endTime: '17:00',
    },
  ],
  isActive: true,
});

const createHostUser = async ({ email = `host-${Date.now()}@example.com`, overrides = {} } = {}) => {
  const userId = new mongoose.Types.ObjectId();

  const user = await UserModel.create({
    _id: userId,
    fullName: 'Workspace Host',
    email,
    role: 'host',
    emailVerified: true,
    onboardingCompleted: true,
    isActive: true,
    ...overrides,
  });

  const config = getConfig();
  const accessToken = jwt.sign(
    {
      sub: user._id.toString(),
      role: user.role,
    },
    config.auth.jwtSecret,
    { expiresIn: '1h' }
  );

  return { user, accessToken };
};

describe('Workspace routes smoke tests', () => {
  let app;
  let request;
  let workspaceRepository;
  let workspaceService;

  beforeAll(async () => {
    const setup = await setupTestApplication();
    app = setup.app;
    request = supertest(app);
    workspaceRepository = new WorkspaceRepository();
    workspaceService = new WorkspaceService({ workspaceRepository });
  }, 60_000);

  beforeEach(async () => {
    await resetDatabase();
  });

  afterAll(async () => {
    await teardownTestApplication();
  });

  it('returns paginated spaces and logs search analytics', async () => {
    const { user: host } = await createHostUser();

    await WorkspaceModel.create([baseWorkspacePayload({ hostId: host._id, index: 1 })]);

    const response = await request.get('/api/v1/workspaces').query({ location: 'lagos' });

    expect(response.status, JSON.stringify(response.body)).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data.spaces)).toBe(true);
    expect(response.body.data.spaces).toHaveLength(1);

    const analyticsCount = await SearchAnalyticsModel.countDocuments();
    expect(analyticsCount).toBe(1);
  });

  it('returns 404 for soft-deleted spaces', async () => {
    const { user: host } = await createHostUser();
    const [space] = await WorkspaceModel.create([baseWorkspacePayload({ hostId: host._id, index: 1 })]);

    await WorkspaceModel.findByIdAndUpdate(space._id, { isActive: false });

    const response = await request.get(`/api/v1/workspaces/${space._id.toString()}`);

    expect(response.status).toBe(404);
  });

  it('lists authenticated host spaces only', async () => {
    const { user: host, accessToken } = await createHostUser();
    await WorkspaceModel.create([
      baseWorkspacePayload({ hostId: host._id, index: 1 }),
      baseWorkspacePayload({ hostId: host._id, index: 2 }),
    ]);

    const response = await request
      .get('/api/v1/workspaces/my/spaces')
      .set('Authorization', `Bearer ${accessToken}`)
      .query({ page: 1, limit: 5 });

    expect(response.status).toBe(200);
    expect(response.body.data.spaces).toHaveLength(2);
  });

  it('allows hosts to create spaces until reaching the active limit', async () => {
    const { user: host, accessToken } = await createHostUser();

    for (let index = 1; index <= 10; index += 1) {
      const payload = {
        title: `Host Space ${index}`,
        description: 'Great space',
        location: 'Lagos',
        pricePerHour: 5000,
        amenities: ['WiFi'],
        purposes: ['Remote Work'],
        capacity: 5,
        timeSlots: [
          {
            day: 'monday',
            startTime: '08:00',
            endTime: '12:00',
          },
        ],
      };

      const createResponse = await request
        .post('/api/v1/workspaces')
        .set('Authorization', `Bearer ${accessToken}`)
        .field('title', payload.title)
        .field('description', payload.description)
        .field('location', payload.location)
        .field('pricePerHour', payload.pricePerHour.toString())
        .field('capacity', payload.capacity.toString())
        .field('amenities[]', payload.amenities)
        .field('purposes[]', payload.purposes)
        .field('timeSlots[0][day]', payload.timeSlots[0].day)
        .field('timeSlots[0][startTime]', payload.timeSlots[0].startTime)
        .field('timeSlots[0][endTime]', payload.timeSlots[0].endTime);

      expect(createResponse.status, JSON.stringify(createResponse.body)).toBe(201);
    }

    const eleventhResponse = await request
      .post('/api/v1/workspaces')
      .set('Authorization', `Bearer ${accessToken}`)
      .field('title', 'Host Space 11')
      .field('description', 'Another space')
      .field('location', 'Lagos')
      .field('pricePerHour', '5000')
      .field('capacity', '5')
      .field('amenities[]', 'WiFi')
      .field('purposes[]', 'Remote Work')
      .field('timeSlots[0][day]', 'tuesday')
      .field('timeSlots[0][startTime]', '10:00')
      .field('timeSlots[0][endTime]', '14:00');

    expect(eleventhResponse.status, JSON.stringify(eleventhResponse.body)).toBe(400);
  });

  it('rejects workspace creation when payload fails validation', async () => {
    const { accessToken } = await createHostUser();

    const response = await request
      .post('/api/v1/workspaces')
      .set('Authorization', `Bearer ${accessToken}`)
      .field('title', 'Bad Space')
      .field('description', 'Too cheap to be true')
      .field('location', 'Lagos')
      .field('pricePerHour', '100') // below minimum 500
      .field('capacity', '5')
      .field('timeSlots[0][day]', 'monday')
      .field('timeSlots[0][startTime]', '08:00')
      .field('timeSlots[0][endTime]', '12:00');

    expect(response.status, JSON.stringify(response.body)).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.error?.code).toBe('VALIDATION_ERROR');
  });

  it('rejects workspace creation when more than five images are provided', async () => {
    const { accessToken } = await createHostUser();

    const builder = request
      .post('/api/v1/workspaces')
      .set('Authorization', `Bearer ${accessToken}`)
      .field('title', 'Image Heavy Space')
      .field('description', 'Tons of images')
      .field('location', 'Lagos')
      .field('pricePerHour', '6000')
      .field('capacity', '4')
      .field('timeSlots[0][day]', 'monday')
      .field('timeSlots[0][startTime]', '09:00')
      .field('timeSlots[0][endTime]', '17:00');

    for (let index = 0; index < 6; index += 1) {
      builder.field(`images[${index}]`, `https://example.com/${index}.jpg`);
    }

    const response = await builder;

    expect(response.status, JSON.stringify(response.body)).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.error?.code).toBe('VALIDATION_ERROR');
  });

  it('allows hosts to update their spaces', async () => {
    const { user: host, accessToken } = await createHostUser();
    const created = await workspaceRepository.create(
      baseWorkspacePayload({ hostId: host._id, index: 1 })
    );

    const response = await request
      .patch(`/api/v1/workspaces/${created._id.toString()}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .field('title', 'Updated Space Title')
      .field('pricePerHour', '6500');

    expect(response.status).toBe(200);
    expect(response.body.data.title).toBe('Updated Space Title');
    expect(response.body.data.pricePerHour).toBe(6500);
  });

  it('soft deletes spaces and hides them from public listings', async () => {
    const { user: host, accessToken } = await createHostUser();
    const created = await workspaceRepository.create(
      baseWorkspacePayload({ hostId: host._id, index: 1 })
    );

    const deleteResponse = await request
      .delete(`/api/v1/workspaces/${created._id.toString()}`)
      .set('Authorization', `Bearer ${accessToken}`);

    expect(deleteResponse.status, JSON.stringify(deleteResponse.body)).toBe(200);

    const publicResponse = await request.get(`/api/v1/workspaces/${created._id.toString()}`);
    expect(publicResponse.status).toBe(404);
  });

  it('requires authentication for host workspace listing', async () => {
    const response = await request.get('/api/v1/workspaces/my/spaces');

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
    expect(response.body.error?.code).toBe('UNAUTHORIZED');
  });
});
