import { NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { moduleCatalog } from '../data/modules';
import { useAuth } from '../context/AuthContext';
import { useProgress } from '../context/ProgressContext';

function Sidebar({ isDarkMode, onToggleTheme }) {
  const navigate = useNavigate();
  const { user, signIn, signOutUser, signUp, firebaseReady } = useAuth();
  const { completedModules, progressPercent, syncError } = useProgress();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState('signin');
  const [authError, setAuthError] = useState('');
  const [busy, setBusy] = useState(false);

  const handleAuth = async (event) => {
    event.preventDefault();
    setAuthError('');
    setBusy(true);
    try {
      if (mode === 'signin') {
        await signIn(email, password);
      } else {
        await signUp(email, password);
      }
      setEmail('');
      setPassword('');
    } catch (error) {
      setAuthError(error.message || 'Authentication failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <aside className="sidebar">
      <div className="brand-block">
        <p className="brand-eyebrow">DIP Learning Studio</p>
        <h1>DIP Toolkit</h1>
        <button className="ghost-btn theme-toggle-btn" onClick={onToggleTheme}>
          {isDarkMode ? 'Switch to Light' : 'Switch to Dark'}
        </button>
        <button className="ghost-btn" onClick={() => navigate('/')}>
          Back to Welcome
        </button>
      </div>

      <section className="progress-card">
        <p className="section-title">Learning Progress</p>
        {user ? (
          <>
            <p className="tiny-note">{completedModules.length} modules marked completed</p>
            <div className="progress-rail" aria-label="Progress">
              <div className="progress-fill" style={{ width: `${progressPercent}%` }} />
            </div>
            <p className="progress-number">{progressPercent}% complete</p>
            {syncError && <p className="error-text">{syncError}</p>}
          </>
        ) : (
          <p className="tiny-note">
            {firebaseReady
              ? 'Sign in to track progress per user. Guest mode keeps exploration fully open.'
              : 'Firebase is not configured yet. Add VITE_FIREBASE_* values to enable sign-in and cloud progress.'}
          </p>
        )}
      </section>

      <nav className="module-nav">
        <NavLink to="/learn" end className={({ isActive }) => `module-link ${isActive ? 'active' : ''}`}>
          Introduction Roadmap
        </NavLink>
        {moduleCatalog.map((moduleInfo) => {
          const done = completedModules.includes(moduleInfo.id);
          return (
            <NavLink
              key={moduleInfo.id}
              to={`/learn/module/${moduleInfo.id}`}
              className={({ isActive }) => `module-link ${isActive ? 'active' : ''} ${done ? 'completed' : ''}`}
            >
              <span>
                {moduleInfo.chapter}
                {done && <em className="module-done">Done</em>}
              </span>
              <strong>
                {done ? '[Done] ' : ''}
                {moduleInfo.title}
              </strong>
            </NavLink>
          );
        })}
      </nav>

      <section className="auth-card">
        {user ? (
          <>
            <p className="section-title">Signed In</p>
            <p className="tiny-note">{user.email}</p>
            <button className="primary-btn" onClick={signOutUser}>
              Sign Out
            </button>
          </>
        ) : (
          <>
            <div className="auth-switch">
              <button
                className={mode === 'signin' ? 'auth-tab active' : 'auth-tab'}
                onClick={() => setMode('signin')}
              >
                Sign In
              </button>
              <button
                className={mode === 'signup' ? 'auth-tab active' : 'auth-tab'}
                onClick={() => setMode('signup')}
              >
                Sign Up
              </button>
            </div>
            <form onSubmit={handleAuth} className="auth-form">
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Email"
                required
              />
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Password"
                minLength={6}
                required
              />
              <button className="primary-btn" type="submit" disabled={busy}>
                {busy ? 'Please wait...' : mode === 'signin' ? 'Sign In' : 'Create Account'}
              </button>
              {authError && <p className="error-text">{authError}</p>}
              {!firebaseReady && <p className="tiny-note">Auth is disabled until Firebase env variables are configured.</p>}
            </form>
          </>
        )}
      </section>
    </aside>
  );
}

export default Sidebar;
