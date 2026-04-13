import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Modal from '../components/Modal';

const SchedulerPage = () => {
  const { currentUser } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newSession, setNewSession] = useState({ date: '', time: '', title: '', maxPlayers: 4 });

  useEffect(() => {
    const saved = localStorage.getItem('dnd_sessions');
    if (saved) setSessions(JSON.parse(saved));
  }, []);

  const addSession = () => {
    if (!newSession.date || !newSession.time) return;
    const session = {
      id: Date.now(),
      ...newSession,
      players: [currentUser?.email || 'Игрок'],
      createdBy: currentUser?.email
    };
    const updated = [...sessions, session];
    setSessions(updated);
    localStorage.setItem('dnd_sessions', JSON.stringify(updated));
    setShowModal(false);
    setNewSession({ date: '', time: '', title: '', maxPlayers: 4 });
  };

  const joinSession = (id) => {
    const session = sessions.find(s => s.id === id);
    if (session.players.length >= session.maxPlayers) {
      alert('Мест нет');
      return;
    }
    if (session.players.includes(currentUser?.email)) {
      alert('Вы уже записаны');
      return;
    }
    const updated = sessions.map(s => s.id === id ? { ...s, players: [...s.players, currentUser?.email] } : s);
    setSessions(updated);
    localStorage.setItem('dnd_sessions', JSON.stringify(updated));
  };

  const cancelSession = (id) => {
    const updated = sessions.filter(s => s.id !== id);
    setSessions(updated);
    localStorage.setItem('dnd_sessions', JSON.stringify(updated));
  };

  return (
    <>
      <div className="section-header">
        <h2>Планировщик сессий</h2>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <i className="fas fa-calendar-plus"></i> Создать сессию
        </button>
      </div>

      {sessions.length === 0 && (
        <div className="card" style={{ textAlign: 'center' }}>
          <p>Нет запланированных сессий. Создайте первую!</p>
        </div>
      )}

      <div className="grid-2">
        {sessions.map(session => (
          <div key={session.id} className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <h3>{session.title || 'Сессия D&D'}</h3>
              <span className="attr-pill">{session.players.length}/{session.maxPlayers}</span>
            </div>
            <p><i className="fas fa-calendar-alt"></i> {session.date} в {session.time}</p>
            <p><i className="fas fa-user-friends"></i> Игроки: {session.players.join(', ') || '—'}</p>
            <div style={{ display: 'flex', gap: '0.6rem', marginTop: '1rem' }}>
              <button className="btn btn-primary" onClick={() => joinSession(session.id)}>
                <i className="fas fa-check"></i> Записаться
              </button>
              {session.createdBy === currentUser?.email && (
                <button className="btn" onClick={() => cancelSession(session.id)}>
                  <i className="fas fa-trash"></i> Отменить
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Новая игровая сессия">
        <label>Название (необязательно)</label>
        <input value={newSession.title} onChange={e => setNewSession({...newSession, title: e.target.value})} />
        <label>Дата</label>
        <input type="date" value={newSession.date} onChange={e => setNewSession({...newSession, date: e.target.value})} required />
        <label>Время</label>
        <input type="time" value={newSession.time} onChange={e => setNewSession({...newSession, time: e.target.value})} required />
        <label>Максимум игроков</label>
        <input type="number" min="1" max="10" value={newSession.maxPlayers} onChange={e => setNewSession({...newSession, maxPlayers: parseInt(e.target.value)})} />
        <button className="btn btn-primary" onClick={addSession} style={{ marginTop: '1.5rem', width: '100%' }}>
          Создать сессию
        </button>
      </Modal>
    </>
  );
};

export default SchedulerPage;