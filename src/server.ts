import express from 'express';
import { routes } from './routes/index.routes';
import { metricsMiddleware } from './middlewares/metrics.middleware';
import { register } from './metrics/metrics';

const app = express();

app.use(express.json());
app.use(metricsMiddleware);


app.get('/metrics', async (_req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

app.use(routes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
 });