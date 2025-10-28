import express from "express";
import helmet from "helmet";
import cors from "cors";
import compression from "compression";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";
import requestId from "express-request-id";
import { apiRouter } from "./routes/index.js";
import { API_DOCS_PATH, API_PREFIX } from "./config/app.js";
import { getConfig } from "./config/env.js";
import { loggerStream } from "./config/logger.js";
import { swaggerDocsMetadata, swaggerSpec } from "./docs/swagger.js";
import { baseRateLimiter } from "./middlewares/rate-limit.js";
import {
  metricsEnabled,
  metricsContentType,
  getMetricsSnapshot,
  startHttpRequestTimer,
  observeHttpRequest,
} from "./metrics/prometheus.js";
import { notFoundHandler } from "./middlewares/not-found.js";
import { errorHandler } from "./middlewares/error-handler.js";

const config = getConfig();

morgan.token("id", (req) => req.id ?? "anonymous");

const app = express();
const swaggerUiSetup = swaggerUi.setup(swaggerSpec, { explorer: true });
const morganFormat =
  "[:id] :method :url :status :res[content-length] - :response-time ms";

app.use(helmet());
app.use(requestId());
app.use((req, res, next) => {
  res.locals.requestId = req.id;
  next();
});
const corsOrigins = config.cors.allowedOrigins;

app.use(
  cors({
    origin:
      corsOrigins.length === 0
        ? true
        : (origin, callback) => {
            if (!origin) {
              return callback(null, false);
            }

            if (corsOrigins.includes("*") || corsOrigins.includes(origin)) {
              return callback(null, origin);
            }

            return callback(new Error("Not allowed by CORS"));
          },
    credentials: true,
  })
);
app.use(compression());

app.use(baseRateLimiter);

if (metricsEnabled) {
  app.use((req, res, next) => {
    const endTimer = startHttpRequestTimer();

    res.on("finish", () => {
      const route = req.route?.path
        ? `${req.baseUrl}${req.route.path}` || req.route.path
        : (req.originalUrl?.split("?")[0] ?? req.originalUrl);

      observeHttpRequest(endTimer, {
        method: req.method,
        route,
        statusCode: res.statusCode,
      });
    });

    next();
  });

  app.get("/metrics", async (req, res, next) => {
    try {
      const metrics = await getMetricsSnapshot();
      res.setHeader("Content-Type", metricsContentType);
      res.send(metrics);
    } catch (error) {
      next(error);
    }
  });
}

app.use(morgan(morganFormat, { stream: loggerStream }));

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

app.use(swaggerDocsMetadata.uiPath, swaggerUi.serve, swaggerUiSetup);
app.use(swaggerDocsMetadata.path, swaggerUi.serve, swaggerUiSetup);
app.get(swaggerDocsMetadata.jsonPath, (req, res) => {
  res.json(swaggerSpec);
});

app.get(`${API_DOCS_PATH}`, (req, res) => {
  res.redirect(swaggerDocsMetadata.uiPath);
});

app.use(API_PREFIX, apiRouter);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
