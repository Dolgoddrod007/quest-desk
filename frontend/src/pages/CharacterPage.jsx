import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

const CharacterPage = () => {
  const { currentUser } = useAuth();
  const [character, setCharacter] = useState({
    name: 'Брунор Железнорук',
    race: 'Дварф',
    class: 'Воин',
    level: 3,
    experience: 2700,
    attributes: {
      сила: 16, ловкость: 12, телосложение: 15,
      интеллект: 10, мудрость: 14, харизма: 8
    },
    hp: { current: 28, max: 28 },
    armorClass: 16,
    proficiencies: 'Все оружие, тяжёлая броня',
    inventory: ['Боевой топор', 'Щит', 'Рацион x5', 'Зелье лечения']
  });

  const [editMode, setEditMode] = useState(false);
  const [tempChar, setTempChar] = useState(character);

  useEffect(() => {
    const saved = localStorage.getItem(`dnd_char_${currentUser?.email || 'guest'}`);
    if (saved) setCharacter(JSON.parse(saved));
  }, [currentUser]);

  const saveCharacter = () => {
    setCharacter(tempChar);
    localStorage.setItem(`dnd_char_${currentUser?.email || 'guest'}`, JSON.stringify(tempChar));
    setEditMode(false);
  };

  const calcMod = (score) => Math.floor((score - 10) / 2);

  const attrList = Object.entries(character.attributes);

  return (
    <>
      <div className="section-header">
        <h2>Лист персонажа</h2>
        <button className="btn btn-primary" onClick={() => editMode ? saveCharacter() : setEditMode(true)}>
          <i className={`fas fa-${editMode ? 'save' : 'edit'}`}></i> {editMode ? 'Сохранить' : 'Редактировать'}
        </button>
      </div>

      <div className="card">
        {editMode ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <input value={tempChar.name} onChange={e => setTempChar({...tempChar, name: e.target.value})} placeholder="Имя" />
            <input value={tempChar.race} onChange={e => setTempChar({...tempChar, race: e.target.value})} placeholder="Раса" />
            <input value={tempChar.class} onChange={e => setTempChar({...tempChar, class: e.target.value})} placeholder="Класс" />
            <input type="number" value={tempChar.level} onChange={e => setTempChar({...tempChar, level: parseInt(e.target.value)})} placeholder="Уровень" />
            <h4>Характеристики</h4>
            {Object.keys(tempChar.attributes).map(attr => (
              <div key={attr} style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <span style={{ width: '100px' }}>{attr.toUpperCase()}</span>
                <input type="number" value={tempChar.attributes[attr]} onChange={e => setTempChar({
                  ...tempChar,
                  attributes: { ...tempChar.attributes, [attr]: parseInt(e.target.value) }
                })} style={{ width: '80px' }} />
                <span>Модификатор: {calcMod(tempChar.attributes[attr]) >= 0 ? '+' : ''}{calcMod(tempChar.attributes[attr])}</span>
              </div>
            ))}
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3>{character.name} — {character.race} {character.class}, уровень {character.level}</h3>
              <span>Опыт: {character.experience}</span>
            </div>
            <div className="attr-strip">
              {attrList.map(([attr, val]) => (
                <span key={attr} className="attr-pill">
                  {attr.slice(0,3).toUpperCase()} {val} ({calcMod(val) >= 0 ? '+' : ''}{calcMod(val)})
                </span>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', marginTop: '1rem' }}>
              <div><strong>❤️ HP:</strong> {character.hp.current}/{character.hp.max}</div>
              <div><strong>🛡️ КД:</strong> {character.armorClass}</div>
              <div><strong>⚔️ Владение:</strong> {character.proficiencies}</div>
            </div>
            <div style={{ marginTop: '1rem' }}>
              <strong>🎒 Инвентарь:</strong>
              <ul>
                {character.inventory.map((item, idx) => <li key={idx}>{item}</li>)}
              </ul>
            </div>
          </>
        )}
      </div>

      <div className="section-header">
        <h3>Заклинания и способности</h3>
      </div>
      <div className="card">
        <p><i className="fas fa-magic"></i> <strong>Боевой вызов</strong> — раз в короткий отдых</p>
        <p><i className="fas fa-shield-alt"></i> <strong>Стойкость дварфа</strong> — сопротивление яду</p>
      </div>
    </>
  );
};

export default CharacterPage;