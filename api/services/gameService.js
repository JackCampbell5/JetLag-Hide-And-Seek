import { PrismaClient } from '@prisma/client';
import { generateRandomCards, getAllowedDifficulty } from './cardService.js';

const prisma = new PrismaClient();

export async function getOrCreateGameState(userId, gameSize = 5) {
  let gameState = await prisma.userGameState.findUnique({
    where: { userId },
  });

  if (!gameState) {
    // Initialize empty hand with 5 null positions
    gameState = await prisma.userGameState.create({
      data: {
        userId,
        hand: [null, null, null, null, null],
        gameSize,
        deck: [],
        discardPile: [],
      },
    });
  }

  return gameState;
}

export async function updateUserHand(userId, newHand) {
  if (!Array.isArray(newHand) || newHand.length !== 5) {
    throw new Error('Hand must be an array of exactly 5 positions');
  }

  return await prisma.userGameState.update({
    where: { userId },
    data: { hand: newHand },
  });
}

export async function updateGameSize(userId, newGameSize) {
  if (newGameSize < 3 || newGameSize > 5) {
    throw new Error('Game size must be between 3 and 5');
  }

  return await prisma.userGameState.update({
    where: { userId },
    data: { gameSize: newGameSize },
  });
}

export async function playCardFromHand(userId, handPosition, discardPositions = null) {
  const gameState = await prisma.userGameState.findUnique({
    where: { userId },
  });

  if (!gameState) {
    throw new Error('Game state not found');
  }

  const hand = gameState.hand;
  if (handPosition < 0 || handPosition >= 5) {
    throw new Error('Invalid hand position');
  }

  const card = hand[handPosition];
  if (!card) {
    throw new Error('No card at this position');
  }

  let drawnCards = [];
  let autoPlaced = false;
  let placedPositions = [];
  let curseData = null;

  // Handle Curse cards
  if (card.Type === 'Curse') {
    const castingCost = card.casting_cost || {};
    const discardCost = castingCost.discard || 0;

    if (discardCost > 0) {
      if (!discardPositions || discardPositions.length !== discardCost) {
        throw new Error(`Must discard exactly ${discardCost} card(s) for this curse`);
      }

      // Validate discard positions
      for (const pos of discardPositions) {
        if (pos < 0 || pos >= 5 || pos === handPosition) {
          throw new Error('Invalid discard position');
        }
        if (!hand[pos]) {
          throw new Error(`No card at position ${pos} to discard`);
        }
      }

      // Move discarded cards to discard pile
      const discardPile = gameState.discardPile;
      for (const pos of discardPositions) {
        discardPile.push(hand[pos]);
        hand[pos] = null;
      }

      await prisma.userGameState.update({
        where: { userId },
        data: { discardPile },
      });
    }

    // Move curse to discard pile
    const discardPile = gameState.discardPile;
    discardPile.push(card);
    hand[handPosition] = null;

    curseData = {
      name: card.name,
      curse_text: card.curse_text,
      casting_cost: card.casting_cost,
    };

    await prisma.userGameState.update({
      where: { userId },
      data: { hand, discardPile },
    });
  }
  // Handle Discard X Draw Y cards
  else if (card.name === 'Discard 1 Draw 2') {
    const result = await handleDiscardDraw(
      userId,
      gameState,
      handPosition,
      discardPositions,
      1,
      2
    );
    drawnCards = result.drawnCards;
    autoPlaced = result.autoPlaced;
    placedPositions = result.placedPositions;
  } else if (card.name === 'Discard 2 Draw 3') {
    const result = await handleDiscardDraw(
      userId,
      gameState,
      handPosition,
      discardPositions,
      2,
      3
    );
    drawnCards = result.drawnCards;
    autoPlaced = result.autoPlaced;
    placedPositions = result.placedPositions;
  }
  // Regular cards (Time Bonus, Action)
  else {
    const discardPile = gameState.discardPile;
    discardPile.push(card);
    hand[handPosition] = null;

    await prisma.userGameState.update({
      where: { userId },
      data: { hand, discardPile },
    });
  }

  // Update statistics
  await updateStatistics(userId, { cardsPlayed: 1 });

  const updatedState = await prisma.userGameState.findUnique({
    where: { userId },
  });

  return {
    gameState: updatedState,
    drawnCards,
    autoPlaced,
    placedPositions,
    curseData,
  };
}

