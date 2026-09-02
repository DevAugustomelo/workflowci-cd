import { NextFunction, Request, Response } from 'express';
import {
  httpRequestDurationSeconds,
  httpRequestsInProgress,
  httpRequestsTotal,
} from '../metrics/metrics';

// Usamos req.route?.path (definido pelo Express após o roteamento) quando
// disponível, para não gerar uma métrica nova por cada ID diferente na URL
// (ex: /cars/1, /cars/2 ...), o que "explodiria" a cardinalidade no Prometheus.
function resolveRoute(req: Request): string {
  const routePath = req.route?.path as string | undefined;
  if (routePath) {
    const baseUrl = req.baseUrl || '';
    return `${baseUrl}${routePath}` || req.path;
  }
  return req.path;
}

export function metricsMiddleware(req: Request, res: Response, next: NextFunction) {
  const start = process.hrtime.bigint();
  const method = req.method;

  // Evitamos instrumentar a própria rota /metrics para não poluir os dados
  if (req.path === '/metrics') {
    return next();
  }

  httpRequestsInProgress.inc({ method, route: req.path });

  res.on('finish', () => {
    const route = resolveRoute(req);
    const statusCode = res.statusCode.toString();
    const durationInSeconds = Number(process.hrtime.bigint() - start) / 1e9;

    httpRequestsTotal.inc({ method, route, status_code: statusCode });
    httpRequestDurationSeconds.observe(
      { method, route, status_code: statusCode },
      durationInSeconds,
    );
    httpRequestsInProgress.dec({ method, route: req.path });
  });

  next();
}
