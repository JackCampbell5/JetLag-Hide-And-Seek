import { PrismaClient } from '@prisma/client';
import { historyQuerySchema } from '../utils/validation.js';

const prisma = new PrismaClient();

export default async function statsRoutes(fastify) {
  // Get user statistics
  fastify.get('/api/stats/user', { onRequest: [fastify.authenticate] }, async (request, reply) => {
    try {
      let stats = await prisma.userStatistics.findUnique({
        where: { userId: request.user.id },
      });

      if (!stats) {
        // Return default stats if not found
        return reply.send({
          total_cards_drawn: 0,
          total_cards_played: 0,
          games_completed: 0,
        });
      }

      return reply.send({
        total_cards_drawn: stats.totalCardsDrawn,
        total_cards_played: stats.totalCardsPlayed,
        games_completed: stats.gamesCompleted,
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });

  // Get game history
  fastify.get('/api/stats/history', { onRequest: [fastify.authenticate] }, async (request, reply) => {
    try {
      const { limit, offset } = historyQuerySchema.parse(request.query);

      const history = await prisma.gameHistory.findMany({
        where: { userId: request.user.id },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      });

      const formattedHistory = history.map(item => ({
        id: item.id,
        action_type: item.actionType,
        action_data: item.actionData,
        created_at: item.createdAt,
      }));

      return reply.send(formattedHistory);
    } catch (error) {
      if (error.name === 'ZodError') {
        return reply.code(400).send({ error: error.errors });
      }
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });

  // Reset user progress (hand and statistics)
  fastify.post('/api/stats/reset', { onRequest: [fastify.authenticate] }, async (request, reply) => {
    try {
      const userId = request.user.id;

      // Reset user game state (hand)
      await prisma.userGameState.updateMany({
        where: { userId },
        data: {
          hand: [null, null, null, null, null],
          deck: [],
          discardPile: [],
        },
      });

      // Reset user statistics
      await prisma.userStatistics.updateMany({
        where: { userId },
        data: {
          totalCardsDrawn: 0,
          totalCardsPlayed: 0,
          gamesCompleted: 0,
        },
      });

      return reply.send({
        success: true,
        message: 'User progress has been reset',
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });
}
