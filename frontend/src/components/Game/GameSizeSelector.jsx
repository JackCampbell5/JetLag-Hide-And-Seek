import React from 'react';

const GameSizeSelector = ({ gameSize, onGameSizeChange, compact = false }) => {
  const sizes = [
    { value: 3, label: 'Small', description: 'Show only Small difficulty values (shortest duration)' },
    { value: 4, label: 'Medium', description: 'Show only Medium difficulty values' },
    { value: 5, label: 'Large', description: 'Show only Large difficulty values (longest duration)' }
  ];

  if (compact) {
    return (
      <div style={styles.compactContainer}>
        <label style={styles.compactLabel}>Difficulty:</label>
        <select
          value={gameSize}
          onChange={(e) => onGameSizeChange(Number(e.target.value))}
          style={styles.compactSelect}
        >
          {sizes.map((size) => (
            <option key={size.value} value={size.value}>
              {size.label}
            </option>
          ))}
        </select>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <label style={styles.label}>Game Difficulty Level</label>
      <div style={styles.buttonGroup}>
        {sizes.map((size) => (
          <button
            key={size.value}
            type="button"
            onClick={() => onGameSizeChange(size.value)}
            style={{
              ...styles.sizeButton,
              ...(gameSize === size.value ? styles.sizeButtonActive : {}),
            }}
            title={size.description}
          >
            {size.label}
          </button>
        ))}
      </div>
      <p style={styles.description}>
        Choose which card difficulty level to play with (Small, Medium, or Large)
      </p>
    </div>
  );
};

const styles = {
  container: {
    marginBottom: '20px',
  },
  label: {
    display: 'block',
    marginBottom: '10px',
    color: '#555',
    fontWeight: '500',
    fontSize: '16px',
  },
  buttonGroup: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  sizeButton: {
    padding: '12px 20px',
    backgroundColor: '#e0e0e0',
    color: '#333',
    border: '2px solid #ccc',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 'bold',
    minWidth: '50px',
    transition: 'all 0.2s',
  },
  sizeButtonActive: {
    backgroundColor: '#4CAF50',
    color: 'white',
    border: '2px solid #388E3C',
    transform: 'scale(1.05)',
  },
  description: {
    marginTop: '10px',
    fontSize: '14px',
    color: '#666',
    textAlign: 'center',
  },
  compactContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  compactLabel: {
    fontSize: '14px',
    color: '#555',
    fontWeight: '500',
  },
  compactSelect: {
    padding: '6px 10px',
    fontSize: '14px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    backgroundColor: 'white',
    cursor: 'pointer',
  },
};

export default GameSizeSelector;
