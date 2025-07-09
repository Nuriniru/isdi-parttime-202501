import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { logout } from '../utils/auth';

function Header({ user }) {
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  const navigateToHome = () => {
    navigate('/home');
  };

  const navigateToProfile = () => {
    navigate('/profile');
    setShowDropdown(false);
  };

  const navigateToSettings = () => {
    navigate('/settings');
    setShowDropdown(false);
  };

  return (
    <header className="app-header">
      <img 
        src="/logo.png" 
        alt="Logo" 
        className="header-logo"
        onClick={navigateToHome}
        style={{ cursor: 'pointer' }}
      />
      <div className="user-button" ref={dropdownRef}>
        <div 
          className="user-avatar"
          onClick={() => setShowDropdown(!showDropdown)}
          style={{ cursor: 'pointer' }}
        >
          {user.username.charAt(0).toUpperCase()}
        </div>
        
        {showDropdown && (
          <div className="user-dropdown">
            <ul className="dropdown-menu">
              <li onClick={navigateToProfile}>Perfil</li>
              <li onClick={navigateToSettings}>Configuración</li>
              <li onClick={handleLogout}>Cerrar Sesión</li>
            </ul>
          </div>
        )}
      </div>
    </header>
  );
}

export default Header;