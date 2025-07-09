import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerUser } from '../utils/auth';


function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    try {
      registerUser({ 
        email, 
        password, 
        'confirmation-password': confirmPassword 
      });
      navigate('/home');
    } catch (error) {
      alert(error.message);
    }
  };

  const handleLoginNavigate = () => {
    navigate('/login');
  };

  return (
    <div className="register-container">
      <div className="logo-container">
        <img src="/logo.png" alt="App Logo" className="logo" />
      </div>
      <h1>Registro</h1>
      <form onSubmit={handleSubmit} className="form">
        <label htmlFor="email">Correo Electrónico</label>
        <input 
          type="email" 
          id="email"
          placeholder="mi@correo.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required 
        />
        
        <label htmlFor="password">Contraseña</label>
        <input 
          type="password" 
          id="password"
          placeholder="*******"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required 
        />
        
        <label htmlFor="confirmation-password">Confirmar Contraseña</label>
        <input 
          type="password" 
          id="confirmation-password"
          placeholder="*******"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required 
        />
        
        <input type="submit" value="Registrarse" />
      </form>
      
      <button onClick={handleLoginNavigate}>
        Ir a Iniciar Sesión
      </button>
    </div>
  );
}

export default RegisterPage;
