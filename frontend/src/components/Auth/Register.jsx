import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useGame } from '../../context/GameContext';
import GameSizeSelector from '../Game/GameSizeSelector';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const { theme } = useTheme();
  const { gameSize, updateGameSize } = useGame();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      await register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
      });
      navigate('/game');
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div style={styles.container(theme)}>
      <div style={styles.card(theme)}>
        <h1 style={styles.title(theme)}>JetLag Card Game</h1>
        <h2 style={styles.subtitle(theme)}>Register</h2>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label(theme)}>Username</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              minLength={3}
              style={styles.input(theme)}
              disabled={loading}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label(theme)}>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
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
              value={formData.password}
              onChange={handleChange}
              required
              minLength={6}
              style={styles.input(theme)}
              disabled={loading}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label(theme)}>Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              style={styles.input(theme)}
              disabled={loading}
            />
          </div>

          <div style={styles.gameSizeContainer}>
            <p style={styles.description(theme)}>
              Choose which card difficulty level to play with. This determines which values are shown on your cards.
            </p>
            <GameSizeSelector gameSize={gameSize} onGameSizeChange={updateGameSize} />
          </div>

          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? 'Creating Account...' : 'Register'}
          </button>
        </form>

        <p style={styles.link(theme)}>
          Already have an account? <Link to="/login" style={styles.linkText}>Login</Link>
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
  gameSizeContainer: {
    marginBottom: '20px',
  },
  description: (theme) => ({
    fontSize: '14px',
    color: theme.colors.textSecondary,
    marginBottom: '10px',
    textAlign: 'center',
  }),
};

export default Register;
