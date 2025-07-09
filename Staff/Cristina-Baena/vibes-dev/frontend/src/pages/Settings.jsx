import React, { useState, useEffect } from 'react';
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
import { updateProfile as updateProfileService } from '../services/authService';
import { updatePassword } from '../services/passwordService';

const Settings = () => {
  const { user } = useAuth(); // Remove updateProfile from here
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

      // Fix: Use updateProfileService instead of updateProfile
      await updateProfileService({ avatar: avatarData });
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
      console.log('=== FUNCTION CALLED ==='); // Add this line first
      e.preventDefault();
      try {
          setLoading(true);
          setErrors({});
  
          // Debug: Log form data to see what we're working with
          console.log('=== FORM DATA DEBUG ===');
          console.log('Current Password:', formData.currentPassword ? '[FILLED]' : '[EMPTY]');
          console.log('New Password:', formData.newPassword ? '[FILLED]' : '[EMPTY]');
          console.log('Confirm Password:', formData.confirmPassword ? '[FILLED]' : '[EMPTY]');
          console.log('All password fields filled?', !!(formData.currentPassword && formData.newPassword && formData.confirmPassword));
  
          // Handle password change first if provided
          if (formData.currentPassword && formData.newPassword && formData.confirmPassword) {
              console.log('=== ENTERING PASSWORD UPDATE LOGIC ===');
              
              // Validate password fields
              if (formData.newPassword !== formData.confirmPassword) {
                  throw new Error('New password and confirmation do not match');
              }
              if (formData.newPassword.length < 6) {
                  throw new Error('New password must be at least 6 characters long');
              }
  
              console.log('=== CALLING updatePassword ===');
              // Call updatePassword with only 2 parameters
              await updatePassword(formData.currentPassword, formData.newPassword);
              
              // Clear only password fields after successful update
              setFormData(prev => ({
                  ...prev,
                  currentPassword: '',
                  newPassword: '',
                  confirmPassword: ''
              }));
              
              showSuccess('Password updated successfully!');
              
              // Check if there are other profile changes
              const hasProfileChanges = 
                  formData.username !== user.username ||
                  formData.email !== user.email ||
                  formData.bio !== user.bio ||
                  formData.avatar;
              
              console.log('=== HAS OTHER PROFILE CHANGES? ===', hasProfileChanges);
              
              // If only password was changed, return early
              if (!hasProfileChanges) {
                  console.log('=== RETURNING EARLY - ONLY PASSWORD CHANGED ===');
                  return;
              }
          }

          console.log('=== PROCEEDING TO PROFILE UPDATE ===');
          
          // Update profile with other data
          const updateData = {
              username: formData.username,
              email: formData.email,
              bio: formData.bio
          };
  
          if (formData.avatar) {
              updateData.avatar = formData.avatar;
          }
          
          // Validate required fields
          if (!updateData.username || !updateData.email) {
              throw new Error('Username and email are required');
          }
          
          const updatedUser = await updateProfileService(updateData);
          
          showSuccess('Profile updated successfully!');
          setShowEditModal(false);
          
      } catch (error) {
          setErrors({ general: error.message });
          showError(`Failed to update profile: ${error.message}`);
      } finally {
          setLoading(false); // Fix: Use setLoading instead of setUpdating
      }
  };

  // Remove this entire function as it's not being used
  // const handlePasswordChange = async () => {
  //   try {
  //     // Validate password fields
  //     if (!formData.currentPassword) {
  //         throw new Error('Current password is required');
  //     }
  //     if (!formData.newPassword) {
  //         throw new Error('New password is required');
  //     }
  //     if (formData.newPassword !== formData.confirmPassword) {
  //         throw new Error('New password and confirmation do not match');
  //     }
  //     if (formData.newPassword.length < 6) {
  //         throw new Error('New password must be at least 6 characters long');
  //     }
  
  //     await updatePassword(
  //         formData.currentPassword,
  //         formData.newPassword,
  //         formData.confirmPassword
  //     );
  
  //     // Clear password fields after successful update
  //     setFormData(prev => ({
  //       ...prev,
  //       currentPassword: '',
  //       newPassword: '',
  //       confirmPassword: ''
  //     }));
  
  //     // Show success message
  //     alert('Password updated successfully!');
  //   } catch (error) {
  //     throw new Error(`Password update failed: ${error.message}`);
  //   }
  // };
// Add this useEffect after your state declarations
useEffect(() => {
  if (user) {
    setFormData(prev => ({
      ...prev,
      username: user.username || '',
      email: user.email || '',
      bio: user.bio || ''
    }));
  }
}, [user]);
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
                {/* Current Password */}
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Current Password
                  </label>
                  <Input
                    type="password"
                    name="currentPassword"
                    value={formData.currentPassword}
                    onChange={handleChange}
                    placeholder="Enter current password"
                    error={errors.currentPassword || validationErrors.currentPassword}
                    autocomplete="current-password"
                  />
                </div>
                
                {/* New Password */}
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    New Password
                  </label>
                  <Input
                    type="password"
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleChange}
                    placeholder="Enter new password"
                    error={errors.newPassword || validationErrors.newPassword}
                    autocomplete="new-password"
                  />
                </div>
                
                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Confirm New Password
                  </label>
                  <Input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm new password"
                    error={errors.confirmPassword}
                    autocomplete="new-password"
                  />
                </div>
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
