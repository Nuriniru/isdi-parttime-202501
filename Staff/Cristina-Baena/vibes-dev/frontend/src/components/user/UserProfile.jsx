import React, { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import Button from '../common/Button'
import Input from '../common/Input'
import AvatarSelector from './AvatarSelector'
import PostCard from '../posts/PostCard'
import { getUserPosts, getMyPosts } from '../../services/postService'
import Modal from '../common/Modal'
import { useModal } from '../../hooks/useModal'

const UserProfile = () => {
  const { user, updateProfile, deleteAccount, logout } = useAuth()
  
  const { modal, hideModal, showError, showSuccess, showConfirm } = useModal();
  
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    bio: user?.bio || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    setLoading(true)
    setErrors({})

    try {
      const updateData = {
        username: formData.username,
        email: formData.email,
        bio: formData.bio
      }

      if (formData.newPassword) {
        if (formData.newPassword !== formData.confirmPassword) {
          setErrors({ confirmPassword: 'Passwords do not match' })
          setLoading(false)
          return
        }
        updateData.password = formData.newPassword
      }

      const result = await updateProfile(updateData)
      
      if (result.success) {
        setIsEditing(false)
        setFormData(prev => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        }))
      } else {
        setErrors({ submit: result.error })
      }
    } catch (error) {
      setErrors({ submit: 'Failed to update profile' })
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    setLoading(true)
    try {
      const result = await deleteAccount()
      if (result.success) {
        showSuccess('Account deleted successfully!');
      } else {
        showError(result.error || 'Failed to delete account');
      }
    } catch (error) {
      showError('Failed to delete account');
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteClick = () => {
    showConfirm(
      'Are you sure you want to delete your account? This action cannot be undone.',
      handleDeleteAccount,
      'Delete Account'
    );
  };
  const [userPosts, setUserPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [showPosts, setShowPosts] = useState(true);

  const loadMyPosts = async () => {
      if (!user?.id) return;
      
      try {
          setPostsLoading(true);
          const response = await getMyPosts();
          setUserPosts(response.posts || []);
      } catch (error) {
          console.error('Error loading posts:', error);
      } finally {
          setPostsLoading(false);
      }
  };
  

  useEffect(() => {
    if (user?.id) {
      loadMyPosts();
    }
  }, [user?.id]);
  

  const handlePostUpdate = (updatedPost, deletedPostId) => {
    if (deletedPostId) {
      setUserPosts(prevPosts => prevPosts.filter(post => post.id !== deletedPostId));
    } else if (updatedPost) {
      setUserPosts(prevPosts => 
        prevPosts.map(post => 
          post.id === updatedPost.id ? updatedPost : post
        )
      );
    }
  };
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Profile Settings</h1>
          
          <div className="mb-8">
            <AvatarSelector />
          </div>
          
          {isEditing ? (
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <Input
                label="Username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                error={errors.username}
              />
              
              <Input
                label="Email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                error={errors.email}
              />
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bio
                </label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Tell us about yourself..."
                />
              </div>
    
              <hr className="my-6" />
              
              <h3 className="text-lg font-medium text-gray-900 mb-4">Change Password</h3>
              
              <Input
                label="New Password (leave blank to keep current)"
                type="password"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                error={errors.newPassword}
              />
              
              <Input
                label="Confirm New Password"
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                error={errors.confirmPassword}
              />
    
              {errors.submit && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
                  {errors.submit}
                </div>
              )}
    
              <div className="flex space-x-4">
                <Button type="submit" disabled={loading}>
                  {loading ? 'Updating...' : 'Update Profile'}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Username</label>
                <p className="text-gray-900">{user?.username}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <p className="text-gray-900">{user?.email}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Bio</label>
                <p className="text-gray-900">{user?.bio || 'No bio provided'}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Member Since</label>
                <p className="text-gray-900">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
                </p>
              </div>
              

              <div className="pt-4">
                <Button
                  onClick={() => setIsEditing(true)}
                  variant="primary"
                >
                  Edit Profile
                </Button>
              </div>
            </div>
          )}
    
          <hr className="my-6" />
          <div className="bg-white rounded-lg shadow-md p-6">
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-2xl font-bold text-gray-900">My Posts</h2>
      <Button
        onClick={() => setShowPosts(!showPosts)}
        variant="outline"
        size="sm"
      >
        {showPosts ? 'Hide Posts' : 'Show Posts'}
      </Button>
    </div>
    
    {showPosts && (
      <div className="space-y-6">
        {postsLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
            <span className="ml-3 text-gray-600">Loading posts...</span>
          </div>
        ) : userPosts.length > 0 ? (
          userPosts.map((post) => (
            <PostCard 
              key={post.id} 
              post={post} 
              onPostUpdate={handlePostUpdate}
            />
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            You haven't posted anything yet.
          </div>
        )}
      </div>
    )}
</div>
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-red-600">Danger Zone</h3>
          
          {!showDeleteConfirm ? (
            <Button
              variant="danger"
              onClick={handleDeleteClick} 
              disabled={loading}
            >
              Delete Account
            </Button>
          ) : (
            <div className="bg-red-50 border border-red-200 p-4 rounded">
              <p className="text-red-800 mb-4">
                Are you sure you want to delete your account? This action cannot be undone.
              </p>
              <div className="flex space-x-4">
                <Button
                  variant="danger"
                  onClick={handleDeleteAccount}
                  disabled={loading}
                >
                  {loading ? 'Deleting...' : 'Yes, Delete Account'}
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => setShowDeleteConfirm(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
    
    <Modal
      isOpen={modal.isOpen}
      onClose={hideModal}
      onConfirm={modal.onConfirm}
      title={modal.title}
      message={modal.message}
      type={modal.type}
      showCancel={modal.showCancel}
      confirmText={modal.confirmText}
      cancelText={modal.cancelText}
    />
  </div>
)
}

export default UserProfile
