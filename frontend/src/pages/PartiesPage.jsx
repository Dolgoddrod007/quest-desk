import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useCampaigns } from '../hooks/useApi';

const PartiesPage = () => {
  const { currentUser } = useAuth();
  const { allCampaigns, loading, fetchAllCampaigns, fetchCampaigns, createCampaign, joinCampaignByCode } = useCampaigns();

  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [joinCode, setJoinCode] = useState('');
  const [newCampaignName, setNewCampaignName] = useState('');
  const [newCampaignDesc, setNewCampaignDesc] = useState('');
  const [error, setError] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);

  useEffect(() => {
    fetchAllCampaigns();
  }, []);

  // Фильтруем кампании по поиску
  const filteredCampaigns = Array.isArray(allCampaigns)
    ? allCampaigns.filter(campaign =>
      campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (campaign.description && campaign.description.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    : [];

  const handleCreateCampaign = async () => {
    if (!currentUser) {
      setError('Пожалуйста, авторизуйтесь чтобы создать кампанию');
      setShowCreateModal(false);
      return;
    }

    if (!newCampaignName.trim()) {
      setError('Имя кампании обязательно');
      return;
    }

    setIsCreating(true);
    setError('');

    try {
      await createCampaign({
        name: newCampaignName,
        description: newCampaignDesc || '',
        master_id: currentUser.id
      });

      setNewCampaignName('');
      setNewCampaignDesc('');
      setShowCreateModal(false);
      fetchCampaigns();
      fetchAllCampaigns();
    } catch (err) {
      setError('Ошибка при создании кампании');
      console.error(err);
    } finally {
      setIsCreating(false);
    }
  };

  const copyInvite = (code) => {
    navigator.clipboard?.writeText(code);
    alert('Код скопирован!');
  };

  const openJoinModal = (campaign) => {
    setSelectedCampaign(campaign);
    setJoinCode('');
    setError('');
    setShowJoinModal(true);
  };

  const handleJoinCampaign = async () => {
    if (!selectedCampaign) return;
    if (!joinCode.trim()) {
      setError('Введите код приглашения');
      return;
    }

    setIsJoining(true);
    setError('');
    try {
      await joinCampaignByCode({
        campaignId: selectedCampaign.id,
        inviteCode: joinCode.trim(),
      });
      setShowJoinModal(false);
      fetchAllCampaigns();
      fetchCampaigns();
    } catch (err) {
      const message = err.response?.data?.detail || 'Не удалось присоединиться к кампании';
      setError(message);
    } finally {
      setIsJoining(false);
    }
  };

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
        <h2>Все кампании</h2>
        {currentUser?.role === 'master' ? (
          <button
            style={{ background: '#2a9d8f', color: '#0c1a1f', border: 'none', padding: '0.5rem 1.2rem', borderRadius: '40px', cursor: 'pointer' }}
            onClick={() => setShowCreateModal(true)}
          >
            <i className="fas fa-plus"></i> Создать кампанию
          </button>
        ) : (
          <span style={{ color: '#999', fontSize: '0.9rem' }}>
            Только мастера могут создавать кампании
          </span>
        )}
      </div>

      {/* Поле поиска */}
      <div style={{ marginBottom: '1.5rem' }}>
        <input
          type="text"
          placeholder="Поиск кампаний по названию или описанию..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: '100%',
            padding: '0.8rem 1.2rem',
            borderRadius: '40px',
            border: '1px solid #2a9d8f',
            background: '#0f1a27',
            color: 'white',
            fontSize: '1rem',
            boxSizing: 'border-box'
          }}
        />
      </div>

      {loading && <div className="card">Загрузка кампаний...</div>}

      {!Array.isArray(allCampaigns) && !loading && (
        <div className="card" style={{ textAlign: 'center', color: '#ff6b6b' }}>
          ❌ Ошибка загрузки кампаний. Проверьте консоль.
        </div>
      )}

      {Array.isArray(allCampaigns) && allCampaigns.length === 0 && !loading && (
        <div className="card" style={{ textAlign: 'center', color: '#9ab3d0' }}>
          🎭 Нет кампаний. Создайте первую!
        </div>
      )}

      {searchTerm && filteredCampaigns.length === 0 && Array.isArray(allCampaigns) && (
        <div className="card" style={{ textAlign: 'center', color: '#9ab3d0' }}>
          Кампании не найдены по запросу "{searchTerm}"
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {Array.isArray(allCampaigns) && filteredCampaigns.map(campaign => {
          const isMember = Array.isArray(campaign.members)
            ? campaign.members.some(member => member.user?.id === currentUser?.id)
            : false;
          const isCreatorMaster = campaign.master?.id === currentUser?.id;
          const canCopyCode = isMember || isCreatorMaster;
          const canJoinCampaign = !isMember && currentUser?.role === 'player';

          return (
          <div key={campaign.id} className="card" style={{ cursor: 'pointer' }}>
            <h3>{campaign.name}</h3>
            <p style={{ color: '#9ab3d0', marginBottom: '1rem' }}>{campaign.description || 'Без описания'}</p>
            <div style={{ fontSize: '0.85rem', color: '#7a9fb0', marginBottom: '1rem' }}>
              <div><strong>Мастер:</strong> {campaign.master?.username || 'Unknown'}</div>
              <div><strong>Участников:</strong> {campaign.members?.length || 0}</div>
              <div><strong>Код:</strong> {canCopyCode ? campaign.invite_code : 'Скрыт'}</div>
            </div>
            <div style={{ display: 'flex', gap: '0.6rem' }}>
              <button
                style={{ background: canCopyCode ? '#2a9d8f' : '#2d4b5a', color: canCopyCode ? '#0c1a1f' : '#cfe8f5', border: 'none', padding: '0.5rem', borderRadius: '8px', cursor: canCopyCode ? 'pointer' : 'default', width: '100%' }}
                onClick={() => canCopyCode && copyInvite(campaign.invite_code)}
                disabled={!canCopyCode}
              >
                <i className="fas fa-copy"></i> {canCopyCode ? 'Скопировать код' : 'Код недоступен'}
              </button>
              <button
                style={{ background: !canJoinCampaign ? '#2d4b5a' : '#2a9d8f', color: !canJoinCampaign ? '#cfe8f5' : '#0c1a1f', border: 'none', padding: '0.5rem', borderRadius: '8px', cursor: canJoinCampaign ? 'pointer' : 'default', width: '100%' }}
                onClick={() => canJoinCampaign && openJoinModal(campaign)}
                disabled={!canJoinCampaign}
              >
                {isMember ? 'Вы участник' : (currentUser?.role === 'master' ? 'Мастеру недоступно' : 'Присоединиться')}
              </button>
            </div>
          </div>
        )})}
      </div>

      {/* Modal для создания */}
      {showCreateModal && (
        <div style={modalOverlayStyle} onClick={() => setShowCreateModal(false)}>
          <div style={modalCardStyle} onClick={(e) => e.stopPropagation()}>
            <h3>Создать новую кампанию</h3>
            {error && <div className="error-message">{error}</div>}

            <div style={{ marginBottom: '1rem' }}>
              <label>Названиекампании</label>
              <input
                type="text"
                value={newCampaignName}
                onChange={(e) => setNewCampaignName(e.target.value)}
                placeholder="Название кампании"
                style={{ width: '100%', marginTop: '0.5rem' }}
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label>Описание (опционально)</label>
              <textarea
                value={newCampaignDesc}
                onChange={(e) => setNewCampaignDesc(e.target.value)}
                placeholder="Описание кампании"
                rows="3"
                style={{ width: '100%', marginTop: '0.5rem' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                className="btn btn-primary"
                onClick={handleCreateCampaign}
                disabled={isCreating}
                style={{ flex: 1 }}
              >
                {isCreating ? 'Создание...' : 'Создать'}
              </button>
              <button
                className="btn"
                onClick={() => setShowCreateModal(false)}
                style={{ flex: 1 }}
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}

      {showJoinModal && (
        <div style={modalOverlayStyle} onClick={() => setShowJoinModal(false)}>
          <div style={modalCardStyle} onClick={(e) => e.stopPropagation()}>
            <h3>Присоединиться к кампании</h3>
            <p style={{ color: '#9ab3d0', marginBottom: '1rem' }}>
              Кампания: <strong>{selectedCampaign?.name}</strong>
            </p>
            {error && <div className="error-message">{error}</div>}
            <label>Введите код приглашения</label>
            <input
              type="text"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value)}
              placeholder="Код от мастера"
              style={{ width: '100%', marginTop: '0.5rem', marginBottom: '1rem' }}
            />
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                className="btn btn-primary"
                onClick={handleJoinCampaign}
                disabled={isJoining}
                style={{ flex: 1 }}
              >
                {isJoining ? 'Проверка...' : 'Вступить'}
              </button>
              <button
                className="btn"
                onClick={() => setShowJoinModal(false)}
                style={{ flex: 1 }}
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PartiesPage;