import { PrismaClient } from '@prisma/client';
import { hashPassword, verifyPassword, authenticate } from '../utils/auth.js';
import { userCreateSchema, userLoginSchema } from '../utils/validation.js';

const prisma = new PrismaClient();

export default async function authRoutes(fastify) {
  // Register
  fastify.post('/api/auth/register', async (request, reply) => {
    try {
      const { username, email, password } = userCreateSchema.parse(request.body);

      // Check if user exists
      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [{ username }, { email }],
        },
      });

      if (existingUser) {
        return reply.code(400).send({
          error: 'User with this username or email already exists',
        });
      }

      // Hash password
      const passwordHash = await hashPassword(password);

      // Create user
      const user = await prisma.user.create({
        data: {
          username,
          email,
          passwordHash,
        },
      });

      // Create game state
      await prisma.userGameState.create({
        data: {
          userId: user.id,
          hand: [null, null, null, null, null],
          gameSize: 5,
          deck: [],
          discardPile: [],
        },
      });

      // Create statistics
      await prisma.userStatistics.create({
        data: {
          userId: user.id,
          totalCardsDrawn: 0,
          totalCardsPlayed: 0,
          gamesCompleted: 0,
        },
      });

      // Generate token
      const token = fastify.jwt.sign({ id: user.id, username: user.username });

      return reply.code(201).send({
        access_token: token,
        token_type: 'bearer',
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          created_at: user.createdAt,
        },
      });
    } catch (error) {
      if (error.name === 'ZodError') {
        return reply.code(400).send({ error: error.errors });
      }
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });

  // Login
  fastify.post('/api/auth/login', async (request, reply) => {
    try {
      const { username, password } = userLoginSchema.parse(request.body);

      // Find user
      const user = await prisma.user.findUnique({
        where: { username },
      });

      if (!user) {
        return reply.code(401).send({ error: 'Invalid credentials' });
      }

      // Verify password
      const isValid = await verifyPassword(password, user.passwordHash);
      if (!isValid) {
        return reply.code(401).send({ error: 'Invalid credentials' });
      }

      // Generate token
      const token = fastify.jwt.sign({ id: user.id, username: user.username });

      return reply.send({
        access_token: token,
        token_type: 'bearer',
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          created_at: user.createdAt,
        },
      });
    } catch (error) {
      if (error.name === 'ZodError') {
        return reply.code(400).send({ error: error.errors });
      }
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });

  // Get current user
  fastify.get('/api/auth/me', { onRequest: [fastify.authenticate] }, async (request, reply) => {
    try {
      const user = await prisma.user.findUnique({
        where: { id: request.user.id },
      });

      if (!user) {
        return reply.code(404).send({ error: 'User not found' });
      }

      return reply.send({
        id: user.id,
        username: user.username,
        email: user.email,
        created_at: user.createdAt,
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });
}
