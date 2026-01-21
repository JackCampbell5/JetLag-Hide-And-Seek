import React from 'react';
import { useIsMobile } from '../../hooks/useMediaQuery';

const ResetConfirmationModal = ({ isOpen, onClose, onConfirm }) => {
  const isMobile = useIsMobile();

  if (!isOpen) return null;

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={{
        ...styles.modal,
        ...(isMobile ? styles.modalMobile : {})
      }} onClick={(e) => e.stopPropagation()}>
        <div style={{
          ...styles.header,
          ...(isMobile ? styles.headerMobile : {})
        }}>
          <h2 style={{
            ...styles.title,
            ...(isMobile ? styles.titleMobile : {})
          }}>Reset Game Progress?</h2>
        </div>

        <div style={{
          ...styles.content,
          ...(isMobile ? styles.contentMobile : {})
        }}>
          <div style={styles.warningIcon}>⚠️</div>
          <p style={{
            ...styles.warningText,
            ...(isMobile ? styles.warningTextMobile : {})
          }}>
            This will permanently reset:
          </p>
          <ul style={styles.resetList}>
            <li>Your current hand (all cards will be cleared)</li>
            <li>Total cards drawn statistic</li>
            <li>Total cards played statistic</li>
            <li>Games completed statistic</li>
          </ul>
          <p style={{
            ...styles.confirmText,
            ...(isMobile ? styles.confirmTextMobile : {})
          }}>
            Are you sure you want to continue?
          </p>
        </div>

        <div style={{
          ...styles.buttonContainer,
          ...(isMobile ? styles.buttonContainerMobile : {})
        }}>
          <button onClick={onClose} style={{
            ...styles.cancelButton,
            ...(isMobile ? styles.cancelButtonMobile : {})
          }}>
            Cancel
          </button>
          <button onClick={onConfirm} style={{
            ...styles.confirmButton,
            ...(isMobile ? styles.confirmButtonMobile : {})
          }}>
            Reset
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
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modal: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '0',
    maxWidth: '500px',
    width: '90%',
    maxHeight: '90vh',
    overflowY: 'auto',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
    border: '2px solid #f44336',
  },
  modalMobile: {
    maxWidth: '95vw',
    maxHeight: '95vh',
  },
  header: {
    backgroundColor: '#f44336',
    padding: '20px',
    borderTopLeftRadius: '12px',
    borderTopRightRadius: '12px',
    textAlign: 'center',
  },
  headerMobile: {
    padding: '15px',
  },
  title: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: 'white',
    margin: 0,
  },
  titleMobile: {
    fontSize: '20px',
  },
  content: {
    padding: '30px',
    textAlign: 'center',
  },
  contentMobile: {
    padding: '20px',
  },
  warningIcon: {
    fontSize: '48px',
    marginBottom: '15px',
  },
  warningText: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '15px',
  },
  warningTextMobile: {
    fontSize: '16px',
  },
  resetList: {
    textAlign: 'left',
    margin: '20px auto',
    maxWidth: '400px',
    lineHeight: '1.8',
    color: '#555',
  },
  confirmText: {
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#f44336',
    marginTop: '20px',
  },
  confirmTextMobile: {
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
  cancelButton: {
    flex: 1,
    padding: '16px',
    backgroundColor: '#757575',
    color: 'white',
    border: 'none',
    borderBottomLeftRadius: '12px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 'bold',
    transition: 'background-color 0.2s',
    textTransform: 'uppercase',
  },
  cancelButtonMobile: {
    padding: '14px',
    fontSize: '14px',
  },
  confirmButton: {
    flex: 1,
    padding: '16px',
    backgroundColor: '#f44336',
    color: 'white',
    border: 'none',
    borderBottomRightRadius: '12px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 'bold',
    transition: 'background-color 0.2s',
    textTransform: 'uppercase',
  },
  confirmButtonMobile: {
    padding: '14px',
    fontSize: '14px',
  },
};

export default ResetConfirmationModal;
