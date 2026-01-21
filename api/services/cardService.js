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
