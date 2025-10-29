import { describe, it, expect, beforeEach, vi } from 'vitest';
import { WorkspaceRepository } from '../../src/repositories/workspace.repository.js';

const createQueryMock = () => {
  const query = {
    populate: vi.fn().mockReturnThis(),
    lean: vi.fn().mockReturnThis(),
    exec: vi.fn().mockResolvedValue('result'),
  };
  return query;
};

describe('WorkspaceRepository', () => {
  let workspaceModel;
  let repository;

  beforeEach(() => {
    workspaceModel = {
      paginate: vi.fn(),
      findOne: vi.fn(),
      findById: vi.fn(),
      create: vi.fn(),
      findByIdAndUpdate: vi.fn(),
      countDocuments: vi.fn(),
    };
    repository = new WorkspaceRepository({ workspaceModel });
  });

  it('builds search filter with location, price range, capacity, amenities, and purposes', async () => {
    workspaceModel.paginate.mockResolvedValue('paginated');

    const result = await repository.paginateSpaces({
      filters: {
        location: 'lagos',
        priceMin: 1000,
        priceMax: 4000,
        capacity: 10,
        amenities: ['WiFi', 'Projector'],
        purposes: ['Team Meetings'],
      },
      page: 2,
      limit: 5,
      sortBy: 'price_high_low',
      lean: true,
    });

    expect(workspaceModel.paginate).toHaveBeenCalledWith(
      {
        isActive: true,
        location: { $regex: 'lagos', $options: 'i' },
        pricePerHour: { $gte: 1000, $lte: 4000 },
        capacity: { $gte: 10 },
        amenities: { $all: ['WiFi', 'Projector'] },
        purposes: { $in: ['Team Meetings'] },
      },
      expect.objectContaining({
        page: 2,
        limit: 5,
        sort: { pricePerHour: -1 },
        lean: true,
      })
    );
    expect(result).toBe('paginated');
  });

  it('falls back to default sort when sortBy is unknown', async () => {
    workspaceModel.paginate.mockResolvedValue('sorted');

    await repository.paginateSpaces({ sortBy: 'unknown' });

    expect(workspaceModel.paginate).toHaveBeenCalledWith(
      { isActive: true },
      expect.objectContaining({ sort: { createdAt: -1 } })
    );
  });

  it('paginates host spaces with defaults and optional populate disabled', async () => {
    workspaceModel.paginate.mockResolvedValue('host');

    await repository.paginateHostSpaces('host-1', { populateHost: false });

    expect(workspaceModel.paginate).toHaveBeenCalledWith(
      { hostId: 'host-1', isActive: true },
      expect.objectContaining({
        sort: { createdAt: -1 },
        page: 1,
        limit: 10,
        lean: true,
      })
    );
    const options = workspaceModel.paginate.mock.calls[0][1];
    expect(Object.prototype.hasOwnProperty.call(options, 'populate')).toBe(false);
  });

  it('finds active workspace by id with optional populate and lean', async () => {
    const query = createQueryMock();
    workspaceModel.findOne.mockReturnValue(query);

    const result = await repository.findActiveById('space-1', {
      lean: true,
      populateHost: true,
    });

    expect(workspaceModel.findOne).toHaveBeenCalledWith({ _id: 'space-1', isActive: true });
    expect(query.populate).toHaveBeenCalledWith('hostId', 'fullname profilePic emailVerified createdAt');
    expect(query.lean).toHaveBeenCalled();
    expect(result).toBe('result');
  });

  it('skips populate when flag is false in findActiveById', async () => {
    const query = createQueryMock();
    workspaceModel.findOne.mockReturnValue(query);

    await repository.findActiveById('space-1', { populateHost: false, lean: false });

    expect(query.populate).not.toHaveBeenCalled();
    expect(query.lean).not.toHaveBeenCalled();
  });

  it('updates workspace and returns result with populate when requested', async () => {
    const query = createQueryMock();
    workspaceModel.findByIdAndUpdate.mockReturnValue(query);

    const result = await repository.update('space-1', { title: 'Updated' }, { populateHost: true });

    expect(workspaceModel.findByIdAndUpdate).toHaveBeenCalledWith(
      'space-1',
      expect.objectContaining({ title: 'Updated', updatedAt: expect.any(Date) }),
      { new: true, runValidators: true }
    );
    expect(query.populate).toHaveBeenCalledWith('hostId', 'fullname profilePic emailVerified');
    expect(result).toBe('result');
  });

  it('soft deletes workspace by id', async () => {
    workspaceModel.findByIdAndUpdate.mockResolvedValue('soft-deleted');

    const result = await repository.softDelete('space-1');

    expect(workspaceModel.findByIdAndUpdate).toHaveBeenCalledWith(
      'space-1',
      expect.objectContaining({ isActive: false, updatedAt: expect.any(Date) }),
      { new: true }
    );
    expect(result).toBe('soft-deleted');
  });

  it('counts active workspaces for host', async () => {
    workspaceModel.countDocuments.mockResolvedValue(7);

    const count = await repository.countActiveByHost('host-1');

    expect(workspaceModel.countDocuments).toHaveBeenCalledWith({ hostId: 'host-1', isActive: true });
    expect(count).toBe(7);
  });
});
