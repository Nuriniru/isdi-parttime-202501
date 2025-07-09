import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/Login-page';
import RegisterPage from './pages/Register-page';
import HomePage from './pages/Home-page';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/';
import { getUserFromStorage } from './utils/auth';
import './global.css'

function PrivateRoute({ children }) {
  const user = getUserFromStorage();
  return user ? children : <Navigate to="/" replace />;
}

function PublicRoute({ children }) {
  const user = getUserFromStorage();
  return user ? <Navigate to="/home" replace /> : children;
}

function App() {
  return (
    <Router>
      <Routes>
        <Route 
          path="/" 
          element={
            <PublicRoute>
              <LandingPage />
            </PublicRoute>
          } 
        />
        <Route 
          path="/login" 
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          } 
        />
        <Route 
          path="/register" 
          element={
            <PublicRoute>
              <RegisterPage />
            </PublicRoute>
          } 
        />
        <Route 
          path="/home" 
          element={
            <PrivateRoute>
              <HomePage />
            </PrivateRoute>
          } 
        />
        <Route 
          path="/profile" 
          element={
            <PrivateRoute>
              <ProfilePage />
            </PrivateRoute>
          } 
        />
        <Route 
          path="/settings" 
          element={
            <PrivateRoute>
              <SettingsPage />
            </PrivateRoute>
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;