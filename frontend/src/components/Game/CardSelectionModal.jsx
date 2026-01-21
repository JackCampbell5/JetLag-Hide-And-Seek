import React from 'react';
import Card from './Card';

const CardSelectionModal = ({
  isOpen,
  hand,
  playedPosition,
  requiredCount,
  selectedPositions,
  onSelectPosition,
  onConfirm,
  onCancel,
  title,
  confirmText
}) => {
  if (!isOpen) return null;

  const handleCardClick = (position) => {
    // Can't select the played card or empty slots
    if (position === playedPosition || !hand[position]) {
      return;
    }

    // Toggle selection
    if (selectedPositions.includes(position)) {
      onSelectPosition(selectedPositions.filter(pos => pos !== position));
    } else if (selectedPositions.length < requiredCount) {
      onSelectPosition([...selectedPositions, position]);
    }
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h2 style={styles.title}>
          {title || `Select ${requiredCount} Card${requiredCount > 1 ? 's' : ''} to Discard`}
        </h2>
        <p style={styles.subtitle}>
          Selected: {selectedPositions.length} / {requiredCount}
        </p>

        <div style={styles.cardGrid}>
          {hand.map((card, position) => {
            const isPlayed = position === playedPosition;
            const isEmpty = !card;
            const isSelected = selectedPositions.includes(position);
            const isDisabled = isPlayed || isEmpty;

            return (
              <div
                key={position}
                onClick={() => handleCardClick(position)}
                style={{
                  ...styles.cardContainer,
                  cursor: isDisabled ? 'not-allowed' : 'pointer',
                  opacity: isDisabled ? 0.4 : 1,
                  border: isSelected
                    ? '4px solid #4CAF50'
                    : isPlayed
                    ? '4px solid #f44336'
                    : '2px solid #ccc',
                  transform: isSelected ? 'scale(1.05)' : 'scale(1)',
                }}
              >
                <div style={styles.positionLabel}>Position {position}</div>
                {card ? (
                  <Card card={card} canPlay={false} />
                ) : (
                  <div style={styles.emptyCard}>Empty</div>
                )}
                {isPlayed && <div style={styles.badge}>Playing This</div>}
                {isSelected && <div style={styles.selectedBadge}>Selected</div>}
              </div>
            );
          })}
        </div>

        <div style={styles.buttonContainer}>
          <button
            onClick={onCancel}
            style={styles.cancelButton}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={selectedPositions.length !== requiredCount}
            style={{
              ...styles.confirmButton,
              opacity: selectedPositions.length !== requiredCount ? 0.5 : 1,
              cursor: selectedPositions.length !== requiredCount ? 'not-allowed' : 'pointer',
            }}
          >
            {confirmText || 'Confirm Discard'}
          </button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modal: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '30px',
    maxWidth: '900px',
    width: '90%',
    maxHeight: '90vh',
    overflowY: 'auto',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
  },
  title: {
    textAlign: 'center',
    color: '#333',
    marginBottom: '10px',
    fontSize: '24px',
  },
  subtitle: {
    textAlign: 'center',
    color: '#666',
    marginBottom: '20px',
    fontSize: '16px',
  },
  cardGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
    gap: '15px',
    marginBottom: '30px',
  },
  cardContainer: {
    position: 'relative',
    borderRadius: '8px',
    padding: '10px',
    transition: 'all 0.2s ease',
    backgroundColor: '#f9f9f9',
  },
  positionLabel: {
    position: 'absolute',
    top: '5px',
    left: '5px',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    color: 'white',
    padding: '2px 6px',
    borderRadius: '4px',
    fontSize: '10px',
    fontWeight: 'bold',
    zIndex: 10,
  },
  emptyCard: {
    height: '180px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#999',
    fontSize: '14px',
  },
  badge: {
    position: 'absolute',
    bottom: '10px',
    left: '50%',
    transform: 'translateX(-50%)',
    backgroundColor: '#f44336',
    color: 'white',
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: 'bold',
  },
  selectedBadge: {
    position: 'absolute',
    bottom: '10px',
    left: '50%',
    transform: 'translateX(-50%)',
    backgroundColor: '#4CAF50',
    color: 'white',
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: 'bold',
  },
  buttonContainer: {
    display: 'flex',
    gap: '15px',
    justifyContent: 'center',
  },
  cancelButton: {
    padding: '12px 30px',
    backgroundColor: '#757575',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 'bold',
    transition: 'background-color 0.2s',
  },
  confirmButton: {
    padding: '12px 30px',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 'bold',
    transition: 'background-color 0.2s',
  },
};

export default CardSelectionModal;
