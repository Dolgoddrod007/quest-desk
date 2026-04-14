import React, { useState } from 'react';
import './Modal.css';

const RegisterModal = ({ isOpen, onClose, onRegister }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [password_confirm, setPasswordConfirm] = useState('');
  const [avatar_url, setAvatarUrl] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!username.trim()) {
      setError('Имя пользователя обязательно');
      return;
    }
    if (!email.includes('@')) {
      setError('Некорректный email');
      return;
    }
    if (password.length < 6) {
      setError('Пароль должен быть минимум 6 символов');
      return;
    }
    if (password !== password_confirm) {
      setError('Пароли не совпадают');
      return;
    }

    setIsLoading(true);

    try {
      const result = await onRegister({
        username,
        email,
        password,
        password_confirm,
        avatar_url: avatar_url || null
      });

      if (result && !result.success) {
        setError(result.message || 'Ошибка регистрации');
      } else if (result && result.success) {
        setUsername('');
        setEmail('');
        setPassword('');
        setPasswordConfirm('');
        setAvatarUrl('');
        onClose();
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
            <i className="fas fa-user-plus"></i> Регистрация
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
            />
          </div>

          <div className="form-group">
            <label>
              <i className="fas fa-envelope"></i> Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@dnd.com"
              required
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

          <div className="form-group">
            <label>
              <i className="fas fa-lock"></i> Подтвердите пароль
            </label>
            <input
              type="password"
              value={password_confirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              placeholder="••••••"
              required
            />
          </div>

          <div className="form-group">
            <label>
              <i className="fas fa-image"></i> URL аватара (опционально)
            </label>
            <input
              type="url"
              value={avatar_url}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="https://example.com/avatar.jpg"
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={isLoading}
            style={{ width: '100%', marginTop: '1rem' }}
          >
            {isLoading ? 'Регистрация...' : 'Зарегистрироваться'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegisterModal;