import React from "react";
import { getAllowedDifficulty } from "../../context/GameContext";
import { useTheme, getCardBackgroundColor } from "../../context/ThemeContext";
import { useIsMobile } from "../../hooks/useMediaQuery";

const CardDetailModal = ({ isOpen, card, gameSize, onClose }) => {
  const { theme } = useTheme();
  const isMobile = useIsMobile();

  if (!isOpen || !card) return null;

  const allowedDifficulty = getAllowedDifficulty(gameSize);
  const getDifficultyValue = () => {
    if (allowedDifficulty === "Small") return card.Small;
    if (allowedDifficulty === "Medium") return card.Medium;
    return card.Large;
  };
  const difficultyValue = getDifficultyValue();

  const backgroundColor = getCardBackgroundColor(theme, card);

  return (
    <div style={styles.overlay(theme)} onClick={onClose}>
      <div
        style={{
          ...styles.modal(theme),
          ...(isMobile ? styles.modalMobile : {}),
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            ...styles.cardPreview(theme),
            ...(isMobile ? styles.cardPreviewMobile : {}),
            backgroundColor,
          }}
        >
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
          </div>
        </div>

        <div style={styles.detailsSection(theme)}>
          <h2
            style={{
              ...styles.title(theme),
              ...(isMobile ? styles.titleMobile : {}),
            }}
          >
            {card.name || card.Type}
          </h2>
          <div style={styles.typeTag(theme)}>{card.Type}</div>

          {card.description && (
            <div style={styles.descriptionBox(theme)}>
              <h3 style={styles.sectionTitle(theme)}>Description</h3>
              <p style={styles.descriptionText(theme)}>{card.description}</p>
            </div>
          )}

          {card.Type === "Curse" && card.curse_text && (
            <div style={styles.curseTextBox(theme)}>
              <h3 style={styles.sectionTitle(theme)}>Curse Effect</h3>
              <p style={styles.curseText(theme)}>{card.curse_text}</p>
            </div>
          )}

          {card.Type === "Curse" && card.casting_cost && (
            <div style={styles.castingCostBox(theme)}>
              <h3 style={styles.sectionTitle(theme)}>Casting Cost</h3>
              <div style={styles.costList}>
                {card.casting_cost.discard > 0 && (
                  <div style={styles.costRow(theme)}>
                    <span style={styles.costIcon}>🗑️</span>
                    <span>
                      Discard {card.casting_cost.discard} card
                      {card.casting_cost.discard > 1 ? "s" : ""}
                    </span>
                  </div>
                )}
                {card.casting_cost.photo && (
                  <div style={styles.costRow(theme)}>
                    <span style={styles.costIcon}>📷</span>
                    <span>Photo: {card.casting_cost.photo}</span>
                  </div>
                )}
                {card.casting_cost.location && (
                  <div style={styles.costRow(theme)}>
                    <span style={styles.costIcon}>📍</span>
                    <span>Location: {card.casting_cost.location}</span>
                  </div>
                )}
                {card.casting_cost.die_roll && (
                  <div style={styles.costRow(theme)}>
                    <span style={styles.costIcon}>🎲</span>
                    <span>Die Roll: {card.casting_cost.die_roll}</span>
                  </div>
                )}
                {!card.casting_cost.discard &&
                  !card.casting_cost.photo &&
                  !card.casting_cost.location &&
                  !card.casting_cost.die_roll && (
                    <div style={styles.costRow(theme)}>
                      <span style={styles.costIcon}>✓</span>
                      <span>No casting cost</span>
                    </div>
                  )}
              </div>
            </div>
          )}

          {card.Type === "Time Bonus" && (
            <div style={styles.valuesBox(theme)}>
              <h3 style={styles.sectionTitle(theme)}>Time Values</h3>
              <div style={styles.valueGrid}>
                <div style={styles.valueItem(theme)}>
                  <span style={styles.valueLabel(theme)}>Small:</span>
                  <span style={styles.valueNumber(theme)}>
                    {card.Small} min
                  </span>
                </div>
                <div style={styles.valueItem(theme)}>
                  <span style={styles.valueLabel(theme)}>Medium:</span>
                  <span style={styles.valueNumber(theme)}>
                    {card.Medium} min
                  </span>
                </div>
                <div style={styles.valueItem(theme)}>
                  <span style={styles.valueLabel(theme)}>Large:</span>
                  <span style={styles.valueNumber(theme)}>
                    {card.Large} min
                  </span>
                </div>
              </div>
              <div style={styles.currentValue(theme)}>
                Current Game:{" "}
                <strong>
                  {allowedDifficulty} = {difficultyValue} min
                </strong>
              </div>
            </div>
          )}

          <div style={styles.rarityBox(theme)}>
            <h3 style={styles.sectionTitle(theme)}>Rarity</h3>
            <p style={styles.rarityText(theme)}>
              {card.cards} {card.cards === 1 ? "card" : "cards"} in deck
              {card.cards <= 2 && " - Very Rare"}
              {card.cards > 2 && card.cards <= 4 && " - Rare"}
              {card.cards > 4 && card.cards <= 10 && " - Uncommon"}
              {card.cards > 10 && " - Common"}
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          style={{
            ...styles.closeButton(theme),
            ...(isMobile ? styles.closeButtonMobile : {}),
          }}
        >
          Close
        </button>
      </div>
    </div>
  );
};

