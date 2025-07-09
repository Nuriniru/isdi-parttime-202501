import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Avatar from '../components/common/Avatar';
import ImageSelector from '../components/common/ImageSelector';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import Modal from '../components/common/Modal';
import { useModal } from '../hooks/useModal';
import { validator, errors } from 'common';
import { useValidation } from '../hooks/useValidation';

const Settings = () => {
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();
  const { modal, hideModal, showError } = useModal();
  
  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    bio: user?.bio || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showAvatarSelector, setShowAvatarSelector] = useState(false);
  const { validationErrors, validateField, clearError, hasErrors } = useValidation();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Real-time validation
    if (name === 'email') {
      validateField('email', value, 'email');
    } else if (name === 'newPassword' && value) {
      validateField('newPassword', value, 'password');
    }
    
    clearError(name);
  };

  const handleAvatarSelect = async (imageData) => {
    setLoading(true);
    try {
      // Validate image size before sending
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
  
      // Handle different avatar sources
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
  
      await updateProfile({ avatar: avatarData });
      setShowAvatarSelector(false);
    } catch (error) {
      console.error('Error updating avatar:', error);
      showError(`Failed to update avatar: ${error.message}`);
    } finally {
      // Always reset loading state
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      const updateData = {
        username: formData.username,
        email: formData.email,
        bio: formData.bio
      };

      // Include avatar if changed
      if (formData.avatar) {
        updateData.avatar = formData.avatar;
      }

      // Only include password if user wants to change it
      if (formData.newPassword) {
        if (formData.newPassword !== formData.confirmPassword) {
          setErrors({ confirmPassword: 'Passwords do not match' });
          setLoading(false);
          return;
        }
        updateData.password = formData.newPassword;
      }

      await updateProfile(updateData);
      navigate('/profile');
    } catch (error) {
      setErrors({ submit: 'Failed to update profile' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-purple-900/70 via-purple-800 to-transparent">
        <div className="container mx-auto px-4 py-8">
          {/* Back Button */}
          <button
            onClick={() => navigate('/profile')}
            className="flex items-center text-white/70 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            Back to Profile
          </button>

          {/* Settings Form */}
          <div className="glass-card rounded-lg p-8 max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold text-white mb-8">Account Settings</h1>
            
            <form onSubmit={handleUpdateProfile} className="space-y-6">
              {/* Avatar Section */}
              <div className="flex flex-col items-center space-y-4">
                <div className="relative">
                  <Avatar
                    user={user}
                    size="xl"
                    className="ring-4 ring-purple-400/30"
                  />
                  <button
                    type="button"
                    onClick={() => setShowAvatarSelector(true)}
                    className="absolute -bottom-2 -right-2 bg-purple-600 hover:bg-purple-700 text-white rounded-full p-2 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                </div>
                <p className="text-white/70 text-sm">Click the edit button to change your avatar</p>
              </div>

              {/* Profile Information */}
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-white">Profile Information</h2>
                <Input
                  label="Username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  error={errors.username}
                  required
                />
                <Input
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  error={errors.email}
                  required
                />
                <Input
                  label="Bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  error={errors.bio}
                  placeholder="Tell us about yourself..."
                  multiline
                  rows={3}
                />
              </div>

              {/* Password Section */}
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-white">Change Password</h2>
                <Input
                  label="Current Password"
                  name="currentPassword"
                  type="password"
                  value={formData.currentPassword}
                  onChange={handleChange}
                  error={errors.currentPassword}
                  placeholder="Enter current password to change"
                />
                <Input
                  label="New Password"
                  name="newPassword"
                  type="password"
                  value={formData.newPassword}
                  onChange={handleChange}
                  error={errors.newPassword}
                  placeholder="Leave blank to keep current password"
                />
                <Input
                  label="Confirm New Password"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  error={errors.confirmPassword}
                  placeholder="Confirm your new password"
                />
              </div>

              {/* Error Message */}
              {errors.submit && (
                <div className="text-red-400 text-sm">
                  {errors.submit}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row justify-end space-y-4 sm:space-y-0 sm:space-x-4 pt-6">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => navigate('/profile')}
                  className="w-full sm:w-auto"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  loading={loading}
                  disabled={loading}
                  className="w-full sm:w-auto"
                >
                  Save Changes
                </Button>
              </div>
            </form>
          </div>

          {/* Avatar Selector Modal */}
          {showAvatarSelector && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="glass-card rounded-lg p-6 w-full max-w-6xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-white">Select Avatar</h2>
                  <button
                    onClick={() => setShowAvatarSelector(false)}
                    className="text-white/70 hover:text-white"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <ImageSelector
                  onImageSelect={handleAvatarSelect}
                  searchTerm="portrait person face"
                  allowUpload={true}
                />
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Modal component */}
      <Modal
        isOpen={modal.isOpen}
        onClose={hideModal}
        title={modal.title}
        message={modal.message}
        type={modal.type}
        onConfirm={modal.onConfirm}
        showCancel={modal.showCancel}
        confirmText={modal.confirmText}
        cancelText={modal.cancelText}
      />
    </>
  );
};

export default Settings;