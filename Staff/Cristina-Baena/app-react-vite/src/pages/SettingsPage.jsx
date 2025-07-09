import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserFromStorage } from '../utils/auth';
import Header from '../components/Header';

function SettingsPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [message, setMessage] = useState({
    type: '',
    text: ''
  });

  useEffect(() => {
    // Check if user is logged in
    const currentUser = getUserFromStorage();
    
    if (currentUser) {
      setUser(currentUser);
      setFormData({
        username: currentUser.username,
        email: currentUser.email,
        password: '',
        confirmPassword: ''
      });
    } else {
      // Redirect to login if no user
      navigate('/', { replace: true });
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate form
    if (formData.password && formData.password !== formData.confirmPassword) {
      setMessage({
        type: 'error',
        text: 'Las contraseñas no coinciden'
      });
      return;
    }
    
    try {
      // Get users from localStorage
      const usersJson = localStorage.getItem('users');
      const users = usersJson ? JSON.parse(usersJson) : [];
      
      // Find current user
      const userIndex = users.findIndex(u => u.id === user.id);
      
      if (userIndex === -1) {
        setMessage({
          type: 'error',
          text: 'Error al actualizar el perfil'
        });
        return;
      }
      
      // Update user
      const updatedUser = {
        ...users[userIndex],
        username: formData.username,
        email: formData.email
      };
      
      // Update password if provided
      if (formData.password) {
        updatedUser.password = formData.password;
      }
      
      // Update in users array
      users[userIndex] = updatedUser;
      
      // Save to localStorage
      localStorage.setItem('users', JSON.stringify(users));
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      
      // Update state
      setUser(updatedUser);
      
      // Show success message
      setMessage({
        type: 'success',
        text: 'Perfil actualizado correctamente'
      });
      
      // Clear password fields
      setFormData(prev => ({
        ...prev,
        password: '',
        confirmPassword: ''
      }));
      
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Error al actualizar el perfil: ' + error.message
      });
    }
  };

  // Add CSS classes for message coloring
  const messageClass = message.type === 'error' ? 'error-message' : 'success-message';

  if (!user) {
    return <div>Cargando configuración...</div>;
  }

  return (
    <div className="settings-container">
      <Header user={user} />
      
      <div className="content-container">
        <h2>Configuración</h2>
        
        {message.text && (
          <div className={`message ${messageClass}`}>
            {message.text}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="form settings-form">
          <h3>Editar Perfil</h3>
          
          <label htmlFor="username">Nombre de Usuario</label>
          <input 
            type="text" 
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required 
          />
          
          <label htmlFor="email">Correo Electrónico</label>
          <input 
            type="email" 
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required 
          />
          
          <h3>Cambiar Contraseña</h3>
          <p className="form-hint">Deje en blanco si no desea cambiar la contraseña</p>
          
          <label htmlFor="password">Nueva Contraseña</label>
          <input 
            type="password" 
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
          />
          
          <label htmlFor="confirmPassword">Confirmar Nueva Contraseña</label>
          <input 
            type="password" 
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
          />
          
          <input type="submit" value="Guardar Cambios" />
        </form>
      </div>
    </div>
  );
}

export default SettingsPage;