import { Router } from 'express';
import { HealthController } from '../../controllers/health.controller.js';

const router = Router();
const controller = new HealthController();

router.get('/', controller.status);

export { router as healthRouter };
