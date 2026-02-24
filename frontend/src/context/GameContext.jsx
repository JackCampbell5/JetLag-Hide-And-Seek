import React, { createContext, useContext, useState, useEffect } from 'react';
import { game as gameAPI } from '../api/client';
import { useAuth } from './AuthContext';

const GameContext = createContext(null);

// Helper function to get allowed difficulty based on game size
export const getAllowedDifficulty = (gameSize) => {
  if (gameSize === 3) return 'Small';
  if (gameSize === 4) return 'Medium';
  return 'Large'; // gameSize === 5
};

export const GameProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [gameSize, setGameSize] = useState(() => {
    // Load from localStorage or default to 5
    const saved = localStorage.getItem('gameSize');
    return saved ? Number(saved) : 5;
  });
  const [gameState, setGameState] = useState({
    hand: [],
    deck_size: 0,
    deck_composition: {},
  });
  const [loading, setLoading] = useState(false);
  const [drawnCards, setDrawnCards] = useState([]);
  const [pickCount, setPickCount] = useState(0);
  const [highlightedPositions, setHighlightedPositions] = useState([]);

  const loadGameState = async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const response = await gameAPI.getState();
      const backendGameSize = response.data.game_size;
      const localGameSize = gameSize;

      // If backend game size differs from local preference, update backend
      if (backendGameSize !== localGameSize) {
        try {
          const updateResponse = await gameAPI.updateGameSize(localGameSize);
          setGameState(updateResponse.data);
          setGameSize(updateResponse.data.game_size);
        } catch (err) {
          console.error('Failed to sync game size:', err);
          // If update fails, use backend size
          setGameState(response.data);
          setGameSize(backendGameSize);
          localStorage.setItem('gameSize', backendGameSize.toString());
        }
      } else {
        setGameState(response.data);
        setGameSize(backendGameSize);
      }
    } catch (error) {
      console.error('Failed to load game state:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGameState();
  }, [isAuthenticated]);

  const drawCards = async (questionType) => {
    setLoading(true);
    try {
      const response = await gameAPI.drawCards(questionType);
      setDrawnCards(response.data.cards);
      setPickCount(response.data.pick_count);
      return response.data;
    } catch (error) {
      // Attach deck_exhausted flag so callers can show a specific message
      if (error.response?.data?.deck_exhausted) {
        const deckError = new Error(error.response.data.error);
        deckError.deck_exhausted = true;
        throw deckError;
      }
      console.error('Failed to draw cards:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateHand = async (newHand, positionsToHighlight = [], clearDrawn = true) => {
    setLoading(true);
    try {
      const response = await gameAPI.updateHand(newHand);
      setGameState(response.data);

      // Only clear drawn cards if explicitly requested (default true for backward compatibility)
      if (clearDrawn) {
        setDrawnCards([]);
        setPickCount(0);
      }

      // Highlight newly added card positions if provided
      if (positionsToHighlight.length > 0) {
        setHighlightedPositions(positionsToHighlight);

        // Clear highlight after 5 seconds
        setTimeout(() => {
          setHighlightedPositions([]);
        }, 5000);
      }
    } catch (error) {
      console.error('Failed to update hand:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const playCard = async (handPosition, discardPositions = null) => {
    setLoading(true);
    try {
      const response = await gameAPI.playCard(handPosition, discardPositions);
      const newHand = response.data.hand;
      const deckSize = response.data.deck_size;
      const deckComposition = response.data.deck_composition;
      setGameState((prev) => ({
        ...prev,
        hand: newHand,
        deck_size: deckSize,
        deck_composition: deckComposition
      }));

      // If curse card was played, return curse data
      if (response.data.curse_data) {
        return { curse_data: response.data.curse_data };
      }

      // If special card, return drawn cards
      if (response.data.drawn_cards) {
        const drawnCardsList = response.data.drawn_cards;
        setDrawnCards(drawnCardsList);
        setPickCount(drawnCardsList.length);

        // If cards were auto-placed, highlight the positions where they were placed
        if (response.data.auto_placed && response.data.placed_positions) {
          setHighlightedPositions(response.data.placed_positions);

          // Clear highlight after 5 seconds
          setTimeout(() => {
            setHighlightedPositions([]);
          }, 5000);
        }

        return drawnCardsList;
      }
      return null;
    } catch (error) {
      console.error('Failed to play card:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const clearDrawnCards = () => {
    setDrawnCards([]);
    setPickCount(0);
  };

  const updateGameSize = async (newSize) => {
    // Validate game_size (difficulty level) is 3-5
    if (newSize < 3 || newSize > 5) {
      console.error('Game size must be between 3 and 5');
      return;
    }

    if (!isAuthenticated) {
      // Not logged in, just update local state
      setGameSize(newSize);
      localStorage.setItem('gameSize', newSize.toString());
      return;
    }

    setLoading(true);
    try {
      // Update backend
      const response = await gameAPI.updateGameSize(newSize);

      // Update local state with backend response
      setGameState(response.data);
      setGameSize(response.data.game_size);
      localStorage.setItem('gameSize', response.data.game_size.toString());
    } catch (error) {
      console.error('Failed to update game size:', error);
      // Revert to old size on error
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <GameContext.Provider
      value={{
        gameState,
        loading,
        drawnCards,
        pickCount,
        highlightedPositions,
        gameSize,
        loadGameState,
        drawCards,
        updateHand,
        playCard,
        clearDrawnCards,
        updateGameSize,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within GameProvider');
  }
  return context;
};
