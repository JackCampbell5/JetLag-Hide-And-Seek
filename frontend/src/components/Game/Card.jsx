import React from "react";
import { useDrag } from "react-dnd";
import { getAllowedDifficulty } from "../../context/GameContext";

const Card = ({
  card,
  gameSize = 5,
  onPlay,
  canPlay = true,
  isDraggable = false,
  isHighlighted = false,
  onCardClick,
}) => {
  const [{ isDragging }, drag] = useDrag(
    () => ({
      type: "CARD",
      item: { card },
      canDrag: isDraggable,
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    }),
    [card, isDraggable],
  );

  if (!card) return null;

  // Get the allowed difficulty and its value
  const allowedDifficulty = getAllowedDifficulty(gameSize);
  const getDifficultyValue = () => {
    if (allowedDifficulty === "Small") return card.Small;
    if (allowedDifficulty === "Medium") return card.Medium;
    return card.Large; // 'Large'
  };
  const difficultyValue = getDifficultyValue();

  // Truncate description for card preview
  const getShortDescription = (desc) => {
    if (!desc) return "";
    const maxLength = 50;
    return desc.length > maxLength
      ? desc.substring(0, maxLength) + "..."
      : desc;
  };

  const colorMap = {
    Red: "#ff4444",
    Orange: "#ff8c00",
    Yellow: "#ffd700",
    Blue: "#4169e1",
    Green: "#32cd32",
    Purple: "#9370db",
    Pink: "#ff69b4",
    Gray: "#808080",
    Special: "#ff00ff",
  };

  // Action cards are colored purple
  const backgroundColor =
    card.Type === "Action" ? "#9370db" : colorMap[card.color] || "#ccc";

  return (
    <div
      ref={drag}
      style={{
        ...styles.card,
        backgroundColor,
        opacity: isDragging ? 0.5 : 1,
        cursor: isDraggable ? "move" : "default",
        border: isHighlighted ? "4px solid #FFD700" : "none",
        boxShadow: isHighlighted
          ? "0 0 20px rgba(255, 215, 0, 0.8), 0 2px 5px rgba(0,0,0,0.2)"
          : "0 2px 5px rgba(0,0,0,0.2)",
        animation: isHighlighted ? "pulse 1s ease-in-out infinite" : "none",
        position: "relative",
      }}
    >
      {onCardClick && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onCardClick(card);
          }}
          style={styles.menuButton}
          aria-label="Card menu"
        >
          ⋮
        </button>
      )}
      <div style={styles.cardHeader}>
        <strong>{card.name || card.Type}</strong>
      </div>
      <div style={styles.cardBody}>
        {card.color && <div style={styles.cardColor}>{card.color}</div>}
        {difficultyValue > 0 && (
          <div style={styles.cardValues}>
            <span>
              {allowedDifficulty[0]}: {difficultyValue}
            </span>
          </div>
        )}
        {card.description && (
          <div style={styles.cardDescription}>
            {getShortDescription(card.description)}
          </div>
        )}
      </div>
      {canPlay && onPlay && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onPlay();
          }}
          style={styles.playButton}
        >
          Play
        </button>
      )}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onPlay();
        }}
        style={styles.playButton}
      >
        Discard
      </button>
    </div>
  );
};

const styles = {
  card: {
    width: "120px",
    minHeight: "160px",
    borderRadius: "8px",
    padding: "10px",
    color: "white",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
    margin: "5px",
  },
  cardHeader: {
    fontSize: "14px",
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: "10px",
  },
  cardBody: {
    flex: 1,
  },
  cardColor: {
    fontSize: "12px",
    marginBottom: "10px",
    textAlign: "center",
  },
  cardValues: {
    display: "flex",
    flexDirection: "column",
    fontSize: "12px",
    gap: "5px",
  },
  cardDescription: {
    fontSize: "11px",
    marginTop: "8px",
    lineHeight: "1.4",
    fontStyle: "italic",
    opacity: 0.95,
  },
  playButton: {
    padding: "5px 10px",
    backgroundColor: "rgba(255,255,255,0.3)",
    border: "1px solid white",
    borderRadius: "4px",
    color: "white",
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: "bold",
  },
  menuButton: {
    position: "absolute",
    top: "5px",
    right: "5px",
    width: "24px",
    height: "24px",
    padding: "0",
    backgroundColor: "rgba(255,255,255,0.3)",
    border: "1px solid rgba(255,255,255,0.5)",
    borderRadius: "50%",
    color: "white",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: "bold",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    lineHeight: "1",
    transition: "all 0.2s ease",
    zIndex: 10,
  },
};

export default Card;
