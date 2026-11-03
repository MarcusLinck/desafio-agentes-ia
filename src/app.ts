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
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

const app = express();

// Handle unhandled rejections para evitar queda silenciosa do processo
process.on('unhandledRejection', (reason, promise) => {
  logger.error({ reason, promise }, 'Rejeição de promise não tratada - shutting down in 30s');
  // Graceful shutdown after logging
  setTimeout(() => process.exit(1), 30000);
});

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
  },
  handler: (req, res, options) => {
    logger.warn({
      message: 'Limite de requisições excedido',
      ip: req.ip,
      route: req.url,
      method: req.method,
      userAgent: req.get('User-Agent'),
      ...options
    }, 'Rate limit excedido');
    res.status(429).json({
      status: 'error',
      message: 'Muitas requisições originadas deste IP, tente novamente mais tarde.'
    });
  }
});
app.use(limiter);

app.use(pinoHttp({ logger }));

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDefinition));

app.use('/api/v1', orderRoutes);
app.use('/api/v1', productRoutes);
app.use('/api/v1', agentRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

app.get('/health', (_req: Request, res: Response) => {
  return res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    message: 'AI agent running!'
  });
});

export default app;