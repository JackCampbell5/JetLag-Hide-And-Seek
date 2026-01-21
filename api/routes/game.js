import { PrismaClient } from '@prisma/client';
import {
  drawCardsSchema,
  updateHandSchema,
  updateHandSizeSchema,
  playCardSchema,
  placePendingCardsSchema,
} from '../utils/validation.js';
import {
  getOrCreateGameState,
  updateUserHand,
  updateGameSize,
  playCardFromHand,
  placePendingCards,
  logGameAction,
  updateStatistics,
  getDeckComposition,
} from '../services/gameService.js';
import { generateRandomCards, getDrawCount } from '../services/cardService.js';

const prisma = new PrismaClient();

export default async function gameRoutes(fastify) {
  // Get game state
  fastify.get('/api/game/state', { onRequest: [fastify.authenticate] }, async (request, reply) => {
    try {
      const gameState = await getOrCreateGameState(request.user.id);
      const deckComposition = getDeckComposition(gameState);

      return reply.send({
        hand: gameState.hand,
        game_size: gameState.gameSize,
        deck_size: gameState.deck.length,
        deck_composition: deckComposition,
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });

  // Draw cards
  fastify.post('/api/game/draw', { onRequest: [fastify.authenticate] }, async (request, reply) => {
    try {
      const { question_type } = drawCardsSchema.parse(request.body);

      const gameState = await getOrCreateGameState(request.user.id);
      const { draw, pick } = getDrawCount(question_type);

      // Generate random cards based on game size
      const cards = generateRandomCards(draw, gameState.gameSize);

      // Log action
      await logGameAction(request.user.id, 'draw', {
        question_type,
        cards_drawn: draw,
        cards,
      });

      // Update statistics
      await updateStatistics(request.user.id, { cardsDrawn: draw });

      return reply.send({
        cards,
        count: draw,
        pick_count: pick,
      });
    } catch (error) {
      if (error.name === 'ZodError') {
        return reply.code(400).send({ error: error.errors });
      }
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });

  // Update hand
  fastify.put('/api/game/hand', { onRequest: [fastify.authenticate] }, async (request, reply) => {
    try {
      const { hand } = updateHandSchema.parse(request.body);

      const gameState = await updateUserHand(request.user.id, hand);

      // Log action
      await logGameAction(request.user.id, 'update_hand', { hand });

      const deckComposition = getDeckComposition(gameState);

      return reply.send({
        hand: gameState.hand,
        game_size: gameState.gameSize,
        deck_size: gameState.deck.length,
        deck_composition: deckComposition,
      });
    } catch (error) {
      if (error.name === 'ZodError') {
        return reply.code(400).send({ error: error.errors });
      }
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });

  // Update hand size (game difficulty)
  fastify.put('/api/game/hand-size', { onRequest: [fastify.authenticate] }, async (request, reply) => {
    try {
      const { game_size } = updateHandSizeSchema.parse(request.body);

      const gameState = await updateGameSize(request.user.id, game_size);

      // Log action
      await logGameAction(request.user.id, 'update_game_size', { game_size });

      const deckComposition = getDeckComposition(gameState);

      return reply.send({
        hand: gameState.hand,
        game_size: gameState.gameSize,
        deck_size: gameState.deck.length,
        deck_composition: deckComposition,
      });
    } catch (error) {
      if (error.name === 'ZodError') {
        return reply.code(400).send({ error: error.errors });
      }
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });

  // Play card
  fastify.post('/api/game/play', { onRequest: [fastify.authenticate] }, async (request, reply) => {
    try {
      const { hand_position, discard_positions } = playCardSchema.parse(request.body);

      const result = await playCardFromHand(
        request.user.id,
        hand_position,
        discard_positions
      );

      // Log action
      await logGameAction(request.user.id, 'play_card', {
        hand_position,
        discard_positions,
        card_played: result.gameState.hand[hand_position],
      });

      const deckComposition = getDeckComposition(result.gameState);

      const response = {
        success: true,
        hand: result.gameState.hand,
        game_size: result.gameState.gameSize,
        deck_size: result.gameState.deck.length,
        deck_composition: deckComposition,
        message: 'Card played successfully',
      };

      if (result.curseData) {
        response.curse_data = result.curseData;
      }

      if (result.drawnCards && result.drawnCards.length > 0) {
        response.drawn_cards = result.drawnCards;

        if (result.autoPlaced) {
          response.auto_placed = true;
          response.placed_positions = result.placedPositions;
        } else {
          response.auto_placed = false;
          response.must_discard_count = result.drawnCards.length;
        }
      }

      return reply.send(response);
    } catch (error) {
      if (error.name === 'ZodError') {
        return reply.code(400).send({ error: error.errors });
      }
      fastify.log.error(error);
      return reply.code(400).send({ error: error.message });
    }
  });

  // Place pending cards
  fastify.post('/api/game/place-pending-cards', { onRequest: [fastify.authenticate] }, async (request, reply) => {
    try {
      const { cards_to_place, discard_positions } = placePendingCardsSchema.parse(request.body);

      const gameState = await placePendingCards(
        request.user.id,
        cards_to_place,
        discard_positions
      );

      // Log action
      await logGameAction(request.user.id, 'place_pending_cards', {
        cards_to_place,
        discard_positions,
      });

      const deckComposition = getDeckComposition(gameState);

      return reply.send({
        hand: gameState.hand,
        game_size: gameState.gameSize,
        deck_size: gameState.deck.length,
        deck_composition: deckComposition,
      });
    } catch (error) {
      if (error.name === 'ZodError') {
        return reply.code(400).send({ error: error.errors });
      }
      fastify.log.error(error);
      return reply.code(400).send({ error: error.message });
    }
  });

  // Get deck info
  fastify.get('/api/game/deck', { onRequest: [fastify.authenticate] }, async (request, reply) => {
    try {
      const gameState = await getOrCreateGameState(request.user.id);
      const deckComposition = getDeckComposition(gameState);

      return reply.send({
        deck_size: gameState.deck.length,
        deck_composition: deckComposition,
        discard_pile_size: gameState.discardPile.length,
        game_size: gameState.gameSize,
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });
}
