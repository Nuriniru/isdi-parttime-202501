import React, { useState, useEffect } from 'react';

const Avatar = ({ 
    user, 
    size = 'md', 
    showName = false, 
    className = '',
    onClick = null 
}) => {
    const [imageSrc, setImageSrc] = useState('/default-avatar.jpg');
    const [imageError, setImageError] = useState(false);

    const sizeClasses = {
        xs: 'w-6 h-6',
        sm: 'w-8 h-8',
        md: 'w-10 h-10',
        lg: 'w-16 h-16',
        xl: 'w-20 h-20',
        '2xl': 'w-24 h-24'
    };

    const textSizeClasses = {
        xs: 'text-xs',
        sm: 'text-sm',
        md: 'text-sm',
        lg: 'text-base',
        xl: 'text-lg',
        '2xl': 'text-xl'
    };

    const getAvatarSrc = () => {
        
        
        
        if (user?.avatar?.source === 'upload' && user?.avatar?.url) {
            
            return user.avatar.url;
        }
        
      
        if (user?.avatar?.source === 'pexels') {
           
            return user?.avatar?.thumbnail || user?.avatar?.url;
        }
        
       
        if (user?.avatar?.url) {
            
            return user.avatar.url;
        }
        
       
        if (user?.profilePicture && user.profilePicture !== 'default.jpg') {
           
            return `/uploads/${user.profilePicture}`;
        }
        
     
        return '/default-avatar.jpg';
    };

    
    useEffect(() => {
        const newSrc = getAvatarSrc();
       
        setImageSrc(newSrc);
        setImageError(false); 
    }, [user?.avatar, user?.profilePicture]);

    const getInitials = () => {
        return user?.username
            ? user.username.slice(0, 2).toUpperCase()
            : '??';
    };

    const handleImageError = (e) => {
       
        setImageError(true);
       
        if (imageSrc !== '/default-avatar.jpg') {
            setImageSrc('/default-avatar.jpg');
        }
    };

    const handleImageLoad = () => {
       
        setImageError(false);
    };

    return (
        <div className={`flex items-center ${className}`}>
            <div 
                className={`relative ${sizeClasses[size]} ${onClick ? 'cursor-pointer' : ''}`}
                onClick={onClick}
            >
                {!imageError ? (
                    <img
                        key={imageSrc} 
                        src={imageSrc}
                        alt={user?.username || 'User avatar'}
                        className={`${sizeClasses[size]} rounded-full object-cover border-2 border-gray-200`}
                        onError={handleImageError}
                        onLoad={handleImageLoad}
                    />
                ) : (
                    <div 
                        className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-purple-500 to-blue-500 text-white font-semibold flex items-center justify-center ${textSizeClasses[size]}`}
                    >
                        {getInitials()}
                    </div>
                )}
                
                {(size === 'lg' || size === 'xl' || size === '2xl') && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                )}
            </div>
            
            {showName && user?.username && (
                <span className={`ml-2 font-medium text-gray-900 ${textSizeClasses[size]}`}>
                    {user.username}
                </span>
            )}
        </div>
    );
};

export default Avatar;