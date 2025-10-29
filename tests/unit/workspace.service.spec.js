import { describe, it, expect, beforeEach, vi } from 'vitest';
import { WorkspaceService } from '../../src/services/workspace.service.js';

const createRepositoryMock = () => ({
  paginateSpaces: vi.fn().mockResolvedValue('paginate-result'),
  findActiveById: vi.fn().mockResolvedValue('workspace'),
  create: vi.fn().mockResolvedValue('created'),
  update: vi.fn().mockResolvedValue('updated'),
  softDelete: vi.fn().mockResolvedValue('deleted'),
  paginateHostSpaces: vi.fn().mockResolvedValue('host-paginated'),
  countActiveByHost: vi.fn().mockResolvedValue(3),
});

describe('WorkspaceService', () => {
  let repository;
  let service;

  beforeEach(() => {
    repository = createRepositoryMock();
    service = new WorkspaceService({ workspaceRepository: repository });
  });

  it('normalizes numeric filters when listing workspaces', async () => {
    await service.listWorkspaces({
      location: 'lagos',
      priceMin: '1500',
      priceMax: '2500',
      capacity: '12',
      page: '2',
      limit: '24',
      sortBy: 'price_low_high',
      amenities: ['WiFi'],
      purposes: ['Team Meetings'],
    });

    expect(repository.paginateSpaces).toHaveBeenCalledWith({
      filters: {
        location: 'lagos',
        priceMin: 1500,
        priceMax: 2500,
        capacity: 12,
        purposes: ['Team Meetings'],
        amenities: ['WiFi'],
      },
      page: 2,
      limit: 24,
      sortBy: 'price_low_high',
    });
  });

  it('ignores invalid numeric values in listWorkspaces filters', async () => {
    await service.listWorkspaces({
      priceMin: 'not-a-number',
      capacity: '',
      page: '1',
    });

    expect(repository.paginateSpaces).toHaveBeenCalledWith({
      filters: {
        location: undefined,
        priceMin: undefined,
        priceMax: undefined,
        capacity: undefined,
        purposes: undefined,
        amenities: undefined,
      },
      page: 1,
      limit: undefined,
      sortBy: undefined,
    });
  });

  it('returns workspace by id when present', async () => {
    const workspace = await service.getWorkspaceById('space-id');

    expect(repository.findActiveById).toHaveBeenCalledWith('space-id', {
      populateHost: true,
      lean: true,
    });
    expect(workspace).toBe('workspace');
  });

  it('throws when getWorkspaceById is called without id', async () => {
    await expect(service.getWorkspaceById()).rejects.toThrow(
      'WorkspaceService.getWorkspaceById requires an id'
    );
  });

  it('creates workspace with defaults for optional arrays', async () => {
    const payload = {
      title: 'Space',
      description: 'Great space',
      location: 'Lagos',
      pricePerHour: 5000,
      capacity: 8,
    };

    const result = await service.createWorkspace({ hostId: 'host-1', payload });

    expect(repository.create).toHaveBeenCalledWith({
      ...payload,
      hostId: 'host-1',
      images: [],
      timeSlots: [],
      isActive: true,
    });
    expect(result).toBe('created');
  });

  it('throws when createWorkspace is missing hostId', async () => {
    await expect(service.createWorkspace({ payload: {} })).rejects.toThrow(
      'WorkspaceService.createWorkspace requires a hostId'
    );
  });

  it('throws when createWorkspace payload is missing', async () => {
    await expect(service.createWorkspace({ hostId: 'host-1' })).rejects.toThrow(
      'WorkspaceService.createWorkspace requires payload data'
    );
  });

  it('updates workspace with payload', async () => {
    const result = await service.updateWorkspace('space-1', { title: 'Updated' });

    expect(repository.update).toHaveBeenCalledWith('space-1', { title: 'Updated' }, {
      populateHost: true,
      lean: true,
    });
    expect(result).toBe('updated');
  });

  it('throws when updateWorkspace is missing id', async () => {
    await expect(service.updateWorkspace(undefined, { title: 'Updated' })).rejects.toThrow(
      'WorkspaceService.updateWorkspace requires an id'
    );
  });

  it('throws when updateWorkspace payload is empty', async () => {
    await expect(service.updateWorkspace('space-1', {})).rejects.toThrow(
      'WorkspaceService.updateWorkspace requires payload data'
    );
  });

  it('deletes workspace by id', async () => {
    const result = await service.deleteWorkspace('space-1');

    expect(repository.softDelete).toHaveBeenCalledWith('space-1');
    expect(result).toBe('deleted');
  });

  it('throws when deleteWorkspace is missing id', async () => {
    await expect(service.deleteWorkspace()).rejects.toThrow(
      'WorkspaceService.deleteWorkspace requires an id'
    );
  });

  it('lists host workspaces with numeric pagination', async () => {
    const result = await service.listHostWorkspaces('host-1', {
      page: '3',
      limit: '15',
    });

    expect(repository.paginateHostSpaces).toHaveBeenCalledWith('host-1', {
      page: 3,
      limit: 15,
    });
    expect(result).toBe('host-paginated');
  });

  it('throws when listHostWorkspaces is missing host id', async () => {
    await expect(service.listHostWorkspaces(undefined, {})).rejects.toThrow(
      'WorkspaceService.listHostWorkspaces requires a hostId'
    );
  });

  it('counts active host workspaces', async () => {
    const count = await service.countActiveHostWorkspaces('host-1');

    expect(repository.countActiveByHost).toHaveBeenCalledWith('host-1');
    expect(count).toBe(3);
  });

  it('throws when countActiveHostWorkspaces is missing host id', async () => {
    await expect(service.countActiveHostWorkspaces()).rejects.toThrow(
      'WorkspaceService.countActiveHostWorkspaces requires a hostId'
    );
  });
});
