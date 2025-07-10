import React, { createContext, useContext, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { login as loginService, register as registerService, getCurrentUser, updateProfile as updateProfileService, deleteAccount as deleteAccountService } from '../services/authService.js'

const AuthContext = createContext()

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate() 

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchCurrentUser();
    } else {
      setLoading(false); 
    }
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const userData = await getCurrentUser()
      setUser(userData)
      setLoading(false)
    } catch (error) {
     
      logout()
    }
  }

  const login = async (email, password) => {
    try {
      const response = await loginService(email, password)
      
      localStorage.setItem('token', response.data.token)
      setToken(response.data.token)
      setUser(response.data)
      
      // Fetch complete user profile
      try {
        const userData = await getCurrentUser()
        setUser(userData)
      } catch (error) {
        console.warn('Failed to fetch complete user profile:', error.message)
      }
      
      return { success: true, data: response.data }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  const register = async (username, email, password) => {
    try {
      const response = await registerService(username, email, password)
      
      localStorage.setItem('token', response.data.token)
      setToken(response.data.token)
      setUser(response.data)
      setLoading(false)
      
      return { success: true, data: response.data }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  const updateProfile = async (profileData) => {
    try {
     
      const response = await updateProfileService(profileData)

      setUser(response)
      
      await fetchCurrentUser()
      return response
    } catch (error) {
      throw error
    }
  }

  const deleteAccount = async () => {
    try {
      await deleteAccountService()
      logout()
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    sessionStorage.removeItem('token')
    setToken(null)
    setUser(null)
    setLoading(false)
    window.location.href = '/'
  }

  const isAuthenticated = () => {
    
    return !!token;
};

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    getCurrentUser: fetchCurrentUser,
    updateProfile,
    deleteAccount,
    isAuthenticated
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export { AuthContext, AuthProvider }
export default AuthContext
