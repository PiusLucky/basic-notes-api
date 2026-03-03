import { body, param, query, validationResult, ValidationChain } from 'express-validator';
import { Request, Response, NextFunction } from 'express';
import { ApiError } from './errorHandler';

export const createNoteValidation: ValidationChain[] = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ max: 255 })
    .withMessage('Title must not exceed 255 characters'),
  body('content')
    .optional()
    .trim()
    .isString()
    .withMessage('Content must be a string'),
];

export const updateNoteValidation: ValidationChain[] = [
  param('id')
    .isUUID()
    .withMessage('Invalid note ID format'),
  body('title')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Title cannot be empty when provided')
    .isLength({ max: 255 })
    .withMessage('Title must not exceed 255 characters'),
  body('content')
    .optional()
    .trim()
    .isString()
    .withMessage('Content must be a string'),
];

export const noteIdValidation: ValidationChain[] = [
  param('id')
    .isUUID()
    .withMessage('Invalid note ID format'),
];

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;

export const paginationValidation: ValidationChain[] = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer')
    .toInt(),
  query('limit')
    .optional()
    .isInt({ min: 1, max: MAX_LIMIT })
    .withMessage(`Limit must be between 1 and ${MAX_LIMIT}`)
    .toInt(),
];

export function getPaginationParams(req: { query: { page?: string; limit?: string } }): { page: number; limit: number; skip: number } {
  const page = Math.max(1, parseInt(req.query.page || String(DEFAULT_PAGE), 10) || DEFAULT_PAGE);
  const limit = Math.min(MAX_LIMIT, Math.max(1, parseInt(req.query.limit || String(DEFAULT_LIMIT), 10) || DEFAULT_LIMIT));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}

export function validate(validations: ValidationChain[]) {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    await Promise.all(validations.map((v) => v.run(req)));
    const errors = validationResult(req);

    if (errors.isEmpty()) {
      next();
      return;
    }

    const errorMessages = errors.array().map((e) => (e as { msg: string }).msg).join(', ');
    const error = new Error(errorMessages) as ApiError;
    error.statusCode = 400;
    next(error);
  };
}
