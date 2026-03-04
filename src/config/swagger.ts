import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

const options: swaggerJsdoc.OAS3Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Notes API',
      version: '1.0.0',
      description: 'REST API for a simple Notes application. Create, read, update, and delete notes.',
    },
    servers: [
      { url: 'https://basic-notes-api.onrender.com', description: 'Staging server' },
      { url: 'http://localhost:3000', description: 'Development server' }
    ],
    paths: {
      '/api/notes': {
        post: {
          summary: 'Create a new note',
          tags: ['Notes'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CreateNoteRequest' },
                example: {
                  title: 'My First Note',
                  content: 'This is the note body. Content is optional.',
                },
              },
            },
          },
          responses: {
            '201': {
              description: 'Note created successfully',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/NoteResponse' },
                },
              },
            },
            '400': {
              description: 'Validation error - e.g. missing or invalid title',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
          },
        },
        get: {
          summary: 'Get all notes (paginated)',
          tags: ['Notes'],
          parameters: [
            {
              name: 'page',
              in: 'query',
              schema: { type: 'integer', minimum: 1, default: 1 },
              description: 'Page number (default: 1)',
            },
            {
              name: 'limit',
              in: 'query',
              schema: { type: 'integer', minimum: 1, maximum: 100, default: 10 },
              description: 'Items per page (default: 10, max: 100)',
            },
          ],
          responses: {
            '200': {
              description: 'Paginated list of notes',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/PaginatedNoteListResponse' },
                },
              },
            },
            '400': {
              description: 'Invalid pagination parameters',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
          },
        },
      },
      '/api/notes/{id}': {
        get: {
          summary: 'Get a note by ID',
          tags: ['Notes'],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string', format: 'uuid' },
              description: 'Note UUID',
            },
          ],
          responses: {
            '200': {
              description: 'Note found',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/NoteResponse' },
                },
              },
            },
            '400': {
              description: 'Invalid UUID format',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
            '404': {
              description: 'Note not found',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
          },
        },
        put: {
          summary: 'Update a note',
          tags: ['Notes'],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string', format: 'uuid' },
              description: 'Note UUID',
            },
          ],
          requestBody: {
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/UpdateNoteRequest' },
                example: {
                  title: 'Updated Title',
                  content: 'Updated content',
                },
              },
            },
          },
          responses: {
            '200': {
              description: 'Note updated successfully',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/NoteResponse' },
                },
              },
            },
            '400': {
              description: 'Validation error',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
            '404': {
              description: 'Note not found',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
          },
        },
        delete: {
          summary: 'Delete a note',
          tags: ['Notes'],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string', format: 'uuid' },
              description: 'Note UUID',
            },
          ],
          responses: {
            '204': {
              description: 'Note deleted successfully (no content returned)',
            },
            '400': {
              description: 'Invalid UUID format',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
            '404': {
              description: 'Note not found',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
          },
        },
      },
    },
    components: {
      schemas: {
        Note: {
          type: 'object',
          required: ['id', 'title', 'created_at', 'updated_at'],
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'Unique identifier',
            },
            title: {
              type: 'string',
              maxLength: 255,
              description: 'Note title',
            },
            content: {
              type: 'string',
              nullable: true,
              description: 'Note body (optional)',
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              description: 'Creation timestamp',
            },
            updated_at: {
              type: 'string',
              format: 'date-time',
              description: 'Last update timestamp',
            },
          },
        },
        CreateNoteRequest: {
          type: 'object',
          required: ['title'],
          properties: {
            title: {
              type: 'string',
              maxLength: 255,
              description: 'Note title (required)',
            },
            content: {
              type: 'string',
              description: 'Note body (optional but recommended)',
            },
          },
        },
        UpdateNoteRequest: {
          type: 'object',
          properties: {
            title: {
              type: 'string',
              maxLength: 255,
              description: 'Updated note title',
            },
            content: {
              type: 'string',
              description: 'Updated note body',
            },
          },
          description: 'At least one of title or content should be provided',
        },
        NoteResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: { $ref: '#/components/schemas/Note' },
          },
        },
        NoteListResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: {
              type: 'array',
              items: { $ref: '#/components/schemas/Note' },
            },
          },
        },
        PaginationMeta: {
          type: 'object',
          properties: {
            page: { type: 'integer', description: 'Current page number' },
            limit: { type: 'integer', description: 'Items per page' },
            total: { type: 'integer', description: 'Total number of items' },
            totalPages: { type: 'integer', description: 'Total number of pages' },
            hasNext: { type: 'boolean', description: 'Whether there is a next page' },
            hasPrev: { type: 'boolean', description: 'Whether there is a previous page' },
          },
        },
        PaginatedNoteListResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: {
              type: 'array',
              items: { $ref: '#/components/schemas/Note' },
            },
            pagination: { $ref: '#/components/schemas/PaginationMeta' },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            error: { type: 'string', description: 'Error message' },
          },
        },
      },
    },
  },
  apis: [],
};

const swaggerSpec = swaggerJsdoc(options);

export function setupSwagger(app: Express, basePath = '/api-docs'): void {
  app.use(basePath, swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Notes API Documentation',
  }));
}
