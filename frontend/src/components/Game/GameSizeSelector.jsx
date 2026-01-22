import React from "react";
import { useTheme } from "../../context/ThemeContext";

const GameSizeSelector = ({ gameSize, onGameSizeChange, compact = false }) => {
  const { theme } = useTheme();
  const sizes = [
    {
      value: 3,
      label: "Small",
      description: "Show only Small difficulty values (shortest duration)",
    },
    {
      value: 4,
      label: "Medium",
      description: "Show only Medium difficulty values",
    },
    {
      value: 5,
      label: "Large",
      description: "Show only Large difficulty values (longest duration)",
    },
  ];

  if (compact) {
    return (
      <div style={styles.compactContainer}>
        <label style={styles.compactLabel(theme)}>Difficulty:</label>
        <select
          value={gameSize}
          onChange={(e) => onGameSizeChange(Number(e.target.value))}
          style={styles.compactSelect(theme)}
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
      <label style={styles.label(theme)}>Game Difficulty Level</label>
      <div style={styles.buttonGroup}>
        {sizes.map((size) => (
          <button
            key={size.value}
            type="button"
            onClick={() => onGameSizeChange(size.value)}
            style={{
              ...styles.sizeButton(theme),
              ...(gameSize === size.value
                ? styles.sizeButtonActive(theme)
                : {}),
            }}
            title={size.description}
          >
            {size.label}
          </button>
        ))}
      </div>
      <p style={styles.description(theme)}>
        Choose which card difficulty level to play with (Small, Medium, or
        Large)
      </p>
    </div>
  );
};

const styles = {
  container: {
    marginBottom: "20px",
  },
  label: (theme) => ({
    display: "block",
    marginBottom: "10px",
    color: theme.colors.text,
    fontWeight: "500",
    fontSize: "16px",
  }),
  buttonGroup: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  sizeButton: (theme) => ({
    padding: "12px 20px",
    backgroundColor: theme.colors.backgroundAlt,
    color: theme.colors.text,
    border: `2px solid ${theme.colors.border}`,
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: "bold",
    minWidth: "50px",
    transition: "all 0.2s",
  }),
  sizeButtonActive: (theme) => ({
    backgroundColor: theme.colors.primary,
    color: theme.colors.text,
    border: `2px solid ${theme.colors.primaryDark}`,
    transform: "scale(1.05)",
  }),
  description: (theme) => ({
    marginTop: "10px",
    fontSize: "14px",
    color: theme.colors.textSecondary,
    textAlign: "center",
  }),
  compactContainer: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  compactLabel: (theme) => ({
    fontSize: "14px",
    color: theme.colors.text,
    fontWeight: "500",
  }),
  compactSelect: (theme) => ({
    padding: "6px 10px",
    fontSize: "14px",
    border: `1px solid ${theme.colors.border}`,
    borderRadius: "4px",
    backgroundColor: theme.colors.input,
    color: theme.colors.text,
    cursor: "pointer",
  }),
};

export default GameSizeSelector;
