import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useCharacters } from '../hooks/useApi';
import { useCampaigns } from '../hooks/useApi';

const CharacterPage = () => {
  const { currentUser } = useAuth();
  const { campaigns, fetchCampaigns } = useCampaigns();
  const { characters, loading, fetchCharacters, createCharacter, updateCharacter, deleteCharacter } = useCharacters();

  const [selectedCharacterId, setSelectedCharacterId] = useState('');
  const [character, setCharacter] = useState({
    name: '',
    race: '',
    class_name: '',
    level: 1,
    campaign_id: '',
    stats: {
      strength: 10,
      dexterity: 10,
      constitution: 10,
      intelligence: 10,
      wisdom: 10,
      charisma: 10,
    },
    inventory: [],
  });

  const [editMode, setEditMode] = useState(false);
  const [tempChar, setTempChar] = useState(character);

  useEffect(() => {
    fetchCampaigns();
    fetchCharacters();
  }, []);

  useEffect(() => {
    if (characters.length > 0 && !selectedCharacterId) {
      setSelectedCharacterId(characters[0].id);
    }
  }, [characters, selectedCharacterId]);

  useEffect(() => {
    if (!selectedCharacterId) return;
    const selected = characters.find((c) => c.id === selectedCharacterId);
    if (selected) {
      setCharacter(selected);
      setTempChar({
        ...selected,
        campaign_id: selected.campaign?.id || selected.campaign_id || '',
      });
    }
  }, [characters, selectedCharacterId]);

  const usedCampaignIds = new Set(
    characters
      .map((c) => c.campaign?.id || c.campaign_id)
      .filter(Boolean)
  );
  const availableCampaigns = campaigns.filter((campaign) => !usedCampaignIds.has(campaign.id));

  const resetNewCharacter = () => {
    const defaultCampaignId = availableCampaigns[0]?.id || '';
    if (!defaultCampaignId) {
      alert('Нет доступных партий для нового персонажа');
      return;
    }
    const fresh = {
      name: '',
      race: '',
      class_name: '',
      level: 1,
      campaign_id: defaultCampaignId,
      stats: {
        strength: 10,
        dexterity: 10,
        constitution: 10,
        intelligence: 10,
        wisdom: 10,
        charisma: 10,
      },
      inventory: [],
    };
    setCharacter(fresh);
    setTempChar(fresh);
    setSelectedCharacterId('');
    setEditMode(true);
  };

  const saveCharacter = async () => {
    try {
      if (character.id) {
        await updateCharacter(character.id, {
          name: tempChar.name,
          race: tempChar.race,
          class_name: tempChar.class_name,
          level: tempChar.level,
          stats: tempChar.stats,
          inventory: tempChar.inventory,
        });
      } else {
        if (!tempChar.campaign_id) {
          alert('Выберите кампанию для персонажа');
          return;
        }
        const created = await createCharacter({
          name: tempChar.name,
          race: tempChar.race,
          class_name: tempChar.class_name,
          level: tempChar.level,
          stats: tempChar.stats,
          inventory: tempChar.inventory,
          campaign_id: tempChar.campaign_id,
          user_id: currentUser.id,
        });
        setSelectedCharacterId(created.id);
      }
      fetchCharacters();
      setEditMode(false);
    } catch (err) {
      console.error('Ошибка при сохранении персонажа:', err);
      const apiError = err.response?.data;
      const firstError = apiError && typeof apiError === 'object' ? Object.values(apiError)[0] : null;
      const message = Array.isArray(firstError)
        ? firstError[0]
        : (typeof firstError === 'string' ? firstError : (apiError?.detail || 'Не удалось сохранить персонажа'));
      alert(message);
    }
  };

  const handleDeleteCharacter = async () => {
    if (!character?.id) return;
    const isConfirmed = window.confirm(`Удалить персонажа "${character.name}"?`);
    if (!isConfirmed) return;

    try {
      await deleteCharacter(character.id);
      const remaining = characters.filter((c) => c.id !== character.id);
      setSelectedCharacterId(remaining[0]?.id || '');
      if (remaining.length === 0) {
        resetNewCharacter();
      }
      fetchCharacters();
    } catch (err) {
      console.error('Ошибка при удалении персонажа:', err);
      alert('Не удалось удалить персонажа');
    }
  };

  const calcMod = (score) => Math.floor((score - 10) / 2);

  const attrList = Object.entries(character.stats || {});

  if (loading) return <div>Загрузка персонажей...</div>;

  return (
    <>
      <div className="section-header">
        <h2>Лист персонажа</h2>
        <div style={{ display: 'flex', gap: '0.6rem' }}>
          <button className="btn" onClick={resetNewCharacter}>
            <i className="fas fa-plus"></i> Новый персонаж
          </button>
          {selectedCharacterId && (
            <button className="btn" onClick={handleDeleteCharacter}>
              <i className="fas fa-trash"></i> Удалить
            </button>
          )}
          <button className="btn btn-primary" onClick={() => editMode ? saveCharacter() : setEditMode(true)}>
            <i className={`fas fa-${editMode ? 'save' : 'edit'}`}></i> {editMode ? 'Сохранить' : 'Редактировать'}
          </button>
        </div>
      </div>

      <div className="card">
        {editMode ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <label>Кампания</label>
            <select
              value={tempChar.campaign_id || ''}
              onChange={(e) => setTempChar({ ...tempChar, campaign_id: e.target.value })}
            >
              <option value="">Выберите кампанию</option>
              {(selectedCharacterId ? campaigns : availableCampaigns).map((campaign) => (
                <option key={campaign.id} value={campaign.id}>
                  {campaign.name}
                </option>
              ))}
            </select>
            <label>Имя персонажа</label>
            <input value={tempChar.name} onChange={e => setTempChar({ ...tempChar, name: e.target.value })} placeholder="Имя" />
            <label>Раса</label>
            <input value={tempChar.race} onChange={e => setTempChar({ ...tempChar, race: e.target.value })} placeholder="Раса" />
            <label>Класс</label>
            <input value={tempChar.class_name} onChange={e => setTempChar({ ...tempChar, class_name: e.target.value })} placeholder="Класс" />
            <label>Уровень</label>
            <input type="number" value={tempChar.level} onChange={e => setTempChar({ ...tempChar, level: parseInt(e.target.value) || 1 })} placeholder="Уровень" />
            <h4>Характеристики</h4>
            {Object.keys(tempChar.stats || {}).map(attr => (
              <div key={attr} style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <span style={{ width: '100px' }}>{attr.toUpperCase()}</span>
                <input type="number" value={tempChar.stats[attr]} onChange={e => setTempChar({
                  ...tempChar,
                  stats: { ...tempChar.stats, [attr]: parseInt(e.target.value) || 0 }
                })} style={{ width: '80px' }} />
                <span>Модификатор: {calcMod(tempChar.stats[attr]) >= 0 ? '+' : ''}{calcMod(tempChar.stats[attr])}</span>
              </div>
            ))}
          </div>
        ) : selectedCharacterId ? (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3>{character.name} — {character.race} {character.class_name}, уровень {character.level}</h3>
            </div>
            <div className="attr-strip">
              {attrList.map(([attr, val]) => (
                <span key={attr} className="attr-pill">
                  {attr.slice(0, 3).toUpperCase()} {val} ({calcMod(val) >= 0 ? '+' : ''}{calcMod(val)})
                </span>
              ))}
            </div>
          </>
        ) : (
          <p style={{ color: '#9ab3d0' }}>У вас пока нет персонажей. Нажмите "Новый персонаж".</p>
        )}
      </div>

    </>
  );
};

export default CharacterPage;