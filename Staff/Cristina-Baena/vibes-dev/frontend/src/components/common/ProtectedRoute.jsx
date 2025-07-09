import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useEffect, useState } from 'react'

const ProtectedRoute = ({ children, requireAuth = true }) => {
  const { isAuthenticated, loading } = useAuth()
  const location = useLocation()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  // Detect logout process
  useEffect(() => {
    if (!isAuthenticated() && !loading) {
      // Check if we're in the process of logging out
      const wasAuthenticated = localStorage.getItem('wasAuthenticated')
      if (wasAuthenticated === 'true') {
        setIsLoggingOut(true)
        localStorage.removeItem('wasAuthenticated')
        // Allow time for navigation to complete
        setTimeout(() => setIsLoggingOut(false), 100)
      }
    } else if (isAuthenticated()) {
      localStorage.setItem('wasAuthenticated', 'true')
    }
  }, [isAuthenticated, loading])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500"></div>
      </div>
    )
  }

  if (requireAuth && !isAuthenticated() && !isLoggingOut) {
    // Redirect to login page with return url
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (!requireAuth && isAuthenticated()) {
    // Redirect authenticated users away from login/register pages
    return <Navigate to="/dashboard" replace />
  }

  return children
}

export default ProtectedRoute