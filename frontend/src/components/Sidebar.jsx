import React from 'react';

const Sidebar = () => {
  const categories = [
    { icon: 'fas fa-gamepad', name: 'Аркады' },
    { icon: 'fas fa-question-circle', name: 'Викторины' },
    { icon: 'fas fa-puzzle-piece', name: 'Головоломки' },
    { icon: 'fas fa-coffee', name: 'Казуальные' },
    { icon: 'fas fa-fist-raised', name: 'Боевики' },
    { icon: 'fas fa-map', name: 'Приключения' }
  ];

  const popular = [
    { icon: 'fas fa-star', name: 'Новинки' },
    { icon: 'fas fa-tags', name: 'Скидки' },
    { icon: 'fas fa-gift', name: 'Бесплатные игры' }
  ];

  return (
    <aside className="sidebar" style={{
      width: '280px',
      background: '#141d2b',
      padding: '2rem 1.8rem',
      borderRight: '1px solid #26374b'
    }}>
      <div className="side-block" style={{ marginBottom: '2.5rem' }}>
        <div className="side-title" style={{
          fontSize: '1.3rem',
          fontWeight: 700,
          color: '#6ec8e0',
          marginBottom: '1.2rem',
          borderLeft: '4px solid #2a9d8f',
          paddingLeft: '1rem'
        }}>
          ВСЕ КАТЕГОРИИ
        </div>
        <ul style={{ listStyle: 'none' }}>
          {categories.map(cat => (
            <li key={cat.name} style={{
              padding: '0.5rem 0',
              color: '#b9cef0',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              cursor: 'pointer',
              borderRadius: '12px',
              transition: '0.2s'
            }}>
              <i className={cat.icon} style={{ width: '24px', color: '#2a9d8f' }}></i>
              {cat.name}
            </li>
          ))}
        </ul>
      </div>

      <div className="side-block" style={{ marginBottom: '2.5rem' }}>
        <div className="side-title" style={{
          fontSize: '1.3rem',
          fontWeight: 700,
          color: '#6ec8e0',
          marginBottom: '1.2rem',
          borderLeft: '4px solid #2a9d8f',
          paddingLeft: '1rem'
        }}>
          Популярные разделы
        </div>
        <ul style={{ listStyle: 'none' }}>
          {popular.map(pop => (
            <li key={pop.name} style={{
              padding: '0.5rem 0',
              color: '#b9cef0',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              cursor: 'pointer'
            }}>
              <i className={pop.icon} style={{ width: '24px', color: '#2a9d8f' }}></i>
              {pop.name}
            </li>
          ))}
        </ul>
      </div>

      <div className="promo-card" style={{
        background: '#1e2a3c',
        borderRadius: '24px',
        padding: '1.2rem',
        marginBottom: '1.2rem',
        border: '1px solid #3e5e78'
      }}>
        <h4 style={{ fontSize: '1.3rem', color: '#c0e6ff' }}>Path of Exile 2</h4>
        <p style={{ color: '#9ebfe0', margin: '4px 0' }}>Ранний доступ уже открыт</p>
        <button className="btn-outline btn" style={{ marginTop: '10px' }}>
          <i className="fas fa-play"></i> Попробовать
        </button>
      </div>
      
      <div className="promo-card" style={{
        background: '#1e2a3c',
        borderRadius: '24px',
        padding: '1.2rem',
        border: '1px solid #3e5e78'
      }}>
        <h4 style={{ fontSize: '1.3rem', color: '#c0e6ff' }}>Path of Exile 2</h4>
        <p style={{ color: '#9ebfe0', margin: '4px 0' }}>Ранний доступ уже открыт</p>
        <button className="btn-outline btn" style={{ marginTop: '10px' }}>
          <i className="fas fa-play"></i> Попробовать
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;