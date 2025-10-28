import { Router } from 'express';
import { WorkspaceController } from '../../controllers/workspace.controller.js';
import { WorkspaceService } from '../../services/workspace.service.js';
import { WorkspaceRepository } from '../../repositories/workspace.repository.js';
import { validateRequest } from '../../middlewares/validate.js';
import {
  createWorkspaceSchema,
  updateWorkspaceSchema,
  workspaceIdParamSchema,
} from '../../validations/workspace.validation.js';

const router = Router();

const workspaceRepository = new WorkspaceRepository();
const workspaceService = new WorkspaceService({ workspaceRepository });
const workspaceController = new WorkspaceController({ workspaceService });

router.get('/', workspaceController.list);
router.get('/:id', validateRequest(workspaceIdParamSchema), workspaceController.getById);
router.post('/', validateRequest(createWorkspaceSchema), workspaceController.create);
router.patch('/:id', validateRequest(updateWorkspaceSchema), workspaceController.update);
router.delete('/:id', validateRequest(workspaceIdParamSchema), workspaceController.remove);

export { router as workspaceRouter };
