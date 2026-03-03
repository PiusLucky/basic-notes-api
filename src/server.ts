import dotenv from 'dotenv';
import app from './app';
import { runStartup } from './lib/startup';

dotenv.config();

const PORT = process.env.PORT || 3000;

async function start(): Promise<void> {
  await runStartup();

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
