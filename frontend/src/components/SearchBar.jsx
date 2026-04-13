import React from 'react';

const SearchBar = () => {
  return (
    <div className="search-section" style={{
      background: '#17202f',
      padding: '1.2rem 2.5rem',
      borderBottom: '1px solid #283a4f',
      display: 'flex',
      flexWrap: 'wrap',
      alignItems: 'center',
      gap: '2rem'
    }}>
      <div className="search-box" style={{
        flex: 2,
        minWidth: '240px',
        background: '#0d1422',
        borderRadius: '60px',
        display: 'flex',
        alignItems: 'center',
        padding: '0.2rem 1.8rem',
        border: '1px solid #2f4b60'
      }}>
        <i className="fas fa-search" style={{ color: '#9eb9d8', marginRight: '10px' }}></i>
        <input
          type="text"
          placeholder="Поиск по играм, партиям..."
          style={{
            background: 'transparent',
            border: 'none',
            padding: '0.8rem 0',
            width: '100%',
            color: 'white',
            fontSize: '1rem',
            outline: 'none'
          }}
        />
      </div>
      <div className="cats" style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '1.2rem 2rem',
        color: '#c3d6f1',
        fontWeight: 500
      }}>
        <span>ВСЕ КАТЕГОРИИ:</span>
        <span>Аркады</span>
        <span>Викторины</span>
        <span>Головоломки</span>
        <span>Казуальные</span>
        <span>Боевики</span>
        <span>Приключения</span>
      </div>
    </div>
  );
};

export default SearchBar;