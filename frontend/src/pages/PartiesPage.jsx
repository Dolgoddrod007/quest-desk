import React, { useState, useEffect } from 'react';

const PartiesPage = () => {
  const [parties, setParties] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [newPartyName, setNewPartyName] = useState('');
  const [newPartyDesc, setNewPartyDesc] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('dnd_parties');
    if (saved) {
      setParties(JSON.parse(saved));
    } else {
      const defaultParties = [
        { id: 1, name: 'Подземье Фандалина', desc: 'Поиски рудника', master: 'master@dnd.com', members: 4, inviteCode: 'FAN123' },
        { id: 2, name: 'Врата Балдура', desc: 'Тени в порту', master: 'admin@camp.ru', members: 5, inviteCode: 'BALDUR' }
      ];
      setParties(defaultParties);
      localStorage.setItem('dnd_parties', JSON.stringify(defaultParties));
    }
  }, []);

  const createParty = () => {
    if (!newPartyName.trim()) return;
    const newParty = {
      id: Date.now(),
      name: newPartyName,
      desc: newPartyDesc || 'Новая партия',
      master: 'Мастер',
      members: 1,
      inviteCode: Math.random().toString(36).substring(2, 8).toUpperCase()
    };
    const updated = [...parties, newParty];
    setParties(updated);
    localStorage.setItem('dnd_parties', JSON.stringify(updated));
    setShowCreateModal(false);
    setNewPartyName('');
    setNewPartyDesc('');
  };

  const joinParty = () => {
    const party = parties.find(p => p.inviteCode === joinCode.toUpperCase());
    if (party) {
      alert(`Вы присоединились к партии "${party.name}"`);
      const updated = parties.map(p =>
        p.id === party.id ? { ...p, members: p.members + 1 } : p
      );
      setParties(updated);
      localStorage.setItem('dnd_parties', JSON.stringify(updated));
      setJoinCode('');
      setShowJoinModal(false);
    } else {
      alert('Неверный код приглашения');
    }
  };

  const copyInvite = (code) => {
    navigator.clipboard?.writeText(code);
    alert('Код скопирован!');
  };

  // Стили для кастомной модалки
  const modalOverlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: 'rgba(2, 8, 18, 0.95)',
    backdropFilter: 'blur(8px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2000,
  };
  const modalCardStyle = {
    background: 'linear-gradient(135deg, #1e2b3f 0%, #16212e 100%)',
    maxWidth: '500px',
    width: '90%',
    borderRadius: '30px',
    padding: '2rem',
    border: '1px solid rgba(42, 157, 143, 0.5)',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)',
  };

  return (
    <>
      <div className="section-header">
        <h2>Все партии</h2>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button
            style={{ background: 'transparent', border: '1px solid #2a9d8f', color: '#c6edff', padding: '0.5rem 1.2rem', borderRadius: '40px', cursor: 'pointer' }}
            onClick={() => setShowJoinModal(true)}
          >
            <i className="fas fa-sign-in-alt"></i> Вступить по коду
          </button>
          <button
            style={{ background: '#2a9d8f', color: '#0c1a1f', border: 'none', padding: '0.5rem 1.2rem', borderRadius: '40px', cursor: 'pointer' }}
            onClick={() => setShowCreateModal(true)}
          >
            <i className="fas fa-plus"></i> Создать партию
          </button>
        </div>
      </div>

      <div className="grid-2">
        {parties.map(party => (
          <div key={party.id} className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0 }}>{party.name}</h3>
              <i className="fas fa-users"></i>
            </div>
            <p style={{ color: '#9ab3d0' }}>{party.desc}</p>
            <p><strong>Мастер:</strong> {party.master}</p>
            <p><strong>Участников:</strong> {party.members}</p>
            <div style={{ display: 'flex', gap: '0.6rem', marginTop: '1rem' }}>
              <button
                style={{ background: '#2d4b5a', color: 'white', border: '1px solid #3e6a7c', padding: '0.5rem 1.2rem', borderRadius: '40px', cursor: 'pointer' }}
                onClick={() => copyInvite(party.inviteCode)}
              >
                <i className="fas fa-link"></i> Код
              </button>
              <button
                style={{ background: '#2a9d8f', color: '#0c1a1f', border: 'none', padding: '0.5rem 1.2rem', borderRadius: '40px', cursor: 'pointer' }}
                onClick={() => setShowJoinModal(true)}
              >
                <i className="fas fa-door-open"></i> Войти
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Кастомная модалка создания партии */}
      {showCreateModal && (
        <div style={modalOverlayStyle} onClick={() => setShowCreateModal(false)}>
          <div style={modalCardStyle} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginBottom: '1.5rem', color: '#6ec8e0' }}>Создать партию</h3>
            <label>Название партии *</label>
            <input
              type="text"
              value={newPartyName}
              onChange={(e) => setNewPartyName(e.target.value)}
              style={{ width: '100%', marginBottom: '1rem', padding: '0.5rem', borderRadius: '8px', background: '#0f1a27', border: '1px solid #2a9d8f', color: 'white' }}
            />
            <label>Описание</label>
            <textarea
              value={newPartyDesc}
              onChange={(e) => setNewPartyDesc(e.target.value)}
              rows="2"
              style={{ width: '100%', marginBottom: '1rem', padding: '0.5rem', borderRadius: '8px', background: '#0f1a27', border: '1px solid #2a9d8f', color: 'white' }}
            ></textarea>
            <button
              onClick={createParty}
              style={{ background: '#2a9d8f', color: '#0c1a1f', border: 'none', padding: '0.5rem 1.2rem', borderRadius: '40px', cursor: 'pointer', width: '100%' }}
            >
              Создать
            </button>
            <button
              onClick={() => setShowCreateModal(false)}
              style={{ marginTop: '1rem', background: 'transparent', border: '1px solid #2a9d8f', color: '#c6edff', padding: '0.5rem 1.2rem', borderRadius: '40px', cursor: 'pointer', width: '100%' }}
            >
              Отмена
            </button>
          </div>
        </div>
      )}

      {/* Кастомная модалка вступления */}
      {showJoinModal && (
        <div style={modalOverlayStyle} onClick={() => setShowJoinModal(false)}>
          <div style={modalCardStyle} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginBottom: '1.5rem', color: '#6ec8e0' }}>Вступить в партию</h3>
            <label>Введите код-приглашение</label>
            <input
              type="text"
              placeholder="Например: FAN123"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value)}
              style={{ width: '100%', marginBottom: '1rem', padding: '0.5rem', borderRadius: '8px', background: '#0f1a27', border: '1px solid #2a9d8f', color: 'white' }}
            />
            <button
              onClick={joinParty}
              style={{ background: '#2a9d8f', color: '#0c1a1f', border: 'none', padding: '0.5rem 1.2rem', borderRadius: '40px', cursor: 'pointer', width: '100%' }}
            >
              Присоединиться
            </button>
            <button
              onClick={() => setShowJoinModal(false)}
              style={{ marginTop: '1rem', background: 'transparent', border: '1px solid #2a9d8f', color: '#c6edff', padding: '0.5rem 1.2rem', borderRadius: '40px', cursor: 'pointer', width: '100%' }}
            >
              Отмена
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default PartiesPage;