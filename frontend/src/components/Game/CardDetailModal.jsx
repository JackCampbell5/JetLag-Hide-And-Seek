import React from 'react';
import { getAllowedDifficulty } from '../../context/GameContext';
import { useIsMobile } from '../../hooks/useMediaQuery';

const CardDetailModal = ({ isOpen, card, gameSize, onClose }) => {
  const isMobile = useIsMobile();

  if (!isOpen || !card) return null;

  const allowedDifficulty = getAllowedDifficulty(gameSize);
  const getDifficultyValue = () => {
    if (allowedDifficulty === 'Small') return card.Small;
    if (allowedDifficulty === 'Medium') return card.Medium;
    return card.Large;
  };
  const difficultyValue = getDifficultyValue();

  const colorMap = {
    Red: '#ff4444',
    Orange: '#ff8c00',
    Yellow: '#ffd700',
    Blue: '#4169e1',
    Green: '#32cd32',
    Purple: '#9370db',
    Pink: '#ff69b4',
    Gray: '#808080',
    Special: '#ff00ff',
  };

  const backgroundColor = card.Type === 'Action' ? '#9370db' : card.Type === 'Curse' ? '#8B008B' : (colorMap[card.color] || '#ccc');

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={{
        ...styles.modal,
        ...(isMobile ? styles.modalMobile : {})
      }} onClick={(e) => e.stopPropagation()}>
        <div style={{
          ...styles.cardPreview,
          ...(isMobile ? styles.cardPreviewMobile : {}),
          backgroundColor
        }}>
          <div style={styles.cardHeader}>
            <strong>{card.name || card.Type}</strong>
          </div>
          <div style={styles.cardBody}>
            {card.color && <div style={styles.cardColor}>{card.color}</div>}
            {difficultyValue > 0 && (
              <div style={styles.cardValues}>
                <span>{allowedDifficulty[0]}: {difficultyValue}</span>
              </div>
            )}
          </div>
        </div>

        <div style={styles.detailsSection}>
          <h2 style={{
            ...styles.title,
            ...(isMobile ? styles.titleMobile : {})
          }}>{card.name || card.Type}</h2>
          <div style={styles.typeTag}>
            {card.Type}
          </div>

          {card.description && (
            <div style={styles.descriptionBox}>
              <h3 style={styles.sectionTitle}>Description</h3>
              <p style={styles.descriptionText}>{card.description}</p>
            </div>
          )}

          {card.Type === 'Curse' && card.curse_text && (
            <div style={styles.curseTextBox}>
              <h3 style={styles.sectionTitle}>Curse Effect</h3>
              <p style={styles.curseText}>{card.curse_text}</p>
            </div>
          )}

          {card.Type === 'Curse' && card.casting_cost && (
            <div style={styles.castingCostBox}>
              <h3 style={styles.sectionTitle}>Casting Cost</h3>
              <div style={styles.costList}>
                {card.casting_cost.discard > 0 && (
                  <div style={styles.costRow}>
                    <span style={styles.costIcon}>🗑️</span>
                    <span>Discard {card.casting_cost.discard} card{card.casting_cost.discard > 1 ? 's' : ''}</span>
                  </div>
                )}
                {card.casting_cost.photo && (
                  <div style={styles.costRow}>
                    <span style={styles.costIcon}>📷</span>
                    <span>Photo: {card.casting_cost.photo}</span>
                  </div>
                )}
                {card.casting_cost.location && (
                  <div style={styles.costRow}>
                    <span style={styles.costIcon}>📍</span>
                    <span>Location: {card.casting_cost.location}</span>
                  </div>
                )}
                {card.casting_cost.die_roll && (
                  <div style={styles.costRow}>
                    <span style={styles.costIcon}>🎲</span>
                    <span>Die Roll: {card.casting_cost.die_roll}</span>
                  </div>
                )}
                {!card.casting_cost.discard && !card.casting_cost.photo && !card.casting_cost.location && !card.casting_cost.die_roll && (
                  <div style={styles.costRow}>
                    <span style={styles.costIcon}>✓</span>
                    <span>No casting cost</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {card.Type === 'Time Bonus' && (
            <div style={styles.valuesBox}>
              <h3 style={styles.sectionTitle}>Time Values</h3>
              <div style={styles.valueGrid}>
                <div style={styles.valueItem}>
                  <span style={styles.valueLabel}>Small:</span>
                  <span style={styles.valueNumber}>{card.Small} min</span>
                </div>
                <div style={styles.valueItem}>
                  <span style={styles.valueLabel}>Medium:</span>
                  <span style={styles.valueNumber}>{card.Medium} min</span>
                </div>
                <div style={styles.valueItem}>
                  <span style={styles.valueLabel}>Large:</span>
                  <span style={styles.valueNumber}>{card.Large} min</span>
                </div>
              </div>
              <div style={styles.currentValue}>
                Current Game: <strong>{allowedDifficulty} = {difficultyValue} min</strong>
              </div>
            </div>
          )}

          <div style={styles.rarityBox}>
            <h3 style={styles.sectionTitle}>Rarity</h3>
            <p style={styles.rarityText}>
              {card.cards} {card.cards === 1 ? 'card' : 'cards'} in deck
              {card.cards <= 2 && ' - Very Rare'}
              {card.cards > 2 && card.cards <= 4 && ' - Rare'}
              {card.cards > 4 && card.cards <= 10 && ' - Uncommon'}
              {card.cards > 10 && ' - Common'}
            </p>
          </div>
        </div>

        <button onClick={onClose} style={{
          ...styles.closeButton,
          ...(isMobile ? styles.closeButtonMobile : {})
        }}>
          Close
        </button>
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
    maxWidth: '600px',
    width: '90%',
    maxHeight: '90vh',
    overflowY: 'auto',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
  },
  modalMobile: {
    padding: '15px',
    maxWidth: '95vw',
    maxHeight: '95vh',
  },
  cardPreview: {
    width: '150px',
    minHeight: '200px',
    borderRadius: '8px',
    padding: '15px',
    color: 'white',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
    margin: '0 auto 25px',
  },
  cardPreviewMobile: {
    width: '120px',
    minHeight: '160px',
    padding: '12px',
    marginBottom: '20px',
  },
  cardHeader: {
    fontSize: '16px',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: '10px',
  },
  cardBody: {
    flex: 1,
  },
  cardColor: {
    fontSize: '14px',
    marginBottom: '10px',
    textAlign: 'center',
  },
  cardValues: {
    display: 'flex',
    flexDirection: 'column',
    fontSize: '14px',
    gap: '5px',
    textAlign: 'center',
  },
  detailsSection: {
    color: '#333',
  },
  title: {
    fontSize: '24px',
    marginBottom: '10px',
    textAlign: 'center',
    color: '#333',
  },
  titleMobile: {
    fontSize: '20px',
  },
  typeTag: {
    display: 'inline-block',
    backgroundColor: '#e0e0e0',
    padding: '5px 15px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: 'bold',
    color: '#555',
    marginBottom: '20px',
    textAlign: 'center',
    width: '100%',
  },
  sectionTitle: {
    fontSize: '16px',
    fontWeight: 'bold',
    marginBottom: '10px',
    color: '#555',
  },
  descriptionBox: {
    marginBottom: '20px',
    padding: '15px',
    backgroundColor: '#f9f9f9',
    borderRadius: '8px',
    border: '1px solid #e0e0e0',
  },
  descriptionText: {
    fontSize: '14px',
    lineHeight: '1.6',
    color: '#333',
    margin: 0,
  },
  valuesBox: {
    marginBottom: '20px',
    padding: '15px',
    backgroundColor: '#e3f2fd',
    borderRadius: '8px',
    border: '1px solid #90caf9',
  },
  valueGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '10px',
    marginBottom: '15px',
  },
  valueItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '10px',
    backgroundColor: 'white',
    borderRadius: '6px',
  },
  valueLabel: {
    fontSize: '12px',
    color: '#666',
    marginBottom: '5px',
  },
  valueNumber: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#2196F3',
  },
  currentValue: {
    textAlign: 'center',
    fontSize: '14px',
    color: '#1976D2',
    padding: '10px',
    backgroundColor: 'white',
    borderRadius: '6px',
  },
  rarityBox: {
    marginBottom: '20px',
    padding: '15px',
    backgroundColor: '#fff3cd',
    borderRadius: '8px',
    border: '1px solid #ffc107',
  },
  rarityText: {
    fontSize: '14px',
    color: '#333',
    margin: 0,
  },
  curseTextBox: {
    marginBottom: '20px',
    padding: '15px',
    backgroundColor: '#f3e5f5',
    borderRadius: '8px',
    border: '2px solid #8b008b',
  },
  curseText: {
    fontSize: '14px',
    lineHeight: '1.6',
    color: '#333',
    margin: 0,
  },
  castingCostBox: {
    marginBottom: '20px',
    padding: '15px',
    backgroundColor: '#ede7f6',
    borderRadius: '8px',
    border: '1px solid #9370db',
  },
  costList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  costRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '14px',
    color: '#333',
  },
  costIcon: {
    fontSize: '20px',
  },
  closeButton: {
    width: '100%',
    padding: '12px',
    backgroundColor: '#2196F3',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 'bold',
    transition: 'background-color 0.2s',
  },
  closeButtonMobile: {
    padding: '10px',
    fontSize: '14px',
  },
};

export default CardDetailModal;
