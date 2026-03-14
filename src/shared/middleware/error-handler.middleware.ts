import { ErrorRequestHandler } from 'express';
import { z, ZodError } from 'zod';
import { HttpError } from '../errors/http-error.js';
import { AppLogger } from '~/infrastructure/logger/index.js';

export const createErrorHandler =
  (logger: AppLogger): ErrorRequestHandler =>
  (err, _req, res, _next) => {
    if (err instanceof ZodError) {
      res
        .status(422)
        .json({ error: 'Validation failed', issues: z.treeifyError(err) });
      return;
    }

    if (err instanceof HttpError) {
      if (err.statusCode >= 500) logger.error({ err }, err.message);
      res
        .status(err.statusCode)
        .json({ error: err.message, details: err.details });
      return;
    }

    logger.error({ err }, 'Unhandled error');
    res.status(500).json({ error: 'Internal server error' });
  };
