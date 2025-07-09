import React from 'react'

const Card = ({ 
  children, 
  className = '',
  variant = 'default',
  padding = 'md',
  shadow = true,
  ...props 
}) => {
  const baseClasses = 'glass-card rounded-lg border border-white/20'
  
  const variantClasses = {
    default: 'border-gray-200',
    primary: 'border-purple-200 bg-purple-50',
    secondary: 'border-gray-300 bg-gray-50',
    success: 'border-green-200 bg-green-50',
    warning: 'border-yellow-200 bg-yellow-50',
    danger: 'border-red-200 bg-red-50'
  }
  
  const paddingClasses = {
    none: '',
    sm: 'p-3',
    md: 'p-6',
    lg: 'p-8'
  }
  
  const shadowClasses = shadow ? 'shadow-md hover:shadow-lg transition-shadow' : ''
  
  const classes = `
    ${baseClasses}
    ${variantClasses[variant] || variantClasses.default}
    ${paddingClasses[padding] || paddingClasses.md}
    ${shadowClasses}
    ${className}
  `.trim().replace(/\s+/g, ' ')
  
  return (
    <div className={classes} {...props}>
      {children}
    </div>
  )
}

export default Card