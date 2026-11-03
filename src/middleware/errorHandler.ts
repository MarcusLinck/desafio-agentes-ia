import { Request, Response, NextFunction } from 'express';
import { logger } from '../lib/logger.js';

interface AppError extends Error {
  statusCode?: number;
  stack?: string;
  issues?: Array<{
    path: string[];
    message: string;
  }> | undefined;
}

export const errorHandler = (
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  const statusCode = err.statusCode || 500;
  const isProduction = process.env.NODE_ENV === 'production';
  const isZodValidation = !isProduction && err.issues && err.issues.length > 0;

  let error = { ...err };
  error.message = err.message;

  if (!isProduction) {
    error.stack = err.stack;
  }

  if (!isProduction && error.stack) {
    error.stack = err.stack;
  }

  if (isProduction && statusCode === 500) {
    error.message = 'Erro interno no servidor';
  }

  if (isZodValidation && err.issues) {
    logger.warn({
      error: error.message,
      url: _req.url,
      method: _req.method,
      ip: _req.ip,
      userAgent: _req.get('User-Agent'),
      details: err.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      })),
    }, 'Falha de validação Zod detectada');
  } else {
    logger.error({
      error: error.message,
      stack: error.stack,
      url: _req.url,
      method: _req.method,
      ip: _req.ip,
      userAgent: _req.get('User-Agent'),
    }, 'Erro tratado pelo middleware global');
  }

  res.status(statusCode).json({
    status: 'error',
    message: error.message,
    ...(isProduction ? {} : { stack: error.stack }),
  });
};

export const notFoundHandler = (_req: Request, _res: Response, next: NextFunction) => {
  const error: AppError = new Error(`Rota não encontrada: ${_req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};