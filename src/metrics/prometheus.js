import client from 'prom-client';
import { getConfig } from '../config/env.js';

const config = getConfig();
const metricsEnabled = config.metrics.enabled;

let httpRequestDuration;

if (metricsEnabled) {
  client.collectDefaultMetrics();

  httpRequestDuration = new client.Histogram({
    name: 'http_request_duration_seconds',
    help: 'Duration of HTTP requests in seconds',
    labelNames: ['method', 'route', 'status_code'],
    buckets: [0.05, 0.1, 0.3, 0.5, 1, 2, 5],
  });
}

export { metricsEnabled };
export const metricsRegister = client.register;
export const metricsContentType = client.register.contentType;

export const startHttpRequestTimer = () => {
  if (!metricsEnabled || !httpRequestDuration) {
    return null;
  }

  return httpRequestDuration.startTimer();
};

export const observeHttpRequest = (endTimer, { method, route, statusCode }) => {
  if (!metricsEnabled || !endTimer) {
    return;
  }

  endTimer({
    method,
    route,
    status_code: String(statusCode),
  });
};

export const getMetricsSnapshot = async () => {
  if (!metricsEnabled) {
    return '';
  }

  return metricsRegister.metrics();
};
