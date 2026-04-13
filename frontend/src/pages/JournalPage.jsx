import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

const JournalPage = () => {
  const { currentUser } = useAuth();
  const [entries, setEntries] = useState([]);
  const [newEntry, setNewEntry] = useState({ title: '', content: '' });

  useEffect(() => {
    const saved = localStorage.getItem('dnd_journal');
    if (saved) setEntries(JSON.parse(saved));
  }, []);

  const addEntry = () => {
    if (!newEntry.title.trim() || !newEntry.content.trim()) return;
    const entry = {
      id: Date.now(),
      title: newEntry.title,
      content: newEntry.content,
      date: new Date().toLocaleString(),
      author: currentUser?.email || 'Аноним'
    };
    const updated = [entry, ...entries];
    setEntries(updated);
    localStorage.setItem('dnd_journal', JSON.stringify(updated));
    setNewEntry({ title: '', content: '' });
  };

  const deleteEntry = (id) => {
    const updated = entries.filter(e => e.id !== id);
    setEntries(updated);
    localStorage.setItem('dnd_journal', JSON.stringify(updated));
  };

  return (
    <div>
      <div className="section-header">
        <h2><i className="fas fa-book"></i> Журнал приключений</h2>
      </div>

      {/* Новая запись */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <h3><i className="fas fa-feather-alt"></i> Новая запись</h3>
        <input
          placeholder="Заголовок"
          value={newEntry.title}
          onChange={(e) => setNewEntry({...newEntry, title: e.target.value})}
          style={{ marginBottom: '1rem', width: '100%' }}
        />
        <textarea
          rows="4"
          placeholder="Что произошло в последней сессии? Добыча, враги, диалоги..."
          value={newEntry.content}
          onChange={(e) => setNewEntry({...newEntry, content: e.target.value})}
          style={{ width: '100%', marginBottom: '1rem', resize: 'vertical', fontFamily: 'inherit' }}
        />
        <button className="btn btn-primary" onClick={addEntry}>
          <i className="fas fa-save"></i> Добавить запись
        </button>
      </div>

      {/* Список записей */}
      <div className="section-header">
        <h3>Архив записей ({entries.length})</h3>
      </div>

      {entries.length === 0 && (
        <div className="card" style={{ textAlign: 'center', color: '#9ab3d0' }}>
          📖 Пока нет записей. Напишите первую!
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {entries.map(entry => (
          <div key={entry.id} className="card" style={{ transition: '0.2s' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.3rem', wordBreak: 'break-word' }}>{entry.title}</h3>
              <button 
                className="btn" 
                style={{ background: '#aa4a4a', padding: '0.3rem 0.8rem' }} 
                onClick={() => deleteEntry(entry.id)}
              >
                <i className="fas fa-trash"></i> Удалить
              </button>
            </div>
            <p style={{ color: '#9ab3d0', fontSize: '0.8rem', marginBottom: '1rem' }}>
              <i className="fas fa-calendar-alt"></i> {entry.date} — <i className="fas fa-user"></i> {entry.author}
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