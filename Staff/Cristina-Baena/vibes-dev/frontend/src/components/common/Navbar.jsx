import React from 'react'
import { Link } from 'react-router-dom'
import Avatar from './Avatar';

const Navbar = ({ 
  brand,
  links = [],
  className = '',
  variant = 'primary',
  ...props 
}) => {
  const baseClasses = 'w-full px-4 py-3 flex items-center justify-between'
  
  const variantClasses = {
    primary: 'bg-purple-600 text-white',
    secondary: 'bg-gray-800 text-white',
    light: 'bg-white text-gray-900 border-b border-gray-200',
    transparent: 'bg-transparent text-white'
  }
  
  const classes = `
    ${baseClasses}
    ${variantClasses[variant] || variantClasses.primary}
    ${className}
  `.trim().replace(/\s+/g, ' ')
  
  return (
    <nav className={classes} {...props}>
      {brand && (
        <div className="flex items-center">
          {typeof brand === 'string' ? (
            <Link to="/" className="text-xl font-bold hover:opacity-80 transition-opacity">
              {brand}
            </Link>
          ) : (
            brand
          )}
        </div>
      )}
      
      {links.length > 0 && (
        <div className="flex items-center space-x-6">
          {links.map((link, index) => (
            <Link
              key={`nav-link-${link.to}-${link.label}`}
              to={link.to}
              className="hover:opacity-80 transition-opacity font-medium"
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}

      {user && (
        <div className="flex items-center space-x-4">
          <Link to="/profile">
            <Avatar user={user} size="sm" showName={true} />
          </Link>
          <button
            onClick={logout}
            className="text-white hover:bg-red-500/20 bg-red-500/30 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 backdrop-blur-sm"
          >
            Logout
          </button>
        </div>
      )}
    </nav>
  )
}

export default Navbar