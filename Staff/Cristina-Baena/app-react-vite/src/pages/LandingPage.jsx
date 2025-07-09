import React from 'react';
import { useNavigate } from 'react-router-dom';

function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="landing-container">
      <div className="logo-container">
        <img src="/logo.png" alt="App Logo" className="logo" />
      </div>
      <h1>Bello Foro de Habladurías</h1>
      <div className="landing-buttons">
        <button onClick={() => navigate('/login')}>
          Iniciar Sesión
        </button>
        <button onClick={() => navigate('/register')}>
          Registrarse
        </button>
      </div>
    </div>
  );
}

export default LandingPage;