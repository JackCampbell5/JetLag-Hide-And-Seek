import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import staticFiles from '@fastify/static';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

import authRoutes from './routes/auth.js';
import gameRoutes from './routes/game.js';
import statsRoutes from './routes/stats.js';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const fastify = Fastify({
  logger: true,
});

// Register CORS
await fastify.register(cors, {
  origin: true,
  credentials: true,
});

// Register JWT
await fastify.register(jwt, {
  secret: process.env.JWT_SECRET || 'your-secret-key-change-this-in-production',
});

// Decorate fastify with authenticate function
fastify.decorate('authenticate', async function (request, reply) {
  try {
    await request.jwtVerify();
  } catch (err) {
    reply.code(401).send({ error: 'Unauthorized' });
  }
});

// Register routes
await fastify.register(authRoutes);
await fastify.register(gameRoutes);
await fastify.register(statsRoutes);

// Health check
fastify.get('/api/health', async (request, reply) => {
  return { status: 'healthy' };
});

// Serve frontend static files (for production)
const frontendPath = join(__dirname, '..', 'frontend', 'dist');
try {
  await fastify.register(staticFiles, {
    root: frontendPath,
    prefix: '/',
  });

  // SPA fallback - serve index.html for non-API routes
  fastify.setNotFoundHandler((request, reply) => {
    if (request.url.startsWith('/api/')) {
      reply.code(404).send({ error: 'Not found' });
    } else {
      reply.sendFile('index.html');
    }
  });
} catch (err) {
  fastify.log.warn('Frontend not built yet. API only mode.');
}

// Export for Vercel serverless
export default async function handler(req, res) {
  await fastify.ready();
  fastify.server.emit('request', req, res);
}

// Start server (only when running locally, not on Vercel)
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  const start = async () => {
    try {
      const port = process.env.PORT || 8000;
      const host = process.env.HOST || '0.0.0.0';

      await fastify.listen({ port: parseInt(port), host });
      fastify.log.info(`Server running at http://${host}:${port}`);
    } catch (err) {
      fastify.log.error(err);
      process.exit(1);
    }
  };

  start();
}
