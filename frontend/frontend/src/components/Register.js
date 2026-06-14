import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Login.css';
import { apiUrl } from '../api';

function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      const response = await fetch(apiUrl('/api/register'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Что-то пошло не так');
      }
      setMessage('Успешно! Теперь вы можете войти.');
      setUsername('');
      setPassword('');
    } catch (error) {
      setMessage(error.message);
    }
  };

  return (
    <div className="landing-container">
      <header className="landing-header">
        <div className="header-logo">
          <span className="logo-icon">⊕</span>
          <span className="logo-text">AMusic</span>
        </div>
      </header>

      <div className="landing-content">
        <div className="landing-left">
          <h1 className="landing-title">
            Твоя музыка. <span className="accent">Твои правила.</span>
          </h1>
          <p className="landing-description">
            AMusic — это твой личный музык мир. Создавай плейлисты, слушай любимые треки и наслаждайся качественным звуком без ограничений.
          </p>
          <div className="landing-features">
            <div className="feature-item">
              <span className="feature-icon">☁️</span>
              <span>Неограниченное прослушивание</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">🎧</span>
              <span>Твои плейлисты</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">⚡</span>
              <span>Высокое качество</span>
            </div>
          </div>
        </div>

        <div className="landing-right">
          <form className="auth-form" onSubmit={handleSubmit}>
            <h2>РЕГИСТРАЦИЯ</h2>
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
            <div className="form-group">
              <label htmlFor="confirmPassword">Подтвердите пароль</label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit">ЗАРЕГИСТРИРОВАТЬСЯ</button>
            {message && <p className="message">{message}</p>}
            <p className="switch-form-text">
              Уже есть аккаунт? <Link to="/login">Войти</Link>
            </p>
          </form>
        </div>
      </div>

      <footer className="landing-footer">
        © 2026 <span className="accent">AMusic</span>. Все права защищены.
      </footer>
    </div>
  );
}

export default Register;