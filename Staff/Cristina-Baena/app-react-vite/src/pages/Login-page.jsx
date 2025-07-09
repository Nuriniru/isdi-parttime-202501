import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../utils/auth';


function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    try {
      loginUser({ 
        email, 
        password, 
        'remember-me': rememberMe 
      });
      navigate('/home');
    } catch (error) {
      alert(error.message);
    }
  };

  const handleRegisterNavigate = () => {
    navigate('/register');
  };

  return (
    <div className="login-container">
      <div className="logo-container">
        <img src="/logo.png" alt="App Logo" className="logo" />
      </div>
      <h1>Iniciar Sesión</h1>
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
        
        <div className="checkbox-container">
          <input 
            type="checkbox" 
            id="remember-me"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
          />
          <label htmlFor="remember-me" className="checkbox-label">
            Recordarme
          </label>
        </div>
        
        <input type="submit" value="Iniciar Sesión" />
      </form>
      
      <button onClick={handleRegisterNavigate}>
        Ir a Registro
      </button>
    </div>
  );
}

export default LoginPage;
