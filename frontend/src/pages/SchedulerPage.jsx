import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useCampaigns, useSessions } from '../hooks/useApi';
import Modal from '../components/Modal';

const SchedulerPage = () => {
  const { currentUser } = useAuth();
  const { campaigns, fetchCampaigns } = useCampaigns();
  const masterCampaigns = campaigns.filter((campaign) => campaign.master?.id === currentUser?.id);
  const [selectedCampaignId, setSelectedCampaignId] = useState('');
  const { sessions, loading, fetchSessions, createSession, deleteSession } = useSessions(selectedCampaignId || null);

  const [showModal, setShowModal] = useState(false);
  const [newSession, setNewSession] = useState({
    title: '',
    start_time: '',
    duration_minutes: 120,
  });
  const [error, setError] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const addSession = async () => {
    if (!newSession.title.trim() || !newSession.start_time) {
      setError('Заполните название и дату/время');
      return;
    }
    if (!selectedCampaignId) {
      setError('Выберите кампанию');
      return;
    }

    const duration = Number(newSession.duration_minutes);
    if (!Number.isFinite(duration) || duration < 30 || duration > 480) {
      setError('Длительность должна быть от 30 до 480 минут');
      return;
    }

    const parsedStart = new Date(newSession.start_time);
    if (Number.isNaN(parsedStart.getTime())) {
      setError('Некорректный формат даты/времени');
      return;
    }

    setIsCreating(true);
    setError('');

    try {
      await createSession({
        title: newSession.title,
        // Приводим datetime-local к ISO, чтобы DRF всегда корректно парсил.
        start_time: parsedStart.toISOString(),
        duration_minutes: Math.round(duration),
        status: 'scheduled',
        campaign_id: selectedCampaignId,
      });

      setShowModal(false);
      setNewSession({ title: '', start_time: '', duration_minutes: 120 });
      fetchSessions();
    } catch (err) {
      const apiError = err.response?.data;
      const firstError = apiError && typeof apiError === 'object' ? Object.values(apiError)[0] : null;
      const message = Array.isArray(firstError)
        ? firstError[0]
        : (typeof firstError === 'string' ? firstError : (apiError?.detail || 'Ошибка при создании сессии'));
      setError(message);
      console.error(err);
    } finally {
      setIsCreating(false);
    }
  };

  useEffect(() => {
    if (!Array.isArray(masterCampaigns) || masterCampaigns.length === 0) {
      setSelectedCampaignId('');
      return;
    }

    const hasSelectedInList = masterCampaigns.some((campaign) => campaign.id === selectedCampaignId);
    if (!hasSelectedInList) {
      setSelectedCampaignId(masterCampaigns[0].id);
    }
  }, [masterCampaigns, selectedCampaignId]);

  useEffect(() => {
    if (!selectedCampaignId) return;
    fetchSessions();
  }, [selectedCampaignId]);

  const handleDeleteSession = async (id) => {
    try {
      await deleteSession(id);
      fetchSessions();
    } catch (err) {
      setError('Ошибка при удалении сессии');
      console.error(err);
    }
  };

  return (
    <>
      <div className="section-header">
        <h2>Планировщик сессий</h2>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <i className="fas fa-calendar-plus"></i> Создать сессию
        </button>
      </div>

      <div className="card" style={{ marginBottom: '1rem' }}>
        <label>Кампания для просмотра/создания сессий</label>
        <select
          value={selectedCampaignId}
          onChange={(e) => setSelectedCampaignId(e.target.value)}
          style={{ marginTop: '0.5rem' }}
        >
          {masterCampaigns.map((campaign) => (
            <option key={campaign.id} value={campaign.id}>
              {campaign.name}
            </option>
          ))}
        </select>
      </div>

      {loading && <div className="card">Загрузка сессий...</div>}

      {sessions.length === 0 && !loading && (
        <div className="card" style={{ textAlign: 'center' }}>
          <p>Нет запланированных сессий. Создайте первую!</p>
        </div>
      )}

      <div className="grid-2">
        {sessions.map(session => (
          <div key={session.id} className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <h3>{session.title}</h3>
            </div>
            <p><i className="fas fa-calendar-alt"></i> {new Date(session.start_time).toLocaleString()}</p>
            <p><i className="fas fa-hourglass"></i> Длительность: {session.duration_minutes} мин</p>
            <p><i className="fas fa-user-friends"></i> Участников: {session.availabilities?.length || 0}</p>
            <div style={{ display: 'flex', gap: '0.6rem', marginTop: '1rem' }}>
              {(session.status === 'scheduled' || session.status === 'completed') && (
                <button
                  className="btn"
                  onClick={() => handleDeleteSession(session.id)}
                >
                  <i className="fas fa-trash"></i> Удалить
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Новая игровая сессия">
        {error && <div className="error-message">{error}</div>}

        <label>Название сессии</label>
        <input
          value={newSession.title}
          onChange={e => setNewSession({ ...newSession, title: e.target.value })}
          placeholder="Название сессии"
        />

        <label>Дата и время начала</label>
        <input
          type="datetime-local"
          value={newSession.start_time}
          onChange={e => setNewSession({ ...newSession, start_time: e.target.value })}
          required
        />

        <label>Длительность (минуты)</label>
        <input
          type="number"
          min="30"
          max="480"
          value={newSession.duration_minutes}
          onChange={e => setNewSession({ ...newSession, duration_minutes: e.target.value })}
        />

        <button
          className="btn btn-primary"
          onClick={addSession}
          disabled={isCreating}
          style={{ marginTop: '1.5rem', width: '100%' }}
        >
          {isCreating ? 'Создание...' : 'Создать сессию'}
        </button>
      </Modal>
    </>
  );
};

export default SchedulerPage;