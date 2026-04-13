import React from 'react';

const PartyCard = ({ party, onJoin, onCopyInvite }) => {
  const handleJoinClick = () => {
    if (onJoin) onJoin(party);
  };

  const handleCopyClick = () => {
    if (onCopyInvite) onCopyInvite(party.inviteCode);
  };

  return (
    <div className="card party-card" style={{ transition: '0.2s' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
        <h3 style={{ margin: 0, fontSize: '1.3rem', wordBreak: 'break-word' }}>{party.name}</h3>
        <i className="fas fa-users" style={{ color: '#6ec8e0', fontSize: '1.2rem' }}></i>
      </div>
      
      <p style={{ color: '#9ab3d0', marginBottom: '0.8rem' }}>{party.desc || 'Нет описания'}</p>
      
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.8rem', fontSize: '0.9rem' }}>
        <span><strong>Мастер:</strong> {party.master}</span>
        <span><strong>Участников:</strong> {party.members}</span>
      </div>
      
      <div style={{ display: 'flex', gap: '0.6rem', marginTop: '0.5rem' }}>
        <button 
          className="btn" 
          onClick={handleCopyClick}
          style={{ background: '#2d4b5a', border: '1px solid #3e6a7c' }}
        >
          <i className="fas fa-link"></i> Код
        </button>
        <button 
          className="btn btn-primary" 
          onClick={handleJoinClick}
        >
          <i className="fas fa-door-open"></i> Войти
        </button>
      </div>
    </div>
  );
};

export default PartyCard;