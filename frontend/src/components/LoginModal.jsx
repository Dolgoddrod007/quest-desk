import React, { useState } from 'react';
import './Modal.css';
const LoginModal = ({ isOpen, onClose, onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await onLogin(username, password);

      if (result && !result.success) {
        setError(result.message || 'Ошибка входа');
      } else if (result && result.success) {
        onClose();
        setUsername('');
        setPassword('');
      }
    } catch (err) {
      setError(err.message || 'Произошла ошибка');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>
            <i className="fas fa-sign-in-alt"></i> Вход в аккаунт
          </h3>
          <button className="modal-close" onClick={onClose}>
            &times;
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>
              <i className="fas fa-user"></i> Имя пользователя
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="your_username"
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label>
              <i className="fas fa-lock"></i> Пароль
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••"
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={isLoading}
            style={{ width: '100%', marginTop: '1rem' }}
          >
            {isLoading ? 'Вход...' : 'Войти'}
          </button>
        </form>

        <div
          className="demo-credentials"
          style={{
            marginTop: '1rem',
            padding: '0.5rem',
            background: 'rgba(42, 157, 143, 0.1)',
            borderRadius: '8px',
            fontSize: '0.8rem',
          }}
        >
          <small>Тестовые данные:</small>
          <br />
          <small>Игрок: player@dnd.com / 1234</small>
          <br />
          <small>Мастер: master@dnd.com / 1234</small>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;