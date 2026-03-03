import { Router } from 'express';
import {
  createNote,
  getAllNotes,
  getNoteById,
  updateNote,
  deleteNote,
} from '../controllers/notesController';
import {
  createNoteValidation,
  updateNoteValidation,
  noteIdValidation,
  paginationValidation,
  validate,
} from '../middleware/validation';

const router = Router();

router.post('/notes', validate(createNoteValidation), createNote);
router.get('/notes', validate(paginationValidation), getAllNotes);
router.get('/notes/:id', validate(noteIdValidation), getNoteById);
router.put('/notes/:id', validate(updateNoteValidation), updateNote);
router.delete('/notes/:id', validate(noteIdValidation), deleteNote);

export default router;
