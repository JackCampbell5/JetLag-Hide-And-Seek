import React, { useState, useEffect } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { useGame } from "../../context/GameContext";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { useIsMobile } from "../../hooks/useMediaQuery";
import { stats } from "../../api/client";
import Hand from "./Hand";
import Card from "./Card";
import CardSelectionModal from "./CardSelectionModal";
import CardDetailModal from "./CardDetailModal";
import CurseDisplayModal from "./CurseDisplayModal";
import ResetConfirmationModal from "./ResetConfirmationModal";
import GameSizeSelector from "./GameSizeSelector";

const QuestionTypes = {
  MATCHING: { draw: 3, pick: 1, label: "Matching" },
  MEASURING: { draw: 3, pick: 1, label: "Measuring" },
  THERMOMETER: { draw: 2, pick: 1, label: "Thermometer" },
  RADAR: { draw: 2, pick: 1, label: "Radar" },
  TENTACLES: { draw: 4, pick: 2, label: "Tentacles" },
  PHOTOS: { draw: 1, pick: 1, label: "Photos" },
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
  const { theme, isDarkMode, toggleTheme } = useTheme();
  const isMobile = useIsMobile();
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
  const [showCurseModal, setShowCurseModal] = useState(false);
  const [curseData, setCurseData] = useState(null);
  const [curseContext, setCurseContext] = useState(null);
  const [showResetModal, setShowResetModal] = useState(false);
  const [userStats, setUserStats] = useState({
    total_cards_drawn: 0,
    total_cards_played: 0,
    games_completed: 0,
  });
  const gameSizeConvert = { 3: "Small", 4: "Medium", 5: "Large" };

  // Fetch user statistics on component mount
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await stats.getUserStats();
        setUserStats(response.data);
      } catch (err) {
        console.error("Failed to fetch user statistics:", err);
      }
    };
    fetchStats();
  }, []);

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

      // Refresh statistics after drawing cards
      const statsResponse = await stats.getUserStats();
      setUserStats(statsResponse.data);
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

      if (card && card.Type === "Curse") {
        // Handle curse card
        const castingCost = card.casting_cost || {};
        const discardCount = castingCost.discard || 0;

        if (discardCount > 0) {
          // Open discard selection modal first
          setDiscardContext({
            playedPosition: position,
            requiredCount: discardCount,
            isCurse: true, // Flag to show curse modal after
          });
          setSelectedDiscardPositions([]);
          setShowDiscardModal(true);
        } else {
          // No discard required - show curse modal first, play on confirmation
          setCurseData(card);
          setCurseContext({ position });
          setShowCurseModal(true);
        }
      } else if (card && card.name === "Duplicate") {
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

        // Refresh statistics after playing card
        const statsResponse = await stats.getUserStats();
        setUserStats(statsResponse.data);
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
        setShowDiscardModal(false);

        // If this was a curse card, show the curse modal before playing
        if (discardContext.isCurse) {
          const card = gameState.hand[discardContext.playedPosition];
          setCurseData(card);
          setCurseContext({
            position: discardContext.playedPosition,
            discardPositions: selectedDiscardPositions,
          });
          setShowCurseModal(true);
        } else {
          // Not a curse, play immediately
          await playCard(
            discardContext.playedPosition,
            selectedDiscardPositions,
          );

          // Refresh statistics after playing card
          const statsResponse = await stats.getUserStats();
          setUserStats(statsResponse.data);
        }
        // Note: If this was a "Discard X Draw Y" card, the drawn cards are already
        // set in GameContext by playCard, so no need to do anything here

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

  const handleConfirmCurse = async () => {
    try {
      if (curseContext) {
        await playCard(
          curseContext.position,
          curseContext.discardPositions || null,
        );

        // Refresh statistics after playing curse card
        const statsResponse = await stats.getUserStats();
        setUserStats(statsResponse.data);

        setShowCurseModal(false);
        setCurseContext(null);
        setCurseData(null);
        setDiscardContext(null);
        setSelectedDiscardPositions([]);
      }
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to play curse card");
      setShowCurseModal(false);
    }
  };

  const handleCancelCurse = () => {
    setShowCurseModal(false);
    setCurseContext(null);
    setCurseData(null);
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
      // Pass false for clearDrawn to preserve drawn cards when manually discarding
      await updateHand(newHand, [], false);
    } catch (err) {
      setError("Failed to discard card");
    }
  };

  const handleResetClick = () => {
    setShowResetModal(true);
  };

  const handleCancelReset = () => {
    setShowResetModal(false);
  };

  const handleConfirmReset = async () => {
    try {
      setError("");
      await stats.resetProgress();

      // Refresh game state and statistics
      const statsResponse = await stats.getUserStats();
      setUserStats(statsResponse.data);

      // Reload the page to reset the game state in the context
      window.location.reload();
    } catch (err) {
      setError("Failed to reset progress");
      setShowResetModal(false);
    }
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div style={styles.container(theme)}>
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

        <CurseDisplayModal
          isOpen={showCurseModal}
          curseData={curseData}
          gameSize={gameSize}
          onClose={handleCancelCurse}
          onConfirm={handleConfirmCurse}
        />

        <ResetConfirmationModal
          isOpen={showResetModal}
          onClose={handleCancelReset}
          onConfirm={handleConfirmReset}
        />

        <div
          style={{
            ...styles.header(theme),
            ...(isMobile ? styles.headerMobile : {}),
          }}
        >
          <h1
            style={{
              ...(isMobile ? styles.titleMobile : {}),
              color: theme.colors.text,
            }}
          >
            JetLag (Unofficial) Card Game
          </h1>
          <div
            style={{
              ...styles.headerRight,
              ...(isMobile ? styles.headerRightMobile : {}),
            }}
          >
            <button
              onClick={toggleTheme}
              style={{
                ...styles.themeToggle,
                ...(isMobile ? { order: -1 } : {}),
              }}
              title={
                isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"
              }
            >
              {isDarkMode ? "☀️" : "🌙"}
            </button>
            <GameSizeSelector
              gameSize={gameSize}
              onGameSizeChange={updateGameSize}
              compact={true}
            />
            <span
              style={{
                ...styles.welcomeText(theme),
                ...(isMobile
                  ? { whiteSpace: "normal", textAlign: "center" }
                  : {}),
              }}
            >
              Welcome, {user?.username}!
            </span>
            <button
              onClick={logout}
              style={{
                ...styles.logoutButton(theme),
                ...(isMobile ? { width: "100%" } : {}),
              }}
            >
              Logout
            </button>
          </div>
        </div>

        <div style={styles.questionTypes(theme)}>
          <h3
            style={{
              ...(isMobile ? styles.questionTypesHeaderMobile : {}),
              color: theme.colors.text,
            }}
          >
            Select Question Type:
          </h3>

          {isMobile ? (
            // Mobile: Dropdown
            <select
              value={currentQuestionType || ""}
              onChange={(e) => {
                const type = e.target.value;
                if (type) handleDrawCards(type);
              }}
              style={styles.questionTypeSelect(theme)}
            >
              <option value="">-- Select Type --</option>
              {Object.entries(QuestionTypes).map(([type, config]) => (
                <option key={type} value={type}>
                  {config.label} (Draw {config.draw}, Pick {config.pick})
                </option>
              ))}
            </select>
          ) : (
            // Desktop: Button Grid
            <div style={styles.buttonGrid}>
              {Object.entries(QuestionTypes).map(([type, config]) => (
                <button
                  key={type}
                  onClick={() => handleDrawCards(type)}
                  style={{
                    ...styles.questionButton(theme),
                    ...(currentQuestionType === type
                      ? styles.questionButtonActive(theme)
                      : {}),
                  }}
                >
                  {config.label}
                  <br />
                  <small>
                    Draw {config.draw}, Pick {config.pick}
                  </small>
                </button>
              ))}
            </div>
          )}
        </div>

        {drawnCards.length > 0 && (
          <div style={styles.drawnCards(theme)}>
            <h3 style={{ color: theme.colors.text }}>
              Drawn Cards (Select {pickCount}):
            </h3>
            <div style={styles.cardGrid}>
              {drawnCards.map((card, idx) => (
                <div
                  key={idx}
                  onClick={() => handleSelectCard(card)}
                  style={{
                    ...styles.selectableCard(theme),
                    border: selectedCards.includes(card)
                      ? `3px solid ${theme.colors.borderActive}`
                      : `2px solid ${theme.colors.borderDefault}`,
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
            <button onClick={handleAddToHand} style={styles.addButton(theme)}>
              {pickCount === 0 ? "Done" : "Add Selected to Hand"}
            </button>
          </div>
        )}
        {error && <div style={styles.error(theme)}>{error}</div>}

        <Hand
          hand={gameState.hand}
          onUpdateHand={updateHand}
          onPlayCard={handlePlayCard}
          onDiscardCard={handleDiscardCard}
          highlightedPositions={highlightedPositions}
          gameSize={gameSize}
          onCardClick={handleCardClick}
        />

        <div style={styles.deckInfo(theme)}>
          <h3 style={{ color: theme.colors.text }}>Deck Info</h3>
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
          <p>Total Cards Drawn: {userStats.total_cards_drawn}</p>
          <p>Total Cards Played: {userStats.total_cards_played}</p>
          <button onClick={handleResetClick} style={styles.resetButton(theme)}>
            Reset Progress
          </button>
        </div>
      </div>
    </DndProvider>
  );
};

const styles = {
  container: (theme) => ({
    padding: "20px",
    maxWidth: "1200px",
    margin: "0 auto",
    backgroundColor: theme.colors.background,
    minHeight: "100vh",
  }),
  header: (theme) => ({
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
    padding: "10px",
    backgroundColor: theme.colors.header,
    borderRadius: "8px",
    flexWrap: "wrap",
    gap: "10px",
    border: `1px solid ${theme.colors.border}`,
  }),
  headerMobile: {
    flexDirection: "column",
    alignItems: "stretch",
    gap: "15px",
  },
  titleMobile: {
    fontSize: "20px",
    textAlign: "center",
    margin: "0",
  },
  headerRight: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
    flexWrap: "wrap",
  },
  headerRightMobile: {
    flexDirection: "column",
    alignItems: "stretch",
    gap: "10px",
  },
  themeToggle: {
    padding: "8px 12px",
    backgroundColor: "transparent",
    border: "2px solid currentColor",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "18px",
    transition: "all 0.2s ease",
  },
  welcomeText: (theme) => ({
    whiteSpace: "nowrap",
    color: theme.colors.text,
  }),
  logoutButton: (theme) => ({
    padding: "8px 16px",
    backgroundColor: theme.colors.danger,
    color: theme.colors.text,
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    transition: "background-color 0.2s ease",
  }),
  error: (theme) => ({
    backgroundColor: theme.colors.danger,
    color: theme.colors.text,
    padding: "10px",
    borderRadius: "4px",
    marginBottom: "20px",
    textAlign: "center",
  }),
  questionTypes: (theme) => ({
    marginBottom: "30px",
    padding: "20px",
    backgroundColor: theme.colors.backgroundAlt,
    borderRadius: "8px",
    border: `1px solid ${theme.colors.border}`,
  }),
  questionTypesHeaderMobile: {
    fontSize: "16px",
    marginBottom: "10px",
  },
  questionTypeSelect: (theme) => ({
    width: "100%",
    padding: "12px",
    fontSize: "16px",
    backgroundColor: theme.colors.secondary,
    color: theme.colors.text,
    border: `2px solid ${theme.colors.secondaryDark}`,
    borderRadius: "4px",
    cursor: "pointer",
    fontWeight: "bold",
  }),
  buttonGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
    gap: "10px",
    marginTop: "10px",
  },
  questionButton: (theme) => ({
    padding: "15px",
    backgroundColor: theme.colors.secondary,
    color: theme.colors.text,
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "bold",
    transition: "all 0.2s ease",
  }),
  questionButtonActive: (theme) => ({
    backgroundColor: theme.colors.secondaryDark,
    border: `3px solid ${theme.colors.borderActive}`,
    boxShadow: `0 0 10px ${theme.colors.highlight}`,
  }),
  drawnCards: (theme) => ({
    marginBottom: "30px",
    padding: "20px",
    backgroundColor: theme.colors.warning,
    borderRadius: "8px",
    border: `1px solid ${theme.colors.border}`,
  }),
  cardGrid: {
    display: "flex",
    gap: "10px",
    marginTop: "10px",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  selectableCard: (theme) => ({
    cursor: "pointer",
    borderRadius: "8px",
    transition: "border 0.2s ease",
  }),
  addButton: (theme) => ({
    marginTop: "15px",
    padding: "10px 20px",
    backgroundColor: theme.colors.primary,
    color: theme.colors.text,
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: "bold",
    display: "block",
    marginLeft: "auto",
    marginRight: "auto",
    transition: "background-color 0.2s ease",
  }),
  deckInfo: (theme) => ({
    marginTop: "30px",
    padding: "20px",
    backgroundColor: theme.colors.info,
    borderRadius: "8px",
    border: `1px solid ${theme.colors.border}`,
    color: theme.colors.text,
  }),
  resetButton: (theme) => ({
    marginTop: "15px",
    padding: "10px 20px",
    backgroundColor: theme.colors.danger,
    color: theme.colors.text,
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "bold",
    transition: "background-color 0.2s ease",
    width: "100%",
  }),
};

export default GameBoard;
