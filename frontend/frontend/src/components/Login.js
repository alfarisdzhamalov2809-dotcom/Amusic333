import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './Login.css';
import { apiUrl } from '../api';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      const response = await fetch(apiUrl('/api/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Что-то пошло не так');
      }
      login(data.token);
      navigate('/');
    } catch (error) {
      setMessage(error.message);
    }
  };

  return (
    <div className="landing-container">
      {/* Header */}
      <header className="landing-header">
        <div className="header-logo">
          <span className="logo-icon">⊕</span>
          <span className="logo-text">AMusic</span>
        </div>
        <div className="header-auth-text">
          🔒 Необходима авторизация
        </div>
      </header>

      {/* Main Content */}
      <div className="landing-content">
        {/* Left Column */}
        <div className="landing-left">
          <h1 className="landing-title">
            Твоя музыка. <span className="accent">Твои правила.</span>
          </h1>
          <p className="landing-description">
            AMusic — это место, где ты управляешь своей музыкой. Слушай любимые треки, создавай плейлисты, загружай свои песни для личного использования без ограничений и наслаждайся качественным звуком.
          </p>
          <div className="landing-features">
            <div className="feature-item">
              <span className="feature-icon">☁️</span>
              <span>Загружай свои песни для личного использования без ограничений</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">🚫</span>
              <span>Бесплатное использование без рекламы</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">⚡</span>
              <span>Высокое качество звука</span>
            </div>
          </div>
        </div>

        {/* Right Column - Login Form */}
        <div className="landing-right">
          <form className="auth-form" onSubmit={handleSubmit}>
            <h2>Вход</h2>
            <div className="form-group">
              <label htmlFor="username">Имя пользователя</label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Пароль</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit">Войти</button>
            {message && <p className="message">{message}</p>}
            <p className="switch-form-text">
              Нет аккаунта? <Link to="/register">Зарегистрироваться</Link>
            </p>
          </form>
        </div>
      </div>

      {/* Footer */}
      <footer className="landing-footer">
        © 2026 <span className="accent">AMusic</span>. Все права защищены.
      </footer>
    </div>
  );
}

export default Login;