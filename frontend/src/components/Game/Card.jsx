import React from "react";
import { useDrag } from "react-dnd";
import { getAllowedDifficulty } from "../../context/GameContext";
import { useIsMobile } from "../../hooks/useMediaQuery";

const Card = ({
  card,
  gameSize = 5,
  onPlay,
  onDiscard,
  canPlay = true,
  isDraggable = false,
  isHighlighted = false,
  onCardClick,
  position,
}) => {
  const isMobile = useIsMobile();
  const [{ isDragging }, drag] = useDrag(
    () => ({
      type: "CARD",
      item: { card, sourcePosition: position },
      canDrag: isDraggable,
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    }),
    [card, isDraggable, position],
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
    Curse: "#8B008B", // Dark magenta for curse cards
  };

  // Casting cost summary helper
  const getCastingCostSummary = (castingCost) => {
    if (!castingCost) return null;
    const parts = [];
    if (castingCost.discard > 0) parts.push(`Discard ${castingCost.discard}`);
    if (castingCost.photo) parts.push("Photo");
    if (castingCost.location) parts.push("Location");
    if (castingCost.die_roll) parts.push("Die Roll");
    return parts.length > 0 ? `Cost: ${parts.join(", ")}` : "No cost";
  };

  // Action cards are colored purple, Curse cards are dark magenta
  const backgroundColor =
    card.Type === "Action"
      ? "#9370db"
      : card.Type === "Curse"
        ? "#8B008B"
        : colorMap[card.color] || "#ccc";

  return (
    <div
      ref={drag}
      style={{
        ...styles.card,
        ...(isMobile ? styles.cardMobile : {}),
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
          style={{
            ...styles.menuButton,
            ...(isMobile ? styles.menuButtonMobile : {})
          }}
          aria-label="Card menu"
        >
          ⋮
        </button>
      )}
      <div style={{
        ...styles.cardHeader,
        ...(isMobile ? styles.cardHeaderMobile : {})
      }}>
        <strong>{card.name || card.Type}</strong>
      </div>
      <div style={styles.cardBody}>
        {card.color && (
          <div style={{
            ...styles.cardColor,
            ...(isMobile ? styles.cardColorMobile : {})
          }}>
            {card.color}
          </div>
        )}
        {difficultyValue > 0 && (
          <div style={{
            ...styles.cardValues,
            ...(isMobile ? styles.cardValuesMobile : {})
          }}>
            <span>
              {allowedDifficulty[0]}: {difficultyValue}
            </span>
          </div>
        )}
        {card.Type === "Curse" && card.casting_cost && (
          <div style={{
            ...styles.castingCost,
            ...(isMobile ? styles.castingCostMobile : {})
          }}>
            {getCastingCostSummary(card.casting_cost)}
          </div>
        )}
        {card.description && (
          <div style={{
            ...styles.cardDescription,
            ...(isMobile ? styles.cardDescriptionMobile : {})
          }}>
            {getShortDescription(card.description)}
          </div>
        )}
      </div>
      {(canPlay && onPlay) || onDiscard ? (
        <div style={styles.buttonContainer}>
          {canPlay && onPlay && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onPlay();
              }}
              style={{
                ...styles.actionButton,
                ...(isMobile ? styles.actionButtonMobile : {})
              }}
            >
              Play
            </button>
          )}
          {onDiscard && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDiscard();
              }}
              style={{
                ...styles.actionButton,
                ...(isMobile ? styles.actionButtonMobile : {}),
                backgroundColor: "rgba(255,100,100,0.5)"
              }}
            >
              Discard
            </button>
          )}
        </div>
      ) : null}
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
  cardMobile: {
    width: "100px",
    minHeight: "140px",
    padding: "8px",
    margin: "3px",
  },
  cardHeader: {
    fontSize: "14px",
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: "10px",
  },
  cardHeaderMobile: {
    fontSize: "12px",
    marginBottom: "8px",
  },
  cardBody: {
    flex: 1,
  },
  cardColor: {
    fontSize: "12px",
    marginBottom: "10px",
    textAlign: "center",
  },
  cardColorMobile: {
    fontSize: "10px",
    marginBottom: "8px",
  },
  cardValues: {
    display: "flex",
    flexDirection: "column",
    fontSize: "12px",
    gap: "5px",
  },
  cardValuesMobile: {
    fontSize: "10px",
    gap: "3px",
  },
  castingCost: {
    fontSize: "10px",
    marginTop: "8px",
    padding: "5px",
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    borderRadius: "4px",
    border: "1px solid rgba(255, 255, 255, 0.4)",
    textAlign: "center",
    lineHeight: "1.3",
  },
  castingCostMobile: {
    fontSize: "8px",
    marginTop: "6px",
    padding: "4px",
  },
  cardDescription: {
    fontSize: "11px",
    marginTop: "8px",
    lineHeight: "1.4",
    fontStyle: "italic",
    opacity: 0.95,
  },
  cardDescriptionMobile: {
    fontSize: "9px",
    marginTop: "6px",
    lineHeight: "1.3",
  },
  buttonContainer: {
    display: "flex",
    gap: "5px",
    justifyContent: "space-between",
  },
  actionButton: {
    flex: 1,
    padding: "5px 8px",
    backgroundColor: "rgba(255,255,255,0.3)",
    border: "1px solid white",
    borderRadius: "4px",
    color: "white",
    cursor: "pointer",
    fontSize: "11px",
    fontWeight: "bold",
  },
  actionButtonMobile: {
    padding: "4px 6px",
    fontSize: "10px",
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
  menuButtonMobile: {
    width: "20px",
    height: "20px",
    fontSize: "14px",
    top: "3px",
    right: "3px",
  },
};

export default Card;
