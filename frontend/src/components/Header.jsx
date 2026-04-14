import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Header = ({ onShowLogin, onShowRegister }) => {
  const { currentUser, logout } = useAuth();
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Главная', icon: 'fas fa-home', requiresMaster: false, requiresPlayer: false },
    { path: '/parties', label: 'Партии', icon: 'fas fa-users', requiresMaster: false, requiresPlayer: false },
    { path: '/character', label: 'Персонаж', icon: 'fas fa-user', requiresMaster: false, requiresPlayer: true },
    { path: '/master', label: 'Мастерская', icon: 'fas fa-dice-d20', requiresMaster: true },
    { path: '/scheduler', label: 'Планировщик', icon: 'fas fa-calendar', requiresMaster: true },
    { path: '/journal', label: 'Журнал', icon: 'fas fa-book', requiresMaster: false, requiresPlayer: false },
  ];

  // Проверяем если мастер (пока проверяем по упрощённой логике)
  const isMaster = currentUser?.role === 'master';

  return (
    <header
      className="header"
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: '#1b2337',
        padding: '0.7rem 2.5rem',
        borderBottom: '2px solid #2e4d5e',
      }}
    >

      <div className="nav-links" style={{ display: 'flex', gap: '2.5rem', fontWeight: 600 }}>
        {navItems
          .filter(item => (!item.requiresMaster || isMaster) && (!item.requiresPlayer || !isMaster))
          .map((item) => (
            <Link
              key={item.path}
              to={item.path}
              style={{
                color: '#b7d9f0',
                textDecoration: 'none',
                fontSize: '1.1rem',
                transition: '0.2s',
                padding: '0.3rem 0',
                borderBottom:
                  location.pathname === item.path ? '2px solid #6ec8e0' : '2px solid transparent',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginTop: '10px',
              }}
            >
              <i className={item.icon}></i> {item.label}
            </Link>
          ))}
      </div>

      <div className="user-bar" style={{ display: 'flex', gap: '0.7rem', alignItems: 'center' }}>
        {currentUser ? (
          <>
            <span
              style={{
                color: '#6ec8e0',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginTop: '15px',
              }}
            >
              <i className="fas fa-user-circle"></i>
              {currentUser.email}
              <span
                style={{
                  fontSize: '0.75rem',
                  background: '#2a9d8f',
                  padding: '2px 8px',
                  borderRadius: '20px',
                }}
              >
                {currentUser.role === 'master' ? 'Мастер' : 'Игрок'}
              </span>
            </span>
            <button
              className="btn"
              onClick={logout}
              style={{ background: 'none', border: '1px solid #6ec8e0', color: '#6ec8e0', marginTop: '15px' }}
            >
              <i className="fas fa-sign-out-alt"></i> Выйти
            </button>
          </>
        ) : (
          <>
            <button
              className="btn"
              onClick={onShowLogin}
              style={{ background: 'none', border: '1px solid #6ec8e0', color: '#6ec8e0' }}
            >
              <i className="fas fa-sign-in-alt"></i> Вход
            </button>
            <button
              className="btn btn-primary"
              onClick={onShowRegister}
              style={{ background: '#2a9d8f', border: 'none', color: 'white' }}
            >
              <i className="fas fa-user-plus"></i> Регистрация
            </button>
          </>
        )}
      </div>
    </header>
  );
};

export default Header;