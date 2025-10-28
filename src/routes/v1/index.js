import { Router } from 'express';
import { healthRouter } from './health.routes.js';
import { workspaceRouter } from './workspace.routes.js';
import { authRouter } from './auth.routes.js';

const v1Router = Router();

v1Router.use('/health', healthRouter);
v1Router.use('/workspaces', workspaceRouter);
v1Router.use('/auth', authRouter);

export { v1Router };
