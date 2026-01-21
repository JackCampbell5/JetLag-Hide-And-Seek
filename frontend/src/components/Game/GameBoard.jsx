import React, { useState } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { useGame } from "../../context/GameContext";
import { useAuth } from "../../context/AuthContext";
import Hand from "./Hand";
import Card from "./Card";
import CardSelectionModal from "./CardSelectionModal";
import CardDetailModal from "./CardDetailModal";
import GameSizeSelector from "./GameSizeSelector";

const QuestionTypes = {
  Matching: { draw: 3, pick: 1 },
  Measuring: { draw: 3, pick: 1 },
  Thermometer: { draw: 2, pick: 1 },
  Radar: { draw: 2, pick: 1 },
  Tentacles: { draw: 4, pick: 2 },
  Photos: { draw: 1, pick: 1 },
};

const GameBoard = () => {
  const { user, logout } = useAuth();
  const {
    gameState,
    drawnCards,
    drawCards,
    updateHand,
    playCard,
    highlightedPositions,
    gameSize,
    updateGameSize,
  } = useGame();
  const [selectedCards, setSelectedCards] = useState([]);
  const [error, setError] = useState("");
  const [pickCount, setPickCount] = useState(0);
  const [showDiscardModal, setShowDiscardModal] = useState(false);
  const [discardContext, setDiscardContext] = useState(null);
  const [selectedDiscardPositions, setSelectedDiscardPositions] = useState([]);
  const [currentQuestionType, setCurrentQuestionType] = useState(null);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [duplicateContext, setDuplicateContext] = useState(null);
  const [selectedDuplicatePosition, setSelectedDuplicatePosition] =
    useState(null);
  const [showCardDetail, setShowCardDetail] = useState(false);
  const [selectedCardDetail, setSelectedCardDetail] = useState(null);
  const gameSizeConvert = { 3: "Small", 4: "Medium", 5: "Large" };

  const handleDrawCards = async (questionType) => {
    // If cards are already drawn
    if (drawnCards.length > 0) {
      const newDrawCount = QuestionTypes[questionType].draw;
      const currentDrawCount = drawnCards.length;

      // If same question type, ignore the click
      if (questionType === currentQuestionType) {
        return;
      }

      // If new type needs same number of cards, ignore the click
      if (newDrawCount === currentDrawCount) {
        return;
      }

      // If new type needs different number of cards (more or fewer), draw new cards
    }

    // Draw new cards (first draw, expanding, or reducing)
    try {
      setError("");
      const result = await drawCards(questionType);
      setPickCount(result.pick_count);
      setSelectedCards([]);
      setCurrentQuestionType(questionType);
    } catch (err) {
      setError("Failed to draw cards");
    }
  };

  const handleSelectCard = (card) => {
    if (selectedCards.includes(card)) {
      setSelectedCards(selectedCards.filter((c) => c !== card));
    } else if (selectedCards.length < pickCount) {
      setSelectedCards([...selectedCards, card]);
    }
  };

  const handleAddToHand = async () => {
    if (selectedCards.length !== pickCount && pickCount > 0) {
      setError(`Please select exactly ${pickCount} card(s)`);
      return;
    }

    try {
      // Find empty slots and place selected cards
      const newHand = [...gameState.hand];
      let cardIndex = 0;
      const placedPositions = [];

      for (
        let i = 0;
        i < newHand.length && cardIndex < selectedCards.length;
        i++
      ) {
        if (!newHand[i]) {
          newHand[i] = selectedCards[cardIndex];
          placedPositions.push(i);
          cardIndex++;
        }
      }

      if (cardIndex < selectedCards.length) {
        setError("Not enough space in hand");
        return;
      }

      await updateHand(newHand, placedPositions);
      setSelectedCards([]);
      setPickCount(0);
      setCurrentQuestionType(null);
      setError("");
    } catch (err) {
      setError("Failed to update hand");
    }
  };

  const handlePlayCard = async (position) => {
    try {
      setError("");
      const card = gameState.hand[position];

      if (card && card.name === "Duplicate") {
        // Open modal to select a card to duplicate
        setDuplicateContext({
          playedPosition: position,
        });
        setSelectedDuplicatePosition(null);
        setShowDuplicateModal(true);
      } else if (
        card &&
        (card.name === "Discard 1 Draw 2" || card.name === "Discard 2 Draw 3")
      ) {
        const discardCount = card.name === "Discard 1 Draw 2" ? 1 : 2;

        // Open modal for card selection
        setDiscardContext({
          playedPosition: position,
          requiredCount: discardCount,
        });
        setSelectedDiscardPositions([]);
        setShowDiscardModal(true);
      } else {
        await playCard(position);
      }
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to play card");
    }
  };

  const handleConfirmDiscard = async () => {
    try {
      if (
        discardContext &&
        selectedDiscardPositions.length === discardContext.requiredCount
      ) {
        await playCard(discardContext.playedPosition, selectedDiscardPositions);
        setShowDiscardModal(false);
        setDiscardContext(null);
        setSelectedDiscardPositions([]);
      }
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to play card");
      setShowDiscardModal(false);
    }
  };

  const handleCancelDiscard = () => {
    setShowDiscardModal(false);
    setDiscardContext(null);
    setSelectedDiscardPositions([]);
  };

  const handleConfirmDuplicate = async () => {
    try {
      if (duplicateContext && selectedDuplicatePosition !== null) {
        const cardToDuplicate = gameState.hand[selectedDuplicatePosition];

        // Create new hand with duplicated card replacing the Duplicate card
        const newHand = [...gameState.hand];
        newHand[duplicateContext.playedPosition] = cardToDuplicate;

        // Play the Duplicate card (which removes it) and update hand with duplicated card
        await playCard(duplicateContext.playedPosition);
        await updateHand(newHand, [duplicateContext.playedPosition]);

        setShowDuplicateModal(false);
        setDuplicateContext(null);
        setSelectedDuplicatePosition(null);
      }
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to duplicate card");
      setShowDuplicateModal(false);
    }
  };

  const handleCancelDuplicate = () => {
    setShowDuplicateModal(false);
    setDuplicateContext(null);
    setSelectedDuplicatePosition(null);
  };

  const handleCardClick = (card) => {
    setSelectedCardDetail(card);
    setShowCardDetail(true);
  };

  const handleCloseCardDetail = () => {
    setShowCardDetail(false);
    setSelectedCardDetail(null);
  };

  const handleDiscardCard = async (position) => {
    try {
      setError("");
      // Simply remove the card from the hand without any side effects
      const newHand = [...gameState.hand];
      newHand[position] = null;
      await updateHand(newHand);
    } catch (err) {
      setError("Failed to discard card");
    }
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div style={styles.container}>
        <CardSelectionModal
          isOpen={showDiscardModal}
          hand={gameState.hand}
          playedPosition={discardContext?.playedPosition}
          requiredCount={discardContext?.requiredCount || 0}
          selectedPositions={selectedDiscardPositions}
          onSelectPosition={setSelectedDiscardPositions}
          onConfirm={handleConfirmDiscard}
          onCancel={handleCancelDiscard}
        />

        <CardSelectionModal
          isOpen={showDuplicateModal}
          hand={gameState.hand}
          playedPosition={duplicateContext?.playedPosition}
          requiredCount={1}
          selectedPositions={
            selectedDuplicatePosition !== null
              ? [selectedDuplicatePosition]
              : []
          }
          onSelectPosition={(positions) =>
            setSelectedDuplicatePosition(positions[0] ?? null)
          }
          onConfirm={handleConfirmDuplicate}
          onCancel={handleCancelDuplicate}
          title="Select a Card to Duplicate"
          confirmText="Duplicate Card"
        />

        <CardDetailModal
          isOpen={showCardDetail}
          card={selectedCardDetail}
          gameSize={gameSize}
          onClose={handleCloseCardDetail}
        />

        <div style={styles.header}>
          <h1>JetLag Card Game</h1>
          <div style={styles.headerRight}>
            <GameSizeSelector
              gameSize={gameSize}
              onGameSizeChange={updateGameSize}
              compact={true}
            />
            <span style={styles.welcomeText}>Welcome, {user?.username}!</span>
            <button onClick={logout} style={styles.logoutButton}>
              Logout
            </button>
          </div>
        </div>

        {error && <div style={styles.error}>{error}</div>}

        <div style={styles.questionTypes}>
          <h3>Select Question Type:</h3>
          <div style={styles.buttonGrid}>
            {Object.entries(QuestionTypes).map(([type, config]) => (
              <button
                key={type}
                onClick={() => handleDrawCards(type)}
                style={{
                  ...styles.questionButton,
                  ...(currentQuestionType === type
                    ? styles.questionButtonActive
                    : {}),
                }}
              >
                {type}
                <br />
                <small>
                  Draw {config.draw}, Pick {config.pick}
                </small>
              </button>
            ))}
          </div>
        </div>

        {drawnCards.length > 0 && (
          <div style={styles.drawnCards}>
            <h3>Drawn Cards (Select {pickCount}):</h3>
            <div style={styles.cardGrid}>
              {drawnCards.map((card, idx) => (
                <div
                  key={idx}
                  onClick={() => handleSelectCard(card)}
                  style={{
                    ...styles.selectableCard,
                    border: selectedCards.includes(card)
                      ? "3px solid #4CAF50"
                      : "2px solid #ccc",
                  }}
                >
                  <Card
                    card={card}
                    gameSize={gameSize}
                    canPlay={false}
                    onCardClick={handleCardClick}
                  />
                </div>
              ))}
            </div>
            <button onClick={handleAddToHand} style={styles.addButton}>
              {pickCount === 0 ? "Done" : "Add Selected to Hand"}
            </button>
          </div>
        )}

        <Hand
          hand={gameState.hand}
          onUpdateHand={updateHand}
          onPlayCard={handlePlayCard}
          onDiscardCard={handleDiscardCard}
          highlightedPositions={highlightedPositions}
          gameSize={gameSize}
          onCardClick={handleCardClick}
        />

        <div style={styles.deckInfo}>
          <h3>Deck Info</h3>
          <p>
            Deck Size:{" "}
            {gameState.hand.reduce(
              (count, card) => (card ? count + 1 : count),
              0,
            )}{" "}
          </p>
          <p>
            Current Time Bonus:{" "}
            {gameState.hand
              ?.filter((card) => card && card.Type === "Time Bonus")
              .reduce(
                (sum, card) => sum + (card[gameSizeConvert[gameSize]] ?? 0),
                0,
              )}{" "}
          </p>
        </div>
      </div>
    </DndProvider>
  );
};

