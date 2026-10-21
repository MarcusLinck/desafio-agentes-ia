import express, { type Request, type Response } from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { swaggerDefinition } from './lib/swagger';
import { pinoHttp } from 'pino-http';
import { logger } from './lib/logger';
import orderRoutes from './http/routes/orderRoutes.js';
import { productRoutes } from './http/routes/productRoutes';
import agentRoutes from './http/routes/agentRoutes';

const app = express();

app.use(pinoHttp({ logger }));

app.use(cors());
app.use(express.json());

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDefinition));

app.use('/api/v1', orderRoutes);
app.use('/api/v1', productRoutes);
app.use('/api/v1', agentRoutes);

app.get('/health', (_req: Request, res: Response) => {
  return res.json({ status: 'ok', message: 'AI agent running!' });
});

export default app;