import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNotes } from '../hooks/useApi';

const MasterPage = () => {
  const { currentUser } = useAuth();
  const { notes, loading, fetchNotes, createNote, updateNote, deleteNote } = useNotes();

  const [notes_content, setNotesContent] = useState('');
  const [npcs, setNpcs] = useState([]);
  const [newNpc, setNewNpc] = useState({ name: '', content: '', type: 'npc' });
  const [error, setError] = useState('');

  useEffect(() => {
    fetchNotes();
  }, []);

  // Filter to get only quest notes for master
  useEffect(() => {
    const questNotes = notes.filter(n => n.type === 'npc' || n.type === 'quest');
    setNpcs(questNotes);
  }, [notes]);

  const saveNotes = async () => {
    // This would be saved to a master_notes model in the future
    localStorage.setItem('dnd_master_notes', notes_content);
    alert('📜 Заметки сохранены');
  };

  const addNpc = async () => {
    if (!newNpc.name.trim()) {
      setError('Имя обязательно');
      return;
    }

    try {
      await createNote({
        title: newNpc.name,
        content: newNpc.content,
        type: newNpc.type,
        campaign_id: currentUser?.campaign_id || null,
        author_id: currentUser?.id,
        is_public: false,
        status: 'active'
      });

      setNewNpc({ name: '', content: '', type: 'npc' });
      setError('');
      fetchNotes();
    } catch (err) {
      setError('Ошибка при добавлении NPC');
      console.error(err);
    }
  };

  const deleteNpc = async (id) => {
    try {
      await deleteNote(id);
      fetchNotes();
    } catch (err) {
      setError('Ошибка при удалении NPC');
      console.error(err);
    }
  };

  // Check if user is master (by checking their role or campaign)
  // For now, allow all authenticated users to access this page
  // In production, should check user.role === 'master' or similar

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
          value={notes_content}
          onChange={(e) => setNotesContent(e.target.value)}
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
      </div>

      {/* Форма добавления NPC */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <h4>Добавить нового NPC</h4>
        {error && <div className="error-message">{error}</div>}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <input
            type="text"
            value={newNpc.name}
            onChange={(e) => setNewNpc({ ...newNpc, name: e.target.value })}
            placeholder="Имя NPC"
          />

          <textarea
            rows="3"
            value={newNpc.content}
            onChange={(e) => setNewNpc({ ...newNpc, content: e.target.value })}
            placeholder="Описание, статистика, поведение..."
            style={{ fontFamily: 'inherit' }}
          />

          <select
            value={newNpc.type}
            onChange={(e) => setNewNpc({ ...newNpc, type: e.target.value })}
          >
            <option value="npc">NPC</option>
            <option value="quest">Квест</option>
          </select>

          <button className="btn btn-primary" onClick={addNpc}>
            <i className="fas fa-plus"></i> Добавить
          </button>
        </div>
      </div>

      {loading && <div className="card">Загрузка...</div>}

      {npcs.length === 0 && !loading && (
        <div className="card" style={{ textAlign: 'center', color: '#9ab3d0' }}>
          🧙‍♂️ Нет добавленных NPC. Нажмите «Добавить».
        </div>
      )}

      <div className="grid-2">
        {npcs.map(npc => (
          <div key={npc.id} className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <strong style={{ fontSize: '1.1rem' }}>{npc.title}</strong>
              <button
                className="btn"
                style={{ background: '#aa4a4a', padding: '0.2rem 0.6rem' }}
                onClick={() => deleteNpc(npc.id)}
              >
                <i className="fas fa-trash"></i>
              </button>
            </div>
            <p style={{ margin: 0, color: '#b7d9f0' }}>{npc.content || '📌 Нет описания'}</p>
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
              onChange={(e) => setNewNpc({ ...newNpc, name: e.target.value })}
              style={{ width: '100%' }}
            />
          </div>
          <div style={{ flex: '2 1 300px' }}>
            <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.85rem' }}>Описание / статы</label>
            <input
              placeholder="Характеристики, фразы, роль в сюжете"
              value={newNpc.content}
              onChange={(e) => setNewNpc({ ...newNpc, content: e.target.value })}
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