import { Router } from 'express';
import { v1Router } from './v1/index.js';

const apiRouter = Router();

const apiVersions = new Map([
  ['v1', v1Router],
]);

apiVersions.forEach((versionRouter, version) => {
  apiRouter.use(`/${version}`, versionRouter);
});

apiRouter.get('/', (req, res) => {
  const versions = Array.from(apiVersions.keys()).map((version) => ({ version }));
  return res.status(200).json({ success: true, data: { versions } });
});

export { apiRouter, apiVersions };
