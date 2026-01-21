import React from 'react';
import { useDrop } from 'react-dnd';
import Card from './Card';

const HandSlot = ({ position, card, onDrop, onPlay, isHighlighted = false, gameSize = 5, onCardClick }) => {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'CARD',
    drop: (item) => onDrop(item.card, position),
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }));

  return (
    <div
      ref={drop}
      style={{
        ...styles.slot,
        backgroundColor: isOver ? '#e0e0e0' : '#f5f5f5',
      }}
    >
      {card ? (
        <Card card={card} gameSize={gameSize} onPlay={() => onPlay(position)} isDraggable={true} isHighlighted={isHighlighted} onCardClick={onCardClick} />
      ) : (
        <div style={styles.emptySlot}>Empty</div>
      )}
    </div>
  );
};

const Hand = ({ hand, onUpdateHand, onPlayCard, highlightedPositions = [], gameSize = 5, onCardClick }) => {
  const handleDrop = (card, position) => {
    const newHand = [...hand];
    newHand[position] = card;
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
    padding: '20px',
  },
  title: {
    textAlign: 'center',
    marginBottom: '20px',
    color: '#333',
  },
  handContainer: {
    display: 'flex',
    justifyContent: 'center',
    gap: '10px',
    flexWrap: 'wrap',
  },
  slot: {
    width: '140px',
    minHeight: '180px',
    border: '2px dashed #ccc',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background-color 0.2s',
  },
  emptySlot: {
    color: '#999',
    fontSize: '14px',
  },
};

export default Hand;
