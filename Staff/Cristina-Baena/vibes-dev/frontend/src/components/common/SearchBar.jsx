import React, { useState } from 'react'

const SearchBar = ({ 
  placeholder = 'Search...',
  onSearch,
  onChange,
  value,
  className = '',
  size = 'md',
  showButton = true,
  ...props 
}) => {
  const [searchValue, setSearchValue] = useState(value || '')
  
  const handleInputChange = (e) => {
    const newValue = e.target.value
    setSearchValue(newValue)
    if (onChange) {
      onChange(newValue)
    }
  }
  
  const handleSubmit = (e) => {
    e.preventDefault()
    if (onSearch) {
      onSearch(searchValue)
    }
  }
  
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-5 py-3 text-lg'
  }
  
  const inputClasses = `
    flex-1 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent
    ${sizeClasses[size] || sizeClasses.md}
  `.trim().replace(/\s+/g, ' ')
  
  const buttonClasses = `
    bg-purple-600 hover:bg-purple-700 text-white border border-purple-600 rounded-r-lg transition-colors
    ${sizeClasses[size] || sizeClasses.md}
  `.trim().replace(/\s+/g, ' ')
  
  return (
    <form onSubmit={handleSubmit} className={`flex ${className}`} {...props}>
      <input
        type="text"
        value={searchValue}
        onChange={handleInputChange}
        placeholder={placeholder}
        className={inputClasses}
      />
      {showButton && (
        <button
          type="submit"
          className={buttonClasses}
        >
          Search
        </button>
      )}
    </form>
  )
}

export default SearchBar