export class WorkspaceService {
  constructor({ workspaceRepository }) {
    if (!workspaceRepository) {
      throw new Error('WorkspaceService requires a workspaceRepository');
    }
    this.workspaceRepository = workspaceRepository;
  }

  async listWorkspaces(query = {}) {
    const {
      location,
      priceMin,
      priceMax,
      capacity,
      purposes,
      amenities,
      page,
      limit,
      sortBy,
    } = query;

    const numeric = (value) => {
      if (value === undefined || value === null || value === '') {
        return undefined;
      }
      const parsed = Number(value);
      return Number.isNaN(parsed) ? undefined : parsed;
    };

    return this.workspaceRepository.paginateSpaces({
      filters: {
        location,
        priceMin: numeric(priceMin),
        priceMax: numeric(priceMax),
        capacity: numeric(capacity),
        purposes,
        amenities,
      },
      page: numeric(page) || undefined,
      limit: numeric(limit) || undefined,
      sortBy,
    });
  }

  async getWorkspaceById(id) {
    if (!id) {
      throw new Error('WorkspaceService.getWorkspaceById requires an id');
    }

    return this.workspaceRepository.findActiveById(id, {
      populateHost: true,
      lean: true,
    });
  }

  async createWorkspace({ hostId, payload }) {
    if (!hostId) {
      throw new Error('WorkspaceService.createWorkspace requires a hostId');
    }

    if (!payload) {
      throw new Error('WorkspaceService.createWorkspace requires payload data');
    }

    const workspaceData = {
      ...payload,
      hostId,
      images: payload.images ?? [],
      timeSlots: payload.timeSlots ?? [],
      isActive: true,
    };

    return this.workspaceRepository.create(workspaceData);
  }

  async updateWorkspace(id, payload) {
    if (!id) {
      throw new Error('WorkspaceService.updateWorkspace requires an id');
    }

    if (!payload || Object.keys(payload).length === 0) {
      throw new Error('WorkspaceService.updateWorkspace requires payload data');
    }

    return this.workspaceRepository.update(id, payload, {
      populateHost: true,
      lean: true,
    });
  }

  async deleteWorkspace(id) {
    if (!id) {
      throw new Error('WorkspaceService.deleteWorkspace requires an id');
    }

    return this.workspaceRepository.softDelete(id);
  }

  async listHostWorkspaces(hostId, query = {}) {
    if (!hostId) {
      throw new Error('WorkspaceService.listHostWorkspaces requires a hostId');
    }

    const { page, limit } = query;
    const numeric = (value) => {
      if (value === undefined || value === null || value === '') {
        return undefined;
      }
      const parsed = Number(value);
      return Number.isNaN(parsed) ? undefined : parsed;
    };

    return this.workspaceRepository.paginateHostSpaces(hostId, {
      page: numeric(page) || undefined,
      limit: numeric(limit) || undefined,
    });
  }

  async countActiveHostWorkspaces(hostId) {
    if (!hostId) {
      throw new Error('WorkspaceService.countActiveHostWorkspaces requires a hostId');
    }

    return this.workspaceRepository.countActiveByHost(hostId);
  }
}