async function handleDiscardDraw(userId, gameState, playedPosition, discardPositions, discardCount, drawCount) {
  const hand = gameState.hand;

  // Validate discard count
  if (!discardPositions || discardPositions.length !== discardCount) {
    throw new Error(`Must discard exactly ${discardCount} card(s)`);
  }

  // Validate discard positions
  for (const pos of discardPositions) {
    if (pos < 0 || pos >= 5 || pos === playedPosition) {
      throw new Error('Invalid discard position');
    }
    if (!hand[pos]) {
      throw new Error(`No card at position ${pos} to discard`);
    }
  }

  // Move discarded cards to discard pile
  const discardPile = gameState.discardPile;

  // Add played card to discard
  discardPile.push(hand[playedPosition]);
  hand[playedPosition] = null;

  // Add discarded cards
  for (const pos of discardPositions) {
    discardPile.push(hand[pos]);
    hand[pos] = null;
  }

  // Draw new cards
  const drawnCards = generateRandomCards(drawCount, gameState.gameSize);

  // Try to auto-place cards
  const emptySlots = hand
    .map((card, idx) => (card === null ? idx : null))
    .filter(idx => idx !== null);

  let autoPlaced = false;
  let placedPositions = [];

  if (emptySlots.length >= drawnCards.length) {
    // Auto-place all drawn cards
    for (let i = 0; i < drawnCards.length; i++) {
      hand[emptySlots[i]] = drawnCards[i];
      placedPositions.push(emptySlots[i]);
    }
    autoPlaced = true;
  }

  await prisma.userGameState.update({
    where: { userId },
    data: { hand, discardPile },
  });

  return { drawnCards, autoPlaced, placedPositions };
}

export async function placePendingCards(userId, cardsToPlace, discardPositions) {
  const gameState = await prisma.userGameState.findUnique({
    where: { userId },
  });

  if (!gameState) {
    throw new Error('Game state not found');
  }

  const hand = gameState.hand;

  // Validate discard positions
  if (discardPositions.length !== cardsToPlace.length) {
    throw new Error('Must discard same number of cards as placing');
  }

  for (const pos of discardPositions) {
    if (pos < 0 || pos >= 5) {
      throw new Error('Invalid discard position');
    }
    if (!hand[pos]) {
      throw new Error(`No card at position ${pos} to discard`);
    }
  }

  // Discard cards
  const discardPile = gameState.discardPile;
  for (const pos of discardPositions) {
    discardPile.push(hand[pos]);
    hand[pos] = null;
  }

  // Place new cards
  const emptySlots = hand
    .map((card, idx) => (card === null ? idx : null))
    .filter(idx => idx !== null);

  for (let i = 0; i < cardsToPlace.length; i++) {
    if (emptySlots[i] !== undefined) {
      hand[emptySlots[i]] = cardsToPlace[i];
    }
  }

  return await prisma.userGameState.update({
    where: { userId },
    data: { hand, discardPile },
  });
}

export async function logGameAction(userId, actionType, actionData) {
  return await prisma.gameHistory.create({
    data: {
      userId,
      actionType,
      actionData,
    },
  });
}

export async function updateStatistics(userId, updates) {
  const stats = await prisma.userStatistics.findUnique({
    where: { userId },
  });

  if (!stats) {
    return await prisma.userStatistics.create({
      data: {
        userId,
        totalCardsDrawn: updates.cardsDrawn || 0,
        totalCardsPlayed: updates.cardsPlayed || 0,
        gamesCompleted: updates.gamesCompleted || 0,
      },
    });
  }

  return await prisma.userStatistics.update({
    where: { userId },
    data: {
      totalCardsDrawn: { increment: updates.cardsDrawn || 0 },
      totalCardsPlayed: { increment: updates.cardsPlayed || 0 },
      gamesCompleted: { increment: updates.gamesCompleted || 0 },
    },
  });
}

export function getDeckComposition(gameState) {
  const deck = gameState.deck || [];
  const composition = {};

  for (const card of deck) {
    const key = card.color ? `${card.Type} (${card.color})` : card.Type;
    composition[key] = (composition[key] || 0) + 1;
  }

  return composition;
}
