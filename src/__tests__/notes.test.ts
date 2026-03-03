import request from 'supertest';
import app from '../app';
import { prisma } from '../lib/prisma';

describe('Notes API', () => {
  beforeEach(async () => {
    await prisma.note.deleteMany({});
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('POST /api/notes', () => {
    it('should create a new note with title and content', async () => {
      const response = await request(app)
        .post('/api/notes')
        .send({
          title: 'Test Note',
          content: 'This is the note content',
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.title).toBe('Test Note');
      expect(response.body.data.content).toBe('This is the note content');
      expect(response.body.data).toHaveProperty('created_at');
      expect(response.body.data).toHaveProperty('updated_at');
    });

    it('should create a note with only title (content optional)', async () => {
      const response = await request(app)
        .post('/api/notes')
        .send({ title: 'Title Only Note' })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe('Title Only Note');
      expect(response.body.data.content).toBeNull();
    });

    it('should return 400 when title is missing', async () => {
      const response = await request(app)
        .post('/api/notes')
        .send({ content: 'Content without title' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Title is required');
    });

    it('should return 400 when title is empty string', async () => {
      const response = await request(app)
        .post('/api/notes')
        .send({ title: '   ', content: 'Some content' })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/notes', () => {
    it('should return empty array when no notes exist', async () => {
      const response = await request(app)
        .get('/api/notes')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual([]);
      expect(response.body.pagination).toEqual({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
        hasNext: false,
        hasPrev: false,
      });
    });

    it('should return notes with default pagination', async () => {
      await prisma.note.createMany({
        data: [
          { title: 'Note 1', content: 'Content 1' },
          { title: 'Note 2', content: 'Content 2' },
        ],
      });

      const response = await request(app)
        .get('/api/notes')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.pagination).toMatchObject({
        page: 1,
        limit: 10,
        total: 2,
        totalPages: 1,
      });
    });

    it('should paginate with page and limit params', async () => {
      await prisma.note.createMany({
        data: [
          { title: 'Note 1', content: 'Content 1' },
          { title: 'Note 2', content: 'Content 2' },
          { title: 'Note 3', content: 'Content 3' },
        ],
      });

      const response = await request(app)
        .get('/api/notes?page=1&limit=2')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.pagination).toMatchObject({
        page: 1,
        limit: 2,
        total: 3,
        totalPages: 2,
        hasNext: true,
        hasPrev: false,
      });
    });

    it('should return 400 for invalid pagination params', async () => {
      const response = await request(app)
        .get('/api/notes?page=0&limit=5')
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/notes/:id', () => {
    it('should return a specific note by id', async () => {
      const note = await prisma.note.create({
        data: { title: 'Single Note', content: 'Single content' },
      });

      const response = await request(app)
        .get(`/api/notes/${note.id}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(note.id);
      expect(response.body.data.title).toBe('Single Note');
    });

    it('should return 404 when note does not exist', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      const response = await request(app)
        .get(`/api/notes/${fakeId}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Note not found');
    });

    it('should return 400 for invalid UUID format', async () => {
      const response = await request(app)
        .get('/api/notes/invalid-id')
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/notes/:id', () => {
    it('should update a note', async () => {
      const note = await prisma.note.create({
        data: { title: 'Original', content: 'Original content' },
      });

      const response = await request(app)
        .put(`/api/notes/${note.id}`)
        .send({ title: 'Updated Title', content: 'Updated content' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe('Updated Title');
      expect(response.body.data.content).toBe('Updated content');
    });

    it('should update only title when content not provided', async () => {
      const note = await prisma.note.create({
        data: { title: 'Original', content: 'Keep this' },
      });

      const response = await request(app)
        .put(`/api/notes/${note.id}`)
        .send({ title: 'New Title' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe('New Title');
      expect(response.body.data.content).toBe('Keep this');
    });

    it('should return 404 when updating non-existent note', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      const response = await request(app)
        .put(`/api/notes/${fakeId}`)
        .send({ title: 'Updated' })
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    it('should return 400 for invalid UUID', async () => {
      await request(app)
        .put('/api/notes/invalid-id')
        .send({ title: 'Updated' })
        .expect(400);
    });
  });

  describe('DELETE /api/notes/:id', () => {
    it('should delete a note', async () => {
      const note = await prisma.note.create({
        data: { title: 'To Delete', content: 'Content' },
      });

      await request(app)
        .delete(`/api/notes/${note.id}`)
        .expect(204);

      const found = await prisma.note.findUnique({ where: { id: note.id } });
      expect(found).toBeNull();
    });

    it('should return 404 when deleting non-existent note', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      const response = await request(app)
        .delete(`/api/notes/${fakeId}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    it('should return 400 for invalid UUID', async () => {
      await request(app)
        .delete('/api/notes/invalid-id')
        .expect(400);
    });
  });
});
