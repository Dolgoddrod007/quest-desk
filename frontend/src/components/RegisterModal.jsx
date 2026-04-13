import React, { useState } from 'react';

const RegisterModal = ({ isOpen, onClose, onRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('player');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    const result = onRegister(email, password, role);
    if (result && !result.success) {
      setError(result.message);
    } else if (result && result.success) {
      // Очистка полей и закрытие окна при успехе
      setEmail('');
      setPassword('');
      setRole('player');
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <h3>Регистрация</h3>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <label>Пароль</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <label>Роль</label>
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="player">Игрок</option>
            <option value="master">Мастер</option>
          </select>
          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '1rem' }}
          >
            Зарегистрироваться
          </button>
        </form>
        <button className="btn" onClick={onClose} style={{ marginTop: '1rem' }}>
          Закрыть
        </button>
      </div>
    </div>
  );
};

export default RegisterModal;