import { WorkspaceService } from '../services/workspace.service.js';
import { NotImplementedError } from '../utils/errors.js';

export class WorkspaceController {
  constructor({ workspaceService } = {}) {
    if (!workspaceService) {
      throw new Error('WorkspaceController requires a workspaceService');
    }

    if (!(workspaceService instanceof WorkspaceService)) {
      throw new Error('workspaceService must be an instance of WorkspaceService');
    }

    this.workspaceService = workspaceService;

    this.list = this.list.bind(this);
    this.getById = this.getById.bind(this);
    this.create = this.create.bind(this);
    this.update = this.update.bind(this);
    this.remove = this.remove.bind(this);
  }

  async list(req, res, next) {
    try {
      throw new NotImplementedError('WorkspaceController.list is not implemented yet.');
    } catch (error) {
      return next(error);
    }
  }

  async getById(req, res, next) {
    try {
      throw new NotImplementedError('WorkspaceController.getById is not implemented yet.');
    } catch (error) {
      return next(error);
    }
  }

  async create(req, res, next) {
    try {
      throw new NotImplementedError('WorkspaceController.create is not implemented yet.');
    } catch (error) {
      return next(error);
    }
  }

  async update(req, res, next) {
    try {
      throw new NotImplementedError('WorkspaceController.update is not implemented yet.');
    } catch (error) {
      return next(error);
    }
  }

  async remove(req, res, next) {
    try {
      throw new NotImplementedError('WorkspaceController.remove is not implemented yet.');
    } catch (error) {
      return next(error);
    }
  }
}
