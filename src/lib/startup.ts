import { execSync } from 'child_process';
import path from 'path';

/**
 * Runs database migrations and any other startup tasks before the server starts.
 * Skips in test environment to avoid affecting test runs.
 */
export async function runStartup(): Promise<void> {
  if (process.env.NODE_ENV === 'test') {
    return;
  }

  const projectRoot = path.resolve(__dirname, '../..');

  try {
    // Run pending Prisma migrations
    execSync('npx prisma migrate deploy', {
      cwd: projectRoot,
      stdio: 'inherit',
      env: { ...process.env, FORCE_COLOR: '0' },
    });
  } catch (err) {
    console.error('Startup failed: Database migration could not be completed.');
    console.error('Ensure DATABASE_URL is set and the database is accessible.');
    process.exit(1);
  }
}
