import { NotImplementedError } from '../utils/errors.js';

export class WorkspaceService {
  constructor({ workspaceRepository }) {
    if (!workspaceRepository) {
      throw new Error('WorkspaceService requires a workspaceRepository');
    }
    this.workspaceRepository = workspaceRepository;
  }

  async listWorkspaces() {
    throw new NotImplementedError('WorkspaceService.listWorkspaces is not implemented yet.');
  }

  async getWorkspaceById(id) {
    throw new NotImplementedError('WorkspaceService.getWorkspaceById is not implemented yet.');
  }

  async createWorkspace(payload) {
    throw new NotImplementedError('WorkspaceService.createWorkspace is not implemented yet.');
  }

  async updateWorkspace(id, payload) {
    throw new NotImplementedError('WorkspaceService.updateWorkspace is not implemented yet.');
  }

  async deleteWorkspace(id) {
    throw new NotImplementedError('WorkspaceService.deleteWorkspace is not implemented yet.');
  }
}

