import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';

export interface ApiError extends Error {
  statusCode?: number;
}

export function errorHandler(
  err: ApiError | Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (process.env.NODE_ENV !== 'test') {
    console.error('Error:', err);
  }

  // Prisma "Record not found" (P2025)
  if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
    res.status(404).json({
      success: false,
      error: 'Note not found',
    });
    return;
  }

  // Custom API errors with status codes
  if ('statusCode' in err && typeof err.statusCode === 'number') {
    res.status(err.statusCode).json({
      success: false,
      error: err.message,
    });
    return;
  }

  // Validation errors (from express-validator)
  if (err.name === 'ValidationError') {
    res.status(400).json({
      success: false,
      error: err.message,
    });
    return;
  }

  // Default: 500 Internal Server Error
  res.status(500).json({
    success: false,
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
  });
}
