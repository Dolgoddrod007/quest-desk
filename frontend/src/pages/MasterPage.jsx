import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

const MasterPage = () => {
  const { currentUser, isMaster } = useAuth();
  const [notes, setNotes] = useState('');
  const [npcs, setNpcs] = useState([]);
  const [newNpc, setNewNpc] = useState({ name: '', desc: '' });

  useEffect(() => {
    const savedNotes = localStorage.getItem('dnd_master_notes');
    const savedNpcs = localStorage.getItem('dnd_master_npcs');
    if (savedNotes) setNotes(savedNotes);
    if (savedNpcs) setNpcs(JSON.parse(savedNpcs));
  }, []);

  const saveNotes = () => {
    localStorage.setItem('dnd_master_notes', notes);
    alert('📜 Заметки сохранены');
  };

  const addNpc = () => {
    if (!newNpc.name.trim()) return;
    const updated = [...npcs, { ...newNpc, id: Date.now() }];
    setNpcs(updated);
    localStorage.setItem('dnd_master_npcs', JSON.stringify(updated));
    setNewNpc({ name: '', desc: '' });
  };

  const deleteNpc = (id) => {
    const updated = npcs.filter(n => n.id !== id);
    setNpcs(updated);
    localStorage.setItem('dnd_master_npcs', JSON.stringify(updated));
  };

  if (!isMaster) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
        <i className="fas fa-skull" style={{ fontSize: '3rem', color: '#aa4a4a' }}></i>
        <h3>Доступ только для Мастера</h3>
        <p>Войдите в аккаунт с ролью "master"</p>
      </div>
    );
  }

  return (
    <div>
      <div className="section-header">
        <h2><i className="fas fa-dice-d20"></i> Мастерская</h2>
      </div>

      {/* Заметки */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <h3><i className="fas fa-scroll"></i> Секретные заметки кампании</h3>
        <textarea
          rows="6"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Введите сюжетные ходы, тайны, заготовки..."
          style={{
            width: '100%',
            margin: '1rem 0',
            padding: '0.8rem',
            borderRadius: '16px',
            background: '#0f1a27',
            border: '1px solid #2a9d8f',
            color: 'white',
            fontFamily: 'inherit',
            resize: 'vertical',
            fontSize: '0.95rem'
          }}
        />
        <button className="btn btn-primary" onClick={saveNotes}>
          <i className="fas fa-save"></i> Сохранить заметки
        </button>
      </div>

      {/* NPC */}
      <div className="section-header" style={{ flexWrap: 'wrap', gap: '1rem' }}>
        <h3><i className="fas fa-users"></i> NPC & Монстры</h3>
        <button className="btn btn-outline" onClick={addNpc}>
          <i className="fas fa-plus"></i> Добавить NPC
        </button>
      </div>

      {npcs.length === 0 && (
        <div className="card" style={{ textAlign: 'center', color: '#9ab3d0' }}>
          🧙‍♂️ Нет добавленных NPC. Нажмите «Добавить NPC».
        </div>
      )}

      <div className="grid-2">
        {npcs.map(npc => (
          <div key={npc.id} className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <strong style={{ fontSize: '1.1rem' }}>{npc.name}</strong>
              <button 
                className="btn" 
                style={{ background: '#aa4a4a', padding: '0.2rem 0.6rem' }} 
                onClick={() => deleteNpc(npc.id)}
              >
                <i className="fas fa-trash"></i>
              </button>
            </div>
            <p style={{ margin: 0, color: '#b7d9f0' }}>{npc.desc || '📌 Нет описания'}</p>
          </div>
        ))}
      </div>

      {/* Форма добавления */}
      <div className="card" style={{ marginTop: '2rem' }}>
        <h4><i className="fas fa-user-plus"></i> Добавить нового NPC</h4>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'flex-end' }}>
          <div style={{ flex: '1 1 200px' }}>
            <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.85rem' }}>Имя NPC *</label>
            <input
              placeholder="Например: Король Бурлейн"
              value={newNpc.name}
              onChange={(e) => setNewNpc({...newNpc, name: e.target.value})}
              style={{ width: '100%' }}
            />
          </div>
          <div style={{ flex: '2 1 300px' }}>
            <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.85rem' }}>Описание / статы</label>
            <input
              placeholder="Характеристики, фразы, роль в сюжете"
              value={newNpc.desc}
              onChange={(e) => setNewNpc({...newNpc, desc: e.target.value})}
              style={{ width: '100%' }}
            />
          </div>
          <button className="btn btn-primary" onClick={addNpc}>
            <i className="fas fa-save"></i> Сохранить
          </button>
        </div>
      </div>
    </div>
  );
};

export default MasterPage;