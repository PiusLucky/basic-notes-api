import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { ApiError } from '../middleware/errorHandler';
import { getPaginationParams } from '../middleware/validation';

export async function createNote(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { title, content } = req.body;
    const note = await prisma.note.create({
      data: {
        title,
        content: content || null,
      },
    });
    res.status(201).json({
      success: true,
      data: note,
    });
  } catch (err) {
    next(err);
  }
}

export async function getAllNotes(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { page, limit, skip } = getPaginationParams(req);

    const [notes, total] = await Promise.all([
      prisma.note.findMany({
        orderBy: { updated_at: 'desc' },
        skip,
        take: limit,
      }),
      prisma.note.count(),
    ]);

    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: notes,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function getNoteById(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const note = await prisma.note.findUnique({
      where: { id },
    });

    if (!note) {
      const error = new Error('Note not found') as ApiError;
      error.statusCode = 404;
      return next(error);
    }

    res.json({
      success: true,
      data: note,
    });
  } catch (err) {
    next(err);
  }
}

export async function updateNote(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const { title, content } = req.body;

    const updateData: { title?: string; content?: string | null } = {};
    if (title !== undefined) updateData.title = title;
    if (content !== undefined) updateData.content = content;

    const note = await prisma.note.update({
      where: { id },
      data: updateData,
    });

    res.json({
      success: true,
      data: note,
    });
  } catch (err) {
    next(err);
  }
}

export async function deleteNote(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    await prisma.note.delete({
      where: { id },
    });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
