import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useCampaigns, useNotes } from '../hooks/useApi';

const JournalPage = () => {
  const { currentUser } = useAuth();
  const { campaigns, fetchCampaigns } = useCampaigns();
  const { notes, loading, fetchNotes, createNote, deleteNote } = useNotes(null, 'personal');

  const [newEntry, setNewEntry] = useState({ title: '', content: '', campaign_id: '' });
  const [error, setError] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    fetchCampaigns();
    fetchNotes();
  }, []);

  useEffect(() => {
    if (!newEntry.campaign_id && campaigns.length > 0) {
      setNewEntry((prev) => ({ ...prev, campaign_id: campaigns[0].id }));
    }
  }, [campaigns]);

  const addEntry = async () => {
    if (!newEntry.title.trim() || !newEntry.content.trim()) {
      setError('Заполните название и содержание');
      return;
    }
    if (!newEntry.campaign_id) {
      setError('Выберите партию для заметки');
      return;
    }

    setIsCreating(true);
    setError('');

    try {
      await createNote({
        title: newEntry.title,
        content: newEntry.content,
        campaign_id: newEntry.campaign_id,
        author_id: currentUser?.id,
        type: 'personal',
        is_public: false,
      });

      setNewEntry((prev) => ({ ...prev, title: '', content: '' }));
      fetchNotes();
    } catch (err) {
      setError('Ошибка при создании записи');
      console.error(err);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteEntry = async (id) => {
    try {
      await deleteNote(id);
      fetchNotes();
    } catch (err) {
      setError('Ошибка при удалении записи');
      console.error(err);
    }
  };

  return (
    <div>
      <div className="section-header">
        <h2><i className="fas fa-book"></i> Журнал приключений</h2>
      </div>

      {/* Новая запись */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <h3><i className="fas fa-feather-alt"></i> Новая запись</h3>
        {error && <div className="error-message">{error}</div>}
        <label>Партия</label>
        <select
          value={newEntry.campaign_id}
          onChange={(e) => setNewEntry({ ...newEntry, campaign_id: e.target.value })}
          style={{ marginBottom: '1rem', width: '100%' }}
        >
          <option value="">Выберите партию</option>
          {campaigns.map((campaign) => (
            <option key={campaign.id} value={campaign.id}>
              {campaign.name}
            </option>
          ))}
        </select>
        <input
          placeholder="Заголовок"
          value={newEntry.title}
          onChange={(e) => setNewEntry({ ...newEntry, title: e.target.value })}
          style={{ marginBottom: '1rem', width: '100%' }}
        />
        <textarea
          rows="4"
          placeholder="Что произошло в последней сессии? Добыча, враги, диалоги..."
          value={newEntry.content}
          onChange={(e) => setNewEntry({ ...newEntry, content: e.target.value })}
          style={{ width: '100%', marginBottom: '1rem', resize: 'vertical', fontFamily: 'inherit' }}
        />
        <button className="btn btn-primary" onClick={addEntry} disabled={isCreating}>
          <i className="fas fa-save"></i> {isCreating ? 'Добавление...' : 'Добавить запись'}
        </button>
      </div>

      {/* Список записей */}
      <div className="section-header">
        <h3>Архив записей ({notes.length})</h3>
      </div>

      {loading && <div className="card">Загрузка записей...</div>}

      {notes.length === 0 && !loading && (
        <div className="card" style={{ textAlign: 'center', color: '#9ab3d0' }}>
          📖 Пока нет записей. Напишите первую!
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {notes.map(entry => (
          <div key={entry.id} className="card" style={{ transition: '0.2s' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.3rem', wordBreak: 'break-word' }}>{entry.title}</h3>
              <button
                className="btn"
                style={{ background: '#aa4a4a', padding: '0.3rem 0.8rem' }}
                onClick={() => handleDeleteEntry(entry.id)}
              >
                <i className="fas fa-trash"></i> Удалить
              </button>
            </div>
            <p style={{ color: '#9ab3d0', fontSize: '0.8rem', marginBottom: '1rem' }}>
              <i className="fas fa-calendar-alt"></i> {new Date(entry.created_at).toLocaleString()} — <i className="fas fa-user"></i> {entry.author?.username || 'Unknown'}
            </p>
            <p style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', lineHeight: 1.5 }}>
              {entry.content}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default JournalPage;