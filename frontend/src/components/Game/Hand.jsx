import React from "react";
import { useDrop } from "react-dnd";
import Card from "./Card";
import { useTheme } from "../../context/ThemeContext";
import { useIsMobile } from "../../hooks/useMediaQuery";

const HandSlot = ({
  position,
  card,
  onDrop,
  onPlay,
  onDiscard,
  isHighlighted = false,
  gameSize = 5,
  onCardClick,
  isMobile = false,
  theme,
}) => {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: "CARD",
    drop: (item) => onDrop(item, position),
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }));

  return (
    <div
      ref={drop}
      style={{
        ...styles.slot(theme),
        ...(isMobile ? styles.slotMobile : {}),
        backgroundColor: isOver ? theme.colors.borderLight : theme.colors.backgroundAlt,
      }}
    >
      {card ? (
        <Card
          card={card}
          gameSize={gameSize}
          onPlay={() => onPlay(position)}
          onDiscard={() => onDiscard(position)}
          isDraggable={false}
          isHighlighted={isHighlighted}
          onCardClick={onCardClick}
          position={position}
        />
      ) : (
        <div style={{
          ...styles.emptySlot(theme),
          ...(isMobile ? styles.emptySlotMobile : {})
        }}>
          Empty
        </div>
      )}
    </div>
  );
};

const Hand = ({
  hand,
  onUpdateHand,
  onPlayCard,
  onDiscardCard,
  highlightedPositions = [],
  gameSize = 5,
  onCardClick,
}) => {
  const { theme } = useTheme();
  const isMobile = useIsMobile();

  const handleDrop = (item, targetPosition) => {
    const { card, sourcePosition } = item;
    const newHand = [...hand];

    // If sourcePosition is defined, this is a move within hand
    if (sourcePosition !== undefined && sourcePosition !== null) {
      // Swap cards if target position has a card, otherwise just move
      const targetCard = newHand[targetPosition];

      if (targetCard) {
        // Swap: put target card in source position
        newHand[sourcePosition] = targetCard;
      } else {
        // Just move: clear source position
        newHand[sourcePosition] = null;
      }

      // Place dragged card at target position
      newHand[targetPosition] = card;
    } else {
      // Adding a new card from drawn cards, just place it
      newHand[targetPosition] = card;
    }

    onUpdateHand(newHand);
  };

  // Hand always has 5 positions
  return (
    <div style={{
      ...styles.container,
      ...(isMobile ? styles.containerMobile : {})
    }}>
      <h2 style={{
        ...styles.title(theme),
        ...(isMobile ? styles.titleMobile : {})
      }}>
        Your Hand (5 positions)
      </h2>
      <div style={{
        ...styles.handContainer,
        ...(isMobile ? styles.handContainerMobile : {})
      }}>
        {hand.map((card, index) => (
          <HandSlot
            key={index}
            position={index}
            card={card}
            onDrop={handleDrop}
            onPlay={onPlayCard}
            onDiscard={onDiscardCard}
            isHighlighted={highlightedPositions.includes(index)}
            gameSize={gameSize}
            onCardClick={onCardClick}
            isMobile={isMobile}
            theme={theme}
          />
        ))}
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: "20px",
  },
  containerMobile: {
    padding: "10px",
  },
  title: (theme) => ({
    textAlign: "center",
    marginBottom: "20px",
    color: theme.colors.text,
  }),
  titleMobile: {
    fontSize: "18px",
    marginBottom: "15px",
  },
  handContainer: {
    display: "flex",
    justifyContent: "center",
    gap: "10px",
    flexWrap: "wrap",
  },
  handContainerMobile: {
    gap: "5px",
    justifyContent: "space-evenly",
  },
  slot: (theme) => ({
    width: "140px",
    minHeight: "180px",
    border: `2px dashed ${theme.colors.border}`,
    borderRadius: "8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "background-color 0.2s",
  }),
  slotMobile: {
    width: "110px",
    minHeight: "150px",
  },
  emptySlot: (theme) => ({
    color: theme.colors.textMuted,
    fontSize: "14px",
  }),
  emptySlotMobile: {
    fontSize: "12px",
  },
};

export default Hand;
