import React, { useState, useEffect, useCallback } from 'react';
import ImageSelector from '../common/ImageSelector';
import { useAuth } from '../../hooks/useAuth';
import Avatar from '../common/Avatar';
import Modal from '../common/Modal';
import { useModal } from '../../hooks/useModal';

const AvatarSelector = () => {
    const { modal, hideModal, showError } = useModal();
    const { user, updateProfile } = useAuth();
    const [showSelector, setShowSelector] = useState(false);
    const [selectedAvatar, setSelectedAvatar] = useState(user?.avatar || null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setSelectedAvatar(user?.avatar || null);
    }, [user?.avatar]);

    const handleAvatarSelect = useCallback(async (imageData) => {
        setLoading(true);
        try {
            if (imageData.source === 'upload' && imageData.url) {
                const base64Data = imageData.url.split(',')[1]
                const sizeInBytes = (base64Data.length * 3) / 4
                const maxSizeInMB = 5
                const maxSizeInBytes = maxSizeInMB * 1024 * 1024
                
                if (sizeInBytes > maxSizeInBytes) {
                    throw new Error(`Image size too large. Maximum size is ${maxSizeInMB}MB`)
                }
            }
            
            const avatarData = {
                source: imageData.source,
                alt: imageData.alt || imageData.originalName || 'User avatar'
            };

            if (imageData.source === 'upload') {
                avatarData.url = imageData.url;
                avatarData.thumbnail = imageData.url;
                avatarData.data = imageData.url;
                avatarData.originalName = imageData.originalName;
                avatarData.mimeType = imageData.mimeType;
                avatarData.size = imageData.size;
            } else if (imageData.source === 'pexels') {
                avatarData.url = imageData.url;
                avatarData.thumbnail = imageData.thumbnail;
                avatarData.pexelsId = imageData.pexelsId || imageData.id;
                avatarData.photographer = imageData.photographer;
                avatarData.photographer_url = imageData.photographer_url;
            } else {
                avatarData.url = imageData.url;
                avatarData.thumbnail = imageData.thumbnail || imageData.url;
            }

            const updatedUser = await updateProfile({ avatar: avatarData });
            
            setSelectedAvatar(updatedUser.avatar);
            
            setShowSelector(false);
            
        } catch (error) {
            showError(`Failed to update avatar: ${error.message}`);
        } finally {
            setLoading(false);
        }
    }, [updateProfile, showError]);

    const handleRemoveAvatar = async () => {
        setLoading(true);
        try {
            await updateProfile({ 
                avatar: {
                    url: null,
                    thumbnail: null,
                    source: 'default',
                    photographer: null,
                    photographer_url: null,
                    alt: null
                }
            });
        } catch (error) {
            console.error('Error removing avatar:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center space-y-4">
            <div className="relative">
                <Avatar user={user} size="xl" />
                <button
                    onClick={() => setShowSelector(true)}
                    className="absolute bottom-0 right-0 bg-purple-600 hover:bg-purple-700 text-white p-2 rounded-full shadow-lg transition-colors"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                </button>
            </div>
            
            <div className="flex space-x-2">
                <button
                    onClick={() => setShowSelector(true)}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                >
                    Change Avatar
                </button>
                
                {selectedAvatar && selectedAvatar.url && (
                    <button
                        onClick={handleRemoveAvatar}
                        disabled={loading}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50"
                    >
                        Remove
                    </button>
                )}
            </div>

            {showSelector && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-gray-900 rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-white">Select Avatar</h3>
                            <button
                                onClick={() => {
                                    setShowSelector(false);
                                    setLoading(false);
                                }}
                                className="text-gray-400 hover:text-white"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        
                        <ImageSelector
                            onImageSelect={handleAvatarSelect}
                            loading={loading}
                        />
                    </div>
                </div>
            )}

            <Modal
                isOpen={modal.isOpen}
                onClose={hideModal}
                title={modal.title}
                type={modal.type}
            >
                {modal.message}
            </Modal>
        </div>
    );
};

export default AvatarSelector;
