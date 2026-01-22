import { PrismaClient } from "@prisma/client";
import { historyQuerySchema } from "../utils/validation.js";

const prisma = new PrismaClient();
const HAND_SIZE = parseInt(process.env.HAND_SIZE) || 6;

export default async function statsRoutes(fastify) {
  // Get user statistics
  fastify.get(
    "/api/stats/user",
    { onRequest: [fastify.authenticate] },
    async (request, reply) => {
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
        return reply.code(500).send({ error: "Internal server error" });
      }
    },
  );

  // Get game history
  fastify.get(
    "/api/stats/history",
    { onRequest: [fastify.authenticate] },
    async (request, reply) => {
      try {
        const { limit, offset } = historyQuerySchema.parse(request.query);

        const history = await prisma.gameHistory.findMany({
          where: { userId: request.user.id },
          orderBy: { createdAt: "desc" },
          take: limit,
          skip: offset,
        });

        const formattedHistory = history.map((item) => ({
          id: item.id,
          action_type: item.actionType,
          action_data: item.actionData,
          created_at: item.createdAt,
        }));

        return reply.send(formattedHistory);
      } catch (error) {
        if (error.name === "ZodError") {
          return reply.code(400).send({ error: error.errors });
        }
        fastify.log.error(error);
        return reply.code(500).send({ error: "Internal server error" });
      }
    },
  );

  // Reset user progress (hand and statistics)
  fastify.post(
    "/api/stats/reset",
    { onRequest: [fastify.authenticate] },
    async (request, reply) => {
      try {
        const userId = request.user.id;

        // Get existing data to archive
        const existingGameState = await prisma.userGameState.findUnique({
          where: { userId },
        });

        const existingStats = await prisma.userStatistics.findUnique({
          where: { userId },
        });

        // Create archive entry in game history with timestamp
        const archiveTimestamp = Date.now();
        const archiveData = {
          timestamp: archiveTimestamp,
          userId: userId,
          gameState: existingGameState
            ? {
                hand: existingGameState.hand,
                gameSize: existingGameState.gameSize,
                deck: existingGameState.deck,
                discardPile: existingGameState.discardPile,
              }
            : null,
          statistics: existingStats
            ? {
                totalCardsDrawn: existingStats.totalCardsDrawn,
                totalCardsPlayed: existingStats.totalCardsPlayed,
                gamesCompleted: existingStats.gamesCompleted,
              }
            : null,
        };

        // Store archive in game history
        await prisma.gameHistory.create({
          data: {
            userId,
            actionType: "reset_archive",
            actionData: archiveData,
          },
        });

        // Reset game state
        if (existingGameState) {
          await prisma.userGameState.update({
            where: { userId },
            data: {
              hand: Array(HAND_SIZE).fill(null),
              deck: [],
              discardPile: [],
            },
          });
        } else {
          await prisma.userGameState.create({
            data: {
              userId,
              hand: Array(HAND_SIZE).fill(null),
              gameSize: 5,
              deck: [],
              discardPile: [],
            },
          });
        }

        // Reset statistics - store original userId in gamesCompleted as requested
        if (existingStats) {
          await prisma.userStatistics.update({
            where: { userId },
            data: {
              totalCardsDrawn: 0,
              totalCardsPlayed: 0,
              gamesCompleted: userId, // Store userId in gamesCompleted as requested
            },
          });
        } else {
          await prisma.userStatistics.create({
            data: {
              userId,
              totalCardsDrawn: 0,
              totalCardsPlayed: 0,
              gamesCompleted: userId, // Store userId in gamesCompleted as requested
            },
          });
        }

        return reply.send({
          success: true,
          message: "User progress has been reset and archived in game history",
          archiveTimestamp: archiveTimestamp,
        });
      } catch (error) {
        fastify.log.error(error);
        return reply.code(500).send({ error: "Internal server error" });
      }
    },
  );
}
