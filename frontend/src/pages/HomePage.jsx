import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useCampaigns } from '../hooks/useApi';
import axiosInstance from '../api/axiosInstance';

const HomePage = () => {
  const { currentUser } = useAuth();
  const { campaigns, fetchCampaigns, createCampaign } = useCampaigns();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPartyName, setNewPartyName] = useState('');
  const [newPartyDesc, setNewPartyDesc] = useState('');
  const [scheduledSessions, setScheduledSessions] = useState([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);

  useEffect(() => {
    fetchCampaigns();
  }, []);

  useEffect(() => {
    const fetchScheduledSessions = async () => {
      if (!Array.isArray(campaigns) || campaigns.length === 0) {
        setScheduledSessions([]);
        return;
      }

      setSessionsLoading(true);
      try {
        const responses = await Promise.all(
          campaigns.map((campaign) => axiosInstance.get(`/sessions/?campaign_id=${campaign.id}`))
        );

        const allSessions = responses.flatMap((response, index) => {
          const data = Array.isArray(response.data) ? response.data : (response.data?.results || []);
          return data.map((session) => ({
            ...session,
            campaignName: campaigns[index]?.name || 'Кампания',
          }));
        });

        const upcoming = allSessions
          .filter((session) => session.status === 'scheduled')
          .sort((a, b) => new Date(a.start_time) - new Date(b.start_time));

        setScheduledSessions(upcoming);
      } catch (err) {
        console.error('Ошибка загрузки сессий:', err);
        setScheduledSessions([]);
      } finally {
        setSessionsLoading(false);
      }
    };

    fetchScheduledSessions();
  }, [campaigns]);

  const createParty = async () => {
    if (currentUser?.role !== 'master') return;
    if (!newPartyName.trim()) return;
    await createCampaign({
      name: newPartyName,
      description: newPartyDesc || '',
      master_id: currentUser?.id,
    });
    fetchCampaigns();
    setShowCreateModal(false);
    setNewPartyName('');
    setNewPartyDesc('');
  };

  const copyInvite = (code) => {
    navigator.clipboard?.writeText(code);
    alert('Код скопирован!');
  };

  // Стили для кастомных модалок
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
        <h2>Ваши партии</h2>
        {currentUser?.role === 'master' ? (
          <button
            style={{ background: '#2a9d8f', color: '#0c1a1f', border: 'none', padding: '0.5rem 1.2rem', borderRadius: '40px', cursor: 'pointer' }}
            onClick={() => setShowCreateModal(true)}
          >
            <i className="fas fa-plus"></i> Создать партию
          </button>
        ) : (
          <span style={{ color: '#999', fontSize: '0.9rem' }}>
            Игроки не могут создавать партии
          </span>
        )}
      </div>

      <div className="grid-2">
        {campaigns.map(party => (
          <div key={party.id} className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span><strong>{party.name}</strong></span>
              <i className="fas fa-users"></i>
            </div>
            <p>{party.description || 'Без описания'} · участников: {party.members?.length || 0}</p>
            <div style={{ display: 'flex', gap: '0.6rem', marginTop: '1rem' }}>
              <button
                style={{ background: '#2d4b5a', color: 'white', border: '1px solid #3e6a7c', padding: '0.5rem 1.2rem', borderRadius: '40px', cursor: 'pointer' }}
                onClick={() => copyInvite(party.invite_code)}
              >
                <i className="fas fa-link"></i> ссылка
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="section-header">
        <h4>Ближайшие сессии</h4>
      </div>

      {sessionsLoading ? (
        <div className="card">Загрузка сессий...</div>
      ) : scheduledSessions.length === 0 ? (
        <div className="card" style={{ color: '#9ab3d0' }}>
          Запланированных сессий пока нет
        </div>
      ) : (
        <div className="grid-2">
          {scheduledSessions.map((session) => (
            <div key={session.id} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <strong>{session.title}</strong>
                <i className="fas fa-calendar-check" style={{ color: '#2a9d8f' }}></i>
              </div>
              <div style={{ color: '#9ab3d0' }}>
                <div><strong>Кампания:</strong> {session.campaignName}</div>
                <div><strong>Дата:</strong> {new Date(session.start_time).toLocaleString('ru-RU')}</div>
              </div>
            </div>
          ))}
        </div>
      )}

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
    </>
  );
};

export default HomePage;