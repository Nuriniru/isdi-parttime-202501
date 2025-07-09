import React from 'react'
import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'

// Pages
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Profile from './pages/Profile'
import Settings from './pages/Settings'

// Components
import MainLayout from './components/layout/MainLayout'
import ProtectedRoute from './components/common/ProtectedRoute'
import PublicUserProfile from './components/user/PublicUserProfile'

function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gradient-to-br from-purple-900-70 via-purple-800 to-transparent">
        <Routes>
          <Route element={<MainLayout />}>
            {/* Public routes */}
            <Route path="/" element={<Home />} />
            
            {/* Auth routes (redirect if already logged in) */}
            <Route 
              path="/login" 
              element={
                <ProtectedRoute requireAuth={false}>
                  <Login />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/register" 
              element={
                <ProtectedRoute requireAuth={false}>
                  <Register />
                </ProtectedRoute>
              } 
            />
            
            {/* Protected routes */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/settings" 
              element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              } 
            />
            
            {/* User profile route */}
            <Route path="/user/:userId" element={<PublicUserProfile />} />
          </Route>
        </Routes>
      </div>
    </AuthProvider>
  )
}

// Wrap App with Router
function AppWithRouter() {
  return (
    <Router
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <App />
    </Router>
  )
}

export default AppWithRouter
