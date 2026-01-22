import React from "react";
import { useTheme } from "../../context/ThemeContext";
import { useIsMobile } from "../../hooks/useMediaQuery";

const ResetConfirmationModal = ({ isOpen, onClose, onConfirm }) => {
  const { theme } = useTheme();
  const isMobile = useIsMobile();

  if (!isOpen) return null;

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
            ...styles.header(theme),
            ...(isMobile ? styles.headerMobile : {}),
          }}
        >
          <h2
            style={{
              ...styles.title(theme),
              ...(isMobile ? styles.titleMobile : {}),
            }}
          >
            Reset Game Progress?
          </h2>
        </div>

        <div
          style={{
            ...styles.content(theme),
            ...(isMobile ? styles.contentMobile : {}),
          }}
        >
          <div style={styles.warningIcon}>⚠️</div>
          <p
            style={{
              ...styles.warningText(theme),
              ...(isMobile ? styles.warningTextMobile : {}),
            }}
          >
            This will permanently reset:
          </p>
          <ul style={styles.resetList(theme)}>
            <li>Your current hand (all cards will be cleared)</li>
            <li>Total cards drawn statistic</li>
            <li>Total cards played statistic</li>
            <li>Games completed statistic</li>
          </ul>
          <p
            style={{
              ...styles.confirmText(theme),
              ...(isMobile ? styles.confirmTextMobile : {}),
            }}
          >
            Are you sure you want to continue?
          </p>
        </div>

        <div
          style={{
            ...styles.buttonContainer,
            ...(isMobile ? styles.buttonContainerMobile : {}),
          }}
        >
          <button
            onClick={onClose}
            style={{
              ...styles.cancelButton(theme),
              ...(isMobile ? styles.cancelButtonMobile : {}),
            }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            style={{
              ...styles.confirmButton(theme),
              ...(isMobile ? styles.confirmButtonMobile : {}),
            }}
          >
            Reset
          </button>
        </div>
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
    padding: "0",
    maxWidth: "500px",
    width: "90%",
    maxHeight: "90vh",
    overflowY: "auto",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)",
    border: `2px solid ${theme.colors.danger}`,
  }),
  modalMobile: {
    maxWidth: "95vw",
    maxHeight: "95vh",
  },
  header: (theme) => ({
    backgroundColor: theme.colors.danger,
    padding: "20px",
    borderTopLeftRadius: "12px",
    borderTopRightRadius: "12px",
    textAlign: "center",
  }),
  headerMobile: {
    padding: "15px",
  },
  title: (theme) => ({
    fontSize: "24px",
    fontWeight: "bold",
    color: theme.colors.text,
    margin: 0,
  }),
  titleMobile: {
    fontSize: "20px",
  },
  content: (theme) => ({
    padding: "30px",
    textAlign: "center",
    color: theme.colors.text,
  }),
  contentMobile: {
    padding: "20px",
  },
  warningIcon: {
    fontSize: "48px",
    marginBottom: "15px",
  },
  warningText: (theme) => ({
    fontSize: "18px",
    fontWeight: "bold",
    color: theme.colors.text,
    marginBottom: "15px",
  }),
  warningTextMobile: {
    fontSize: "16px",
  },
  resetList: (theme) => ({
    textAlign: "left",
    margin: "20px auto",
    maxWidth: "400px",
    lineHeight: "1.8",
    color: theme.colors.textSecondary,
  }),
  confirmText: (theme) => ({
    fontSize: "16px",
    fontWeight: "bold",
    color: theme.colors.danger,
    marginTop: "20px",
  }),
  confirmTextMobile: {
    fontSize: "14px",
  },
  buttonContainer: {
    display: "flex",
    width: "100%",
    gap: "0",
  },
  buttonContainerMobile: {
    gap: "0",
  },
  cancelButton: (theme) => ({
    flex: 1,
    padding: "16px",
    backgroundColor: theme.colors.cardGreen,
    color: theme.colors.text,
    border: "none",
    borderBottomLeftRadius: "12px",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: "bold",
    transition: "background-color 0.2s",
    textTransform: "uppercase",
  }),
  cancelButtonMobile: {
    padding: "14px",
    fontSize: "14px",
  },
  confirmButton: (theme) => ({
    flex: 1,
    padding: "16px",
    backgroundColor: theme.colors.danger,
    color: theme.colors.text,
    border: "none",
    borderBottomRightRadius: "12px",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: "bold",
    transition: "background-color 0.2s",
    textTransform: "uppercase",
  }),
  confirmButtonMobile: {
    padding: "14px",
    fontSize: "14px",
  },
};

export default ResetConfirmationModal;
