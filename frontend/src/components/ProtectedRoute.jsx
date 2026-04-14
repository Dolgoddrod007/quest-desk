import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children, requiresMaster = false, requiresPlayer = false }) => {
    const { currentUser, loading } = useAuth();

    if (loading) {
        return <div style={{ padding: '2rem', textAlign: 'center', color: '#6ec8e0' }}>Загрузка...</div>;
    }

    if (!currentUser) {
        return (
            <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
                🔒 <strong>Требуется авторизация</strong>
                <p style={{ color: '#9ab3d0', marginTop: '1rem' }}>Пожалуйста, войдите в свой аккаунт</p>
            </div>
        );
    }

    if (requiresMaster && currentUser.role !== 'master') {
        return (
            <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
                👑 <strong>Доступ только для мастеров</strong>
                <p style={{ color: '#9ab3d0', marginTop: '1rem' }}>
                    Вы можете получить роль мастера в профиле
                </p>
                <p style={{ color: '#7a9fb0', marginTop: '0.5rem', fontSize: '0.9rem' }}>
                    Текущая роль: <strong>{currentUser.role === 'master' ? 'Мастер' : 'Игрок'}</strong>
                </p>
            </div>
        );
    }

    if (requiresPlayer && currentUser.role !== 'player') {
        return (
            <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
                🎭 <strong>Доступ только для игроков</strong>
                <p style={{ color: '#9ab3d0', marginTop: '1rem' }}>
                    Раздел персонажей доступен только игрокам
                </p>
                <p style={{ color: '#7a9fb0', marginTop: '0.5rem', fontSize: '0.9rem' }}>
                    Текущая роль: <strong>{currentUser.role === 'master' ? 'Мастер' : 'Игрок'}</strong>
                </p>
            </div>
        );
    }

    return children;
};

export default ProtectedRoute;