const styles = {
  overlay: (theme) => ({
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: theme.colors.modalOverlay,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  }),
  modal: (theme) => ({
    backgroundColor: theme.colors.modalBackground,
    borderRadius: "12px",
    padding: "30px",
    maxWidth: "600px",
    width: "90%",
    maxHeight: "90vh",
    overflowY: "auto",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)",
    border: `1px solid ${theme.colors.border}`,
  }),
  modalMobile: {
    padding: "15px",
    maxWidth: "95vw",
    maxHeight: "95vh",
  },
  cardPreview: (theme) => ({
    width: "150px",
    minHeight: "200px",
    borderRadius: "8px",
    padding: "15px",
    color: theme.colors.text,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
    margin: "0 auto 25px",
  }),
  cardPreviewMobile: {
    width: "120px",
    minHeight: "160px",
    padding: "12px",
    marginBottom: "20px",
  },
  cardHeader: {
    fontSize: "16px",
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: "10px",
  },
  cardBody: {
    flex: 1,
  },
  cardColor: {
    fontSize: "14px",
    marginBottom: "10px",
    textAlign: "center",
  },
  cardValues: {
    display: "flex",
    flexDirection: "column",
    fontSize: "14px",
    gap: "5px",
    textAlign: "center",
  },
  detailsSection: (theme) => ({
    color: theme.colors.text,
  }),
  title: (theme) => ({
    fontSize: "24px",
    marginBottom: "10px",
    textAlign: "center",
    color: theme.colors.text,
  }),
  titleMobile: {
    fontSize: "20px",
  },
  typeTag: (theme) => ({
    display: "inline-block",
    backgroundColor: theme.colors.backgroundAlt,
    padding: "5px 15px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "bold",
    color: theme.colors.textSecondary,
    marginBottom: "20px",
    textAlign: "center",
    width: "100%",
    border: `1px solid ${theme.colors.border}`,
  }),
  sectionTitle: (theme) => ({
    fontSize: "16px",
    fontWeight: "bold",
    marginBottom: "10px",
    color: theme.colors.textSecondary,
  }),
  descriptionBox: (theme) => ({
    marginBottom: "20px",
    padding: "15px",
    backgroundColor: theme.colors.backgroundAlt,
    borderRadius: "8px",
    border: `1px solid ${theme.colors.border}`,
  }),
  descriptionText: (theme) => ({
    fontSize: "14px",
    lineHeight: "1.6",
    color: theme.colors.text,
    margin: 0,
  }),
  valuesBox: (theme) => ({
    marginBottom: "20px",
    padding: "15px",
    backgroundColor: theme.colors.info,
    borderRadius: "8px",
    border: `1px solid ${theme.colors.border}`,
  }),
  valueGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "10px",
    marginBottom: "15px",
  },
  valueItem: (theme) => ({
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "10px",
    backgroundColor: theme.colors.backgroundCard,
    borderRadius: "6px",
    border: `1px solid ${theme.colors.border}`,
  }),
  valueLabel: (theme) => ({
    fontSize: "12px",
    color: theme.colors.textSecondary,
    marginBottom: "5px",
  }),
  valueNumber: (theme) => ({
    fontSize: "18px",
    fontWeight: "bold",
    color: theme.colors.textSecondary,
  }),
  currentValue: (theme) => ({
    textAlign: "center",
    fontSize: "14px",
    color: theme.colors.secondaryDark,
    padding: "10px",
    backgroundColor: theme.colors.backgroundCard,
    borderRadius: "6px",
    border: `1px solid ${theme.colors.border}`,
  }),
  rarityBox: (theme) => ({
    marginBottom: "20px",
    padding: "15px",
    backgroundColor: theme.colors.warning,
    borderRadius: "8px",
    border: `1px solid ${theme.colors.border}`,
  }),
  rarityText: (theme) => ({
    fontSize: "14px",
    color: theme.colors.text,
    margin: 0,
  }),
  curseTextBox: (theme) => ({
    marginBottom: "20px",
    padding: "15px",
    backgroundColor: theme.colors.curse,
    borderRadius: "8px",
    border: `2px solid ${theme.colors.curseText}`,
  }),
  curseText: (theme) => ({
    fontSize: "14px",
    lineHeight: "1.6",
    color: theme.colors.text,
    margin: 0,
  }),
  castingCostBox: (theme) => ({
    marginBottom: "20px",
    padding: "15px",
    backgroundColor: theme.colors.curse,
    borderRadius: "8px",
    border: `1px solid ${theme.colors.border}`,
  }),
  costList: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  costRow: (theme) => ({
    display: "flex",
    alignItems: "center",
    gap: "10px",
    fontSize: "14px",
    color: theme.colors.text,
  }),
  costIcon: {
    fontSize: "20px",
  },
  closeButton: (theme) => ({
    width: "100%",
    padding: "12px",
    backgroundColor: theme.colors.secondary,
    color: theme.colors.text,
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: "bold",
    transition: "background-color 0.2s ease",
  }),
  closeButtonMobile: {
    padding: "10px",
    fontSize: "14px",
  },
};

export default CardDetailModal;
