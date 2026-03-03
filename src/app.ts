import express from 'express';
import cors from 'cors';
import notesRoutes from './routes/notesRoutes';
import { errorHandler } from './middleware/errorHandler';
import { setupSwagger } from './config/swagger';

const app = express();

app.use(cors());
app.use(express.json());

setupSwagger(app);

app.get('/', (_req, res) => {
  res.json({ message: 'Notes API is running', ping: 'pong', documentation: '/api-docs' });
});

app.use('/api', notesRoutes);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use(errorHandler);

export default app;
