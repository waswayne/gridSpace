import { Router } from 'express';
import { WorkspaceController } from '../../controllers/workspace.controller.js';
import { WorkspaceService } from '../../services/workspace.service.js';
import { WorkspaceRepository } from '../../repositories/workspace.repository.js';
import { validateRequest } from '../../middlewares/validate.js';
import { authenticate, requireRoles } from '../../middlewares/auth.js';
import { upload } from '../../config/multer.js';
import {
  validateHostSpaceCreation,
  validateHostSpaceManagement,
  initHostMiddleware,
} from '../../middlewares/host.js';
import { baseRateLimiter } from '../../middlewares/rate-limit.js';
import { SearchAnalyticsRepository } from '../../repositories/search-analytics.repository.js';
import { SearchAnalyticsService } from '../../services/search-analytics.service.js';
import {
  createWorkspaceSchema,
  updateWorkspaceSchema,
  workspaceIdParamSchema,
  searchWorkspaceSchema,
} from '../../validations/workspace.validation.js';

const router = Router();

const workspaceRepository = new WorkspaceRepository();
const workspaceService = new WorkspaceService({ workspaceRepository });
const searchAnalyticsRepository = new SearchAnalyticsRepository();
const searchAnalyticsService = new SearchAnalyticsService({ searchAnalyticsRepository });
const workspaceController = new WorkspaceController({
  workspaceService,
  searchAnalyticsService,
});

initHostMiddleware({ workspaceService });

router.get('/', validateRequest(searchWorkspaceSchema), workspaceController.list);
router.get('/:id', validateRequest(workspaceIdParamSchema), workspaceController.getById);
router.get(
  '/my/spaces',
  authenticate,
  requireRoles('host', 'admin'),
  validateRequest(searchWorkspaceSchema),
  workspaceController.listMine
);

router.post(
  '/',
  authenticate,
  requireRoles('host', 'admin'),
  baseRateLimiter,
  validateHostSpaceCreation,
  upload.array('images', 5),
  validateRequest(createWorkspaceSchema),
  workspaceController.create
);

router.patch(
  '/:id',
  authenticate,
  requireRoles('host', 'admin'),
  validateHostSpaceManagement,
  upload.array('images', 5),
  validateRequest(updateWorkspaceSchema),
  workspaceController.update
);

router.delete(
  '/:id',
  authenticate,
  requireRoles('host', 'admin'),
  validateHostSpaceManagement,
  validateRequest(workspaceIdParamSchema),
  workspaceController.remove
);

export { router as workspaceRouter };

