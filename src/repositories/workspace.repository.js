import { NotImplementedError } from '../utils/errors.js';

export class WorkspaceRepository {
  async findAll() {
    throw new NotImplementedError('WorkspaceRepository.findAll is not implemented yet.');
  }

  async findById(id) {
    throw new NotImplementedError('WorkspaceRepository.findById is not implemented yet.');
  }

  async create(workspace) {
    throw new NotImplementedError('WorkspaceRepository.create is not implemented yet.');
  }

  async update(id, changes) {
    throw new NotImplementedError('WorkspaceRepository.update is not implemented yet.');
  }

  async delete(id) {
    throw new NotImplementedError('WorkspaceRepository.delete is not implemented yet.');
  }
}
