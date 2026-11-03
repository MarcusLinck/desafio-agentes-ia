import express, { type Request, type Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import { swaggerDefinition } from './lib/swagger.js';
import { pinoHttp } from 'pino-http';
import { logger } from './lib/logger.js';
import orderRoutes from './http/routes/orderRoutes.js';
import { productRoutes } from './http/routes/productRoutes.js';
import agentRoutes from './http/routes/agentRoutes.js';

const app = express();

app.use(helmet());

app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'],
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10kb' }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'error',
    message: 'Muitas requisições originadas deste IP, tente novamente mais tarde.'
  }
});
app.use(limiter);

app.use(pinoHttp({ logger }));

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDefinition));

app.use('/api/v1', orderRoutes);
app.use('/api/v1', productRoutes);
app.use('/api/v1', agentRoutes);

app.get('/health', (_req: Request, res: Response) => {
  return res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    message: 'AI agent running!'
  });
});

export default app;