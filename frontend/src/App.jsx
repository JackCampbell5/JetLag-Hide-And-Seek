import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { GameProvider } from './context/GameContext';
import { ThemeProvider } from './context/ThemeContext';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import GameBoard from './components/Game/GameBoard';

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <h2>Loading...</h2>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
};

// Public Route component (redirect to game if already logged in)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <h2>Loading...</h2>
      </div>
    );
  }

  return isAuthenticated ? <Navigate to="/game" /> : children;
};

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          }
        />
        <Route
          path="/game"
          element={
            <ProtectedRoute>
              <GameBoard />
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Navigate to="/game" />} />
      </Routes>
    </BrowserRouter>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <GameProvider>
          <AppRoutes />
        </GameProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