const styles = {
  container: {
    padding: "20px",
    maxWidth: "1200px",
    margin: "0 auto",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
    padding: "10px",
    backgroundColor: "#f5f5f5",
    borderRadius: "8px",
  },
  headerRight: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
  },
  welcomeText: {
    whiteSpace: "nowrap",
  },
  logoutButton: {
    padding: "8px 16px",
    backgroundColor: "#f44336",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
  error: {
    backgroundColor: "#f44336",
    color: "white",
    padding: "10px",
    borderRadius: "4px",
    marginBottom: "20px",
    textAlign: "center",
  },
  questionTypes: {
    marginBottom: "30px",
    padding: "20px",
    backgroundColor: "#f9f9f9",
    borderRadius: "8px",
  },
  buttonGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
    gap: "10px",
    marginTop: "10px",
  },
  questionButton: {
    padding: "15px",
    backgroundColor: "#2196F3",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "bold",
  },
  questionButtonActive: {
    backgroundColor: "#1976D2",
    border: "3px solid #4CAF50",
    boxShadow: "0 0 10px rgba(76, 175, 80, 0.5)",
  },
  drawnCards: {
    marginBottom: "30px",
    padding: "20px",
    backgroundColor: "#fff3cd",
    borderRadius: "8px",
  },
  cardGrid: {
    display: "flex",
    gap: "10px",
    marginTop: "10px",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  selectableCard: {
    cursor: "pointer",
    borderRadius: "8px",
    transition: "border 0.2s",
  },
  addButton: {
    marginTop: "15px",
    padding: "10px 20px",
    backgroundColor: "#4CAF50",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: "bold",
    display: "block",
    marginLeft: "auto",
    marginRight: "auto",
  },
  deckInfo: {
    marginTop: "30px",
    padding: "20px",
    backgroundColor: "#e3f2fd",
    borderRadius: "8px",
  },
};

export default GameBoard;
