import React from 'react';

const Modal = ({ isOpen, onClose, title, children }) => {

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1rem',
          }}
        >
          <h3 style={{ margin: 0 }}>{title || 'Модальное окно'}</h3>
          <button className="btn" onClick={onClose} style={{ padding: '0.3rem 0.8rem' }}>
            Закрыть
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

export default Modal;