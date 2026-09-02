import client from '@prometheus-io/client';

// Registro (Registry) global onde todas as métricas ficam registradas.
// É esse registro que a rota /metrics vai expor para o Prometheus fazer o "scrape".
const register = new client.Registry();

// Adiciona automaticamente métricas padrão do processo Node.js
// (uso de CPU, memória, event loop lag, garbage collector, etc.)
client.collectDefaultMetrics({
  register,
  prefix: 'observabilidade_',
});

// Contador: total de requisições HTTP recebidas, com labels de método, rota e status
export const httpRequestsTotal = new client.Counter({
  name: 'observabilidade_http_requests_total',
  help: 'Número total de requisições HTTP recebidas',
  labelNames: ['method', 'route', 'status_code'] as const,
  registers: [register],
});

// Histograma: duração das requisições HTTP em segundos, com labels de método, rota e status
export const httpRequestDurationSeconds = new client.Histogram({
  name: 'observabilidade_http_request_duration_seconds',
  help: 'Duração das requisições HTTP em segundos',
  labelNames: ['method', 'route', 'status_code'] as const,
  buckets: [0.05, 0.1, 0.3, 0.5, 1, 1.5, 3, 5, 10],
  registers: [register],
});

// Gauge: quantidade de requisições em andamento no momento
export const httpRequestsInProgress = new client.Gauge({
  name: 'observabilidade_http_requests_in_progress',
  help: 'Número de requisições HTTP em andamento',
  labelNames: ['method', 'route'] as const,
  registers: [register],
});

export { register };
