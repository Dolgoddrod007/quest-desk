import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import SearchBar from './components/SearchBar';
import HomePage from './pages/HomePage';
import PartiesPage from './pages/PartiesPage';
import CharacterPage from './pages/CharacterPage';
import MasterPage from './pages/MasterPage';
import SchedulerPage from './pages/SchedulerPage';
import JournalPage from './pages/JournalPage';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginModal from './components/LoginModal';
import RegisterModal from './components/RegisterModal';
import './App.css';

function AppContent() {
  const { currentUser, login, register } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  // Правильная передача аргументов в login/register
  const handleLogin = (email, password) => login(email, password);
  const handleRegister = (email, password, role) => register(email, password, role);

  return (
    <div className="app-container">
      <Header
        onShowLogin={() => setShowLoginModal(true)}
        onShowRegister={() => setShowRegisterModal(true)}
      />
      <SearchBar />
      <div className="app-main">
        <Sidebar />
        <main className="content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/parties" element={<PartiesPage />} />
            <Route path="/character" element={<CharacterPage />} />
            <Route path="/master" element={<MasterPage />} />
            <Route path="/scheduler" element={<SchedulerPage />} />
            <Route path="/journal" element={<JournalPage />} />
          </Routes>
        </main>
      </div>

      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLogin={handleLogin}
      />
      <RegisterModal
        isOpen={showRegisterModal}
        onClose={() => setShowRegisterModal(false)}
        onRegister={handleRegister}
      />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;