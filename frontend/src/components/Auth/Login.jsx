import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const Login = () => {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(credentials);
      navigate('/game');
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  return (
    <div style={styles.container(theme)}>
      <div style={styles.card(theme)}>
        <h1 style={styles.title(theme)}>JetLag Card Game</h1>
        <h2 style={styles.subtitle(theme)}>Login</h2>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label(theme)}>Username</label>
            <input
              type="text"
              name="username"
              value={credentials.username}
              onChange={handleChange}
              required
              style={styles.input(theme)}
              disabled={loading}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label(theme)}>Password</label>
            <input
              type="password"
              name="password"
              value={credentials.password}
              onChange={handleChange}
              required
              style={styles.input(theme)}
              disabled={loading}
            />
          </div>

          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p style={styles.link(theme)}>
          Don't have an account? <Link to="/register" style={styles.linkText}>Register</Link>
        </p>
      </div>
    </div>
  );
};

const styles = {
  container: (theme) => ({
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: theme.colors.background,
  }),
  card: (theme) => ({
    backgroundColor: theme.colors.backgroundCard,
    padding: '40px',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    width: '100%',
    maxWidth: '400px',
    border: `1px solid ${theme.colors.border}`,
  }),
  title: (theme) => ({
    fontSize: '28px',
    textAlign: 'center',
    marginBottom: '10px',
    color: theme.colors.text,
  }),
  subtitle: (theme) => ({
    fontSize: '20px',
    textAlign: 'center',
    marginBottom: '30px',
    color: theme.colors.textSecondary,
  }),
  form: {
    display: 'flex',
    flexDirection: 'column',
  },
  inputGroup: {
    marginBottom: '20px',
  },
  label: (theme) => ({
    display: 'block',
    marginBottom: '5px',
    color: theme.colors.text,
    fontWeight: '500',
  }),
  input: (theme) => ({
    width: '100%',
    padding: '10px',
    border: `1px solid ${theme.colors.inputBorder}`,
    borderRadius: '4px',
    fontSize: '16px',
    boxSizing: 'border-box',
    backgroundColor: theme.colors.input,
    color: theme.colors.text,
  }),
  button: {
    padding: '12px',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '16px',
    cursor: 'pointer',
    fontWeight: '500',
  },
  error: {
    backgroundColor: '#f44336',
    color: 'white',
    padding: '10px',
    borderRadius: '4px',
    marginBottom: '20px',
    textAlign: 'center',
  },
  link: (theme) => ({
    textAlign: 'center',
    marginTop: '20px',
    color: theme.colors.textSecondary,
  }),
  linkText: {
    color: '#4CAF50',
    textDecoration: 'none',
    fontWeight: '500',
  },
};

export default Login;
