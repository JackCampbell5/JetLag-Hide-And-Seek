import React from 'react';
import { getAllowedDifficulty } from '../../context/GameContext';
import { useTheme } from '../../context/ThemeContext';
import { useIsMobile } from '../../hooks/useMediaQuery';

const CurseDisplayModal = ({ isOpen, curseData, gameSize, onClose, onConfirm }) => {
  const { theme } = useTheme();
  const isMobile = useIsMobile();

  if (!isOpen || !curseData) return null;

  const allowedDifficulty = getAllowedDifficulty(gameSize);

  // Replace S/M/L placeholders in curse text with appropriate values
  const replaceDifficultyValues = (text) => {
    if (!text) return '';

    // Replace patterns like [S10, M20, L30] with the appropriate value
    return text.replace(/\[S([^,\]]+),\s*M([^,\]]+),\s*L([^\]]+)\]/g, (match, small, medium, large) => {
      if (allowedDifficulty === 'Small') return small.trim();
      if (allowedDifficulty === 'Medium') return medium.trim();
      return large.trim();
    });
  };

  const curseText = replaceDifficultyValues(curseData.curse_text);
  const castingCost = curseData.casting_cost || {};

  // Format casting cost items
  const getCastingCostItems = () => {
    const items = [];

    if (castingCost.discard > 0) {
      items.push({
        icon: '🗑️',
        text: `Discard ${castingCost.discard} card${castingCost.discard > 1 ? 's' : ''}`
      });
    }

    if (castingCost.photo) {
      items.push({
        icon: '📷',
        text: `Photo: ${castingCost.photo}`
      });
    }

    if (castingCost.location) {
      items.push({
        icon: '📍',
        text: `Location: ${castingCost.location}`
      });
    }

    if (castingCost.die_roll) {
      items.push({
        icon: '🎲',
        text: `Die Roll: ${castingCost.die_roll}`
      });
    }

    return items.length > 0 ? items : [{ icon: '✓', text: 'No casting cost' }];
  };

  const castingCostItems = getCastingCostItems();

  return (
    <div style={styles.overlay(theme)} onClick={onClose}>
      <div style={{
        ...styles.modal(theme),
        ...(isMobile ? styles.modalMobile(theme) : {})
      }} onClick={(e) => e.stopPropagation()}>
        <div style={{
          ...styles.header(theme),
          ...(isMobile ? styles.headerMobile : {})
        }}>
          <h1 style={{
            ...styles.curseName(theme),
            ...(isMobile ? styles.curseNameMobile : {})
          }}>{curseData.name}</h1>
        </div>

        <div style={{
          ...styles.curseTextSection(theme),
          ...(isMobile ? styles.curseTextSectionMobile : {})
        }}>
          <p style={{
            ...styles.curseText(theme),
            ...(isMobile ? styles.curseTextMobile : {})
          }}>{curseText}</p>
        </div>

        <div style={{
          ...styles.castingCostSection(theme),
          ...(isMobile ? styles.castingCostSectionMobile : {})
        }}>
          <h3 style={styles.castingCostTitle(theme)}>Casting Cost:</h3>
          <div style={styles.costItems}>
            {castingCostItems.map((item, index) => (
              <div key={index} style={styles.costItem(theme)}>
                <span style={styles.costIcon}>{item.icon}</span>
                <span style={styles.costText(theme)}>{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{
          ...styles.warningBanner(theme),
          ...(isMobile ? styles.warningBannerMobile : {})
        }}>
          <div style={{
            ...styles.warningIcon,
            ...(isMobile ? styles.warningIconMobile : {})
          }}>⚠️</div>
          <div style={{
            ...styles.warningText(theme),
            ...(isMobile ? styles.warningTextMobile : {})
          }}>SCREENSHOT AND SEND TO SEEKERS</div>
        </div>

        <div style={{
          ...styles.buttonContainer,
          ...(isMobile ? styles.buttonContainerMobile : {})
        }}>
          <button onClick={onClose} style={{
            ...styles.cancelButton(theme),
            ...(isMobile ? styles.cancelButtonMobile : {})
          }}>
            Cancel
          </button>
          <button onClick={onConfirm || onClose} style={{
            ...styles.playButton(theme),
            ...(isMobile ? styles.playButtonMobile : {})
          }}>
            Play
          </button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  overlay: (theme) => ({
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: theme.colors.modalOverlay,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  }),
  modal: (theme) => ({
    backgroundColor: theme.colors.curseModal,
    borderRadius: '16px',
    padding: '0',
    maxWidth: '700px',
    width: '90%',
    maxHeight: '90vh',
    overflowY: 'auto',
    boxShadow: '0 8px 40px rgba(139, 0, 139, 0.6)',
    border: `3px solid ${theme.colors.cursePurple}`,
  }),
  modalMobile: (theme) => ({
    maxWidth: '95vw',
    maxHeight: '95vh',
    border: `2px solid ${theme.colors.cursePurple}`,
  }),
  header: (theme) => ({
    backgroundColor: theme.colors.cursePurple,
    padding: '25px',
    borderTopLeftRadius: '16px',
    borderTopRightRadius: '16px',
    textAlign: 'center',
  }),
  headerMobile: {
    padding: '20px',
  },
  curseName: (theme) => ({
    fontSize: '32px',
    fontWeight: 'bold',
    color: theme.colors.white,
    margin: 0,
    textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)',
  }),
  curseNameMobile: {
    fontSize: '24px',
  },
  curseTextSection: (theme) => ({
    padding: '30px',
    backgroundColor: theme.colors.curseTextBg,
    minHeight: '150px',
  }),
  curseTextSectionMobile: {
    padding: '20px',
    minHeight: '120px',
  },
  curseText: (theme) => ({
    fontSize: '18px',
    lineHeight: '1.8',
    color: theme.colors.white,
    margin: 0,
    textAlign: 'left',
  }),
  curseTextMobile: {
    fontSize: '16px',
    lineHeight: '1.6',
  },
  castingCostSection: (theme) => ({
    padding: '25px 30px',
    backgroundColor: theme.colors.curseCostBg,
    borderTop: `2px solid ${theme.colors.cursePurple}`,
    borderBottom: `2px solid ${theme.colors.cursePurple}`,
  }),
  castingCostSectionMobile: {
    padding: '20px',
  },
  castingCostTitle: (theme) => ({
    fontSize: '18px',
    fontWeight: 'bold',
    color: theme.colors.cursePlum,
    marginBottom: '15px',
    marginTop: 0,
  }),
  costItems: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  costItem: (theme) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '10px 15px',
    backgroundColor: theme.colors.curseItemBg,
    borderRadius: '8px',
    border: `1px solid ${theme.colors.cursePurple}`,
  }),
  costIcon: {
    fontSize: '24px',
    flexShrink: 0,
  },
  costText: (theme) => ({
    fontSize: '16px',
    color: theme.colors.white,
  }),
  warningBanner: (theme) => ({
    backgroundColor: theme.colors.warningYellow,
    padding: '20px',
    textAlign: 'center',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '15px',
  }),
  warningBannerMobile: {
    padding: '15px',
    gap: '10px',
    flexDirection: 'column',
  },
  warningIcon: {
    fontSize: '32px',
  },
  warningIconMobile: {
    fontSize: '24px',
  },
  warningText: (theme) => ({
    fontSize: '20px',
    fontWeight: 'bold',
    color: theme.colors.black,
    letterSpacing: '1px',
  }),
  warningTextMobile: {
    fontSize: '14px',
  },
  buttonContainer: {
    display: 'flex',
    width: '100%',
    gap: '0',
  },
  buttonContainerMobile: {
    gap: '0',
  },
  cancelButton: (theme) => ({
    flex: 1,
    padding: '18px',
    backgroundColor: theme.colors.buttonSecondary,
    color: theme.colors.white,
    border: 'none',
    borderBottomLeftRadius: '16px',
    cursor: 'pointer',
    fontSize: '18px',
    fontWeight: 'bold',
    transition: 'background-color 0.2s',
    textTransform: 'uppercase',
    letterSpacing: '2px',
  }),
  cancelButtonMobile: {
    padding: '14px',
    fontSize: '16px',
  },
  playButton: (theme) => ({
    flex: 1,
    padding: '18px',
    backgroundColor: theme.colors.cursePurple,
    color: theme.colors.white,
    border: 'none',
    borderBottomRightRadius: '16px',
    cursor: 'pointer',
    fontSize: '18px',
    fontWeight: 'bold',
    transition: 'background-color 0.2s',
    textTransform: 'uppercase',
    letterSpacing: '2px',
  }),
  playButtonMobile: {
    padding: '14px',
    fontSize: '16px',
  },
};

export default CurseDisplayModal;
