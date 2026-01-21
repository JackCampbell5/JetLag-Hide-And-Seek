import React from "react";
import { useDrop } from "react-dnd";
import Card from "./Card";

const HandSlot = ({
  position,
  card,
  onDrop,
  onPlay,
  onDiscard,
  isHighlighted = false,
  gameSize = 5,
  onCardClick,
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
        ...styles.slot,
        backgroundColor: isOver ? "#e0e0e0" : "#f5f5f5",
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
        <div style={styles.emptySlot}>Empty</div>
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
    <div style={styles.container}>
      <h2 style={styles.title}>Your Hand (5 positions)</h2>
      <div style={styles.handContainer}>
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
  title: {
    textAlign: "center",
    marginBottom: "20px",
    color: "#333",
  },
  handContainer: {
    display: "flex",
    justifyContent: "center",
    gap: "10px",
    flexWrap: "wrap",
  },
  slot: {
    width: "140px",
    minHeight: "180px",
    border: "2px dashed #ccc",
    borderRadius: "8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "background-color 0.2s",
  },
  emptySlot: {
    color: "#999",
    fontSize: "14px",
  },
};

export default Hand;
