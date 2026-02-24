import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let cardsData = null;

export function loadCards() {
  if (!cardsData) {
    const cardsPath = join(__dirname, '..', 'cards.json');
    cardsData = JSON.parse(readFileSync(cardsPath, 'utf-8'));
  }
  return cardsData;
}

export function getAllowedDifficulty(gameSize) {
  const difficultyMap = {
    3: 'Small',
    4: 'Medium',
    5: 'Large',
  };
  return difficultyMap[gameSize] || 'Large';
}

export function generateRandomCards(count, gameSize) {
  const cards = loadCards();
  const difficulty = getAllowedDifficulty(gameSize);

  // Filter cards that are valid for this difficulty
  const validCards = cards.filter(card => {
    // Action and Curse cards are always included
    if (card.Type === 'Action' || card.Type === 'Curse') {
      return true;
    }
    // Time Bonus cards need a value > 0 for this difficulty
    return card[difficulty] > 0;
  });

  // Create weighted pool based on card.cards frequency
  const weightedPool = [];
  validCards.forEach(card => {
    for (let i = 0; i < card.cards; i++) {
      weightedPool.push(card);
    }
  });

  // Sample random cards with replacement
  const drawnCards = [];
  for (let i = 0; i < count; i++) {
    const randomIndex = Math.floor(Math.random() * weightedPool.length);
    drawnCards.push({ ...weightedPool[randomIndex] });
  }

  return drawnCards;
}

// Build a full shuffled deck based on game size
export function buildDeck(gameSize) {
  const cards = loadCards();
  const difficulty = getAllowedDifficulty(gameSize);
  const deck = [];

  for (const card of cards) {
    const isValid =
      card.Type === 'Action' ||
      card.Type === 'Curse' ||
      card[difficulty] > 0;

    if (isValid) {
      for (let i = 0; i < card.cards; i++) {
        deck.push({ ...card });
      }
    }
  }

  // Shuffle the deck
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }

  return deck;
}

// Draw cards from deck for a question type draw.
// Clears any previously pending cards (returns them to pool),
// then marks `count` new cards as pending.
export function drawFromDeck(deck, count) {
  // Clear existing pending markers so previous unconfirmed draws return to pool
  const cleanDeck = deck.map(card => {
    if (card._pending) {
      const { _pending, ...rest } = card;
      return rest;
    }
    return card;
  });

  if (cleanDeck.length < count) {
    const error = new Error('Deck exhausted. Reset is required to continue drawing.');
    error.code = 'DECK_EXHAUSTED';
    throw error;
  }

  // Shuffle indices and pick `count` distinct ones
  const indices = Array.from({ length: cleanDeck.length }, (_, i) => i);
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  const pickedSet = new Set(indices.slice(0, count));

  const updatedDeck = cleanDeck.map((card, idx) =>
    pickedSet.has(idx) ? { ...card, _pending: true } : card
  );

  const drawn = [...pickedSet].map(idx => {
    const { _pending, ...cardWithoutPending } = updatedDeck[idx];
    return cardWithoutPending;
  });

  return { drawn, updatedDeck };
}

// Immediately consume `count` cards from the deck (for Discard X Draw Y).
// Removes them from the deck permanently without a pending step.
export function consumeFromDeck(deck, count) {
  // Clear any pending markers first
  const cleanDeck = deck.map(card => {
    if (card._pending) {
      const { _pending, ...rest } = card;
      return rest;
    }
    return card;
  });

  if (cleanDeck.length < count) {
    const error = new Error('Deck exhausted. Reset is required to continue drawing.');
    error.code = 'DECK_EXHAUSTED';
    throw error;
  }

  // Shuffle and pick
  const indices = Array.from({ length: cleanDeck.length }, (_, i) => i);
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  const pickedSet = new Set(indices.slice(0, count));

  const drawn = [...pickedSet].map(idx => cleanDeck[idx]);
  const updatedDeck = cleanDeck.filter((_, idx) => !pickedSet.has(idx));

  return { drawn, updatedDeck };
}

export function getDrawCount(questionType) {
  const drawMap = {
    MATCHING: { draw: 3, pick: 1 },
    MEASURING: { draw: 3, pick: 1 },
    THERMOMETER: { draw: 2, pick: 1 },
    RADAR: { draw: 2, pick: 1 },
    TENTACLES: { draw: 4, pick: 2 },
    PHOTOS: { draw: 1, pick: 1 },
  };
  return drawMap[questionType] || { draw: 3, pick: 1 };
}
