import React, { useState } from 'react';
import { useApp } from '../app/AppContext.jsx';
import { Button } from '../shared/ui/Button.jsx';

export function LoginPage() {
  const { login } = useApp();
  const [email, setEmail] = useState('superadmin@roadmap.local');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');

  function submit(event) {
    event.preventDefault();
    const result = login(email, password);
    if (!result.ok) setError(result.message);
  }

  return (
    <div className="login-page">
      <section className="login-left">
        <div className="eyebrow">Закрытое рабочее пространство</div>
        <div className="login-brand"><span>Roadmap</span> Studio</div>
        <p className="login-copy">
          Система управления дорожными картами, проектами, ролями и доступами. Регистрации нет: пользователей создает и настраивает администратор.
        </p>
        <div className="login-features">
          <div className="login-feature"><strong>Доступ только по учетной записи</strong><span>Пользователь входит по email и паролю, которые выдали внутри системы.</span></div>
          <div className="login-feature"><strong>Роли управляются централизованно</strong><span>Суперадмин задает матрицу прав, администратор управляет пользователями и командами в рамках разрешений.</span></div>
          <div className="login-feature"><strong>Проекты видны не всем</strong><span>Гость и участник видят только те проекты, куда были явно добавлены.</span></div>
        </div>
      </section>

      <section className="login-panel-wrap">
        <form className="login-panel" onSubmit={submit}>
          <h1>Вход в систему</h1>
          <div className="login-note">Без самостоятельной регистрации. Доступ выдает администратор.</div>
          {error ? <div className="login-error">{error}</div> : null}
          <label className="field">
            <span className="label">Email</span>
            <input className="input" type="email" value={email} onChange={event => setEmail(event.target.value)} placeholder="name@company.kz" autoComplete="username" />
          </label>
          <label className="field">
            <span className="label">Пароль</span>
            <input className="input" type="password" value={password} onChange={event => setPassword(event.target.value)} placeholder="Введите пароль" autoComplete="current-password" />
          </label>
          <Button variant="primary" className="btn-md" style={{ width: '100%' }} type="submit">Войти →</Button>
          <div className="login-help">
            Первый вход для демо: <b>superadmin@roadmap.local</b> / <b>admin123</b>. В рабочей версии создайте новых пользователей в разделе «Настройки → Пользователи» и поменяйте пароль суперадмина.
          </div>
        </form>
      </section>
    </div>
  );
}
