import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { getUserProfile, uploadProfilePicture } from '../services/authService';
import { getMyPosts, getMyLikedPosts, getMyCommentedPosts } from '../services/postService';
import PostCard from '../components/posts/PostCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Avatar from '../components/common/Avatar';
import AvatarSelector from '../components/user/AvatarSelector';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import ImageSelector from '../components/common/ImageSelector';
import { useModal } from '../hooks/useModal';

function Profile() {
    const { user, updateProfile } = useAuth();
    const { modal, hideModal, showError, showSuccess } = useModal();
    const navigate = useNavigate();
    const [userProfile, setUserProfile] = useState(null);
    const [userPosts, setUserPosts] = useState([]);
    const [likedPosts, setLikedPosts] = useState([]);
    const [commentedPosts, setCommentedPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('myPosts');
    const [profilePicture, setProfilePicture] = useState(null);
    const [uploading, setUploading] = useState(false);
    
    // Edit profile states
    const [avatarSelectorKey, setAvatarSelectorKey] = useState(0);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showAvatarSelector, setShowAvatarSelector] = useState(false);
    const [previewAvatar, setPreviewAvatar] = useState(null); // Add preview state
    const [editForm, setEditForm] = useState({
        username: '',
        email: '',
        bio: '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [updating, setUpdating] = useState(false);
    const [errors, setErrors] = useState({});

    // Handle hashtag click - navigate to dashboard with hashtag filter
    const handleHashtagClick = (hashtag) => {
       
        navigate(`/dashboard?hashtag=${encodeURIComponent(hashtag)}`);
    };

    // Handle post update for filtering
    const handlePostUpdate = (updatedPost, deletedPostId) => {
        if (deletedPostId) {
            // Handle post deletion
            if (activeTab === 'myPosts') {
                setUserPosts(prevPosts => prevPosts.filter(post => post.id !== deletedPostId));
            } else if (activeTab === 'likedPosts') {
                setLikedPosts(prevPosts => prevPosts.filter(post => post.id !== deletedPostId));
            } else if (activeTab === 'commentedPosts') {
                setCommentedPosts(prevPosts => prevPosts.filter(post => post.id !== deletedPostId));
            }
        } else if (updatedPost) {
            // Handle post update
            if (activeTab === 'myPosts') {
                setUserPosts(prevPosts => 
                    prevPosts.map(post => 
                        post.id === updatedPost.id ? updatedPost : post
                    )
                );
            } else if (activeTab === 'likedPosts') {
                setLikedPosts(prevPosts => 
                    prevPosts.map(post => 
                        post.id === updatedPost.id ? updatedPost : post
                    )
                );
            } else if (activeTab === 'commentedPosts') {
                setCommentedPosts(prevPosts => 
                    prevPosts.map(post => 
                        post.id === updatedPost.id ? updatedPost : post
                    )
                );
            }
        }
    };

    useEffect(() => {
        fetchUserProfile();
        if (activeTab === 'myPosts') {
            fetchUserPosts();
        } else if (activeTab === 'likedPosts') {
            fetchLikedPosts();
        } else if (activeTab === 'commentedPosts') {
            fetchCommentedPosts();
        }
    }, [activeTab]);

    // Update edit form when userProfile changes
    useEffect(() => {
        if (userProfile) {
            setEditForm({
                username: userProfile.username || '',
                email: userProfile.email || '',
                bio: userProfile.bio || '',
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });
        }
    }, [userProfile]);

    const fetchUserProfile = async () => {
        try {
            
            const response = await getUserProfile();
           
            const profileData = response.data || response;
           
            setUserProfile(profileData);
        } catch (error) {
            console.error('Error fetching user profile:', error);
        }
    };

    const fetchUserPosts = async () => {
        try {
            setLoading(true);
            
            const response = await getMyPosts();
            
            const posts = response.data?.posts || response.posts || [];
            
            setUserPosts(Array.isArray(posts) ? posts : []);
        } catch (error) {
            console.error('Error fetching user posts:', error);
            setUserPosts([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchLikedPosts = async () => {
        try {
            setLoading(true);
            const response = await getMyLikedPosts();
            const posts = response.data?.posts || response.posts || [];
            setLikedPosts(Array.isArray(posts) ? posts : []);
        } catch (error) {
            console.error('Error fetching liked posts:', error);
            setLikedPosts([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchCommentedPosts = async () => {
        try {
            setLoading(true);
            const response = await getMyCommentedPosts();
            const posts = response.data?.posts || response.posts || [];
            setCommentedPosts(Array.isArray(posts) ? posts : []);
        } catch (error) {
            console.error('Error fetching commented posts:', error);
            setCommentedPosts([]);
        } finally {
            setLoading(false);
        }
    };

    const handleProfilePictureChange = (e) => {
        setProfilePicture(e.target.files[0]);
    };

    const handleProfilePictureUpload = async () => {
        if (!profilePicture) return;
        
        try {
            setUploading(true);
            const formData = new FormData();
            formData.append('profilePicture', profilePicture);
            
            const response = await uploadProfilePicture(formData);
            
            // Update user profile with new picture
            setUserProfile(prev => ({
                ...prev,
                avatar: response.avatar || response.profilePicture
            }));
            
            setProfilePicture(null);
            showSuccess('Profile picture updated successfully!');
        } catch (error) {
            console.error('Error uploading profile picture:', error);
            showError('Failed to upload profile picture');
        } finally {
            setUploading(false);
        }
    };

    // Image preview handler (doesn't save immediately)
    const handleImagePreview = (imageData) => {
        setPreviewAvatar(imageData);
    };

    // Avatar selection handler (actually saves the avatar)
    const handleAvatarSelect = async (imageData) => {
        setUpdating(true);
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

            const updatedUser = await updateProfile({ avatar: avatarData });
            setUserProfile(updatedUser); // This updates the UI immediately
            setShowAvatarSelector(false);
            setPreviewAvatar(null);
            showSuccess('Avatar updated successfully!');
            
        } catch (error) {
            console.error('Error updating avatar:', error);
            showError(`Failed to update avatar: ${error.message}`);
        } finally {
            setUpdating(false);
        }
    };

    // Edit profile functionality
    const handleEditProfile = () => {
        setShowEditModal(true);
    };

    const handleEditFormChange = (e) => {
        const { name, value } = e.target;
        setEditForm(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear errors when user starts typing
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        try {
            setUpdating(true);
            setErrors({});
            
            const updateData = {
                username: editForm.username,
                email: editForm.email,
                bio: editForm.bio
            };
    
            // Only include password if user wants to change it
            if (editForm.newPassword) {
                if (editForm.newPassword !== editForm.confirmPassword) {
                    setErrors({ confirmPassword: 'Passwords do not match' });
                    setUpdating(false);
                    return;
                }
                if (editForm.newPassword.length < 6) {
                    setErrors({ newPassword: 'Password must be at least 6 characters long' });
                    setUpdating(false);
                    return;
                }
                updateData.password = editForm.newPassword;
            }
            
            const result = await updateProfile(updateData);
            
            if (result.success !== false) {
                // Update local state immediately
                setUserProfile(prev => ({
                    ...prev,
                    username: editForm.username,
                    email: editForm.email,
                    bio: editForm.bio
                }));
                
                // Clear password fields and close modal
                setEditForm(prev => ({
                    ...prev,
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: ''
                }));
                
                setShowEditModal(false);
                setShowAvatarSelector(false);
                setPreviewAvatar(null);
                
                // Refetch posts to update author information
                if (activeTab === 'myPosts') {
                    fetchUserPosts();
                } else if (activeTab === 'likedPosts') {
                    fetchLikedPosts();
                } else if (activeTab === 'commentedPosts') {
                    fetchCommentedPosts();
                }
                
                showSuccess('Profile updated successfully!');
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            setErrors({ general: error.message || 'Failed to update profile' });
            showError('Failed to update profile');
        } finally {
            setUpdating(false);
        }
    };

    const handleCancel = () => {
        setShowEditModal(false);
        setShowAvatarSelector(false);
        setPreviewAvatar(null); // Clear preview on cancel
        // Reset all form fields to original values
        setEditForm({
            username: userProfile?.username || '',
            email: userProfile?.email || '',
            bio: userProfile?.bio || '',
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
        });
        setErrors({});
        // Force ImageSelector to reset by changing its key
        setAvatarSelectorKey(prev => prev + 1);
    };

    // Calculate stats
    const totalPosts = Array.isArray(userPosts) ? userPosts.length : 0;
    const totalLikes = Array.isArray(userPosts) ? userPosts.reduce((total, post) => {
        return total + (post.likes?.length || 0);
    }, 0) : 0;
    const totalComments = Array.isArray(userPosts) ? userPosts.reduce((total, post) => {
        return total + (post.comments?.length || 0);
    }, 0) : 0;

    // Show loading spinner while userProfile is being fetched
    if (!userProfile) {
        return <LoadingSpinner />;
    }

    return (
        <div className="max-w-4xl mx-auto p-6">
            {/* Profile Header with Glass Design */}
            <div className="glass-card rounded-lg border border-white/20 p-6 mb-6">
                <div className="flex items-center space-x-6">
                    <div className="relative">
                        <Avatar
                            user={userProfile}
                            size="xl"
                            className="ring-4 ring-purple-400/30"
                        />
                        {/* Remove the clickable file input overlay */}
                    </div>
                    <div className="flex-1">
                        <h1 className="text-2xl font-bold text-white">{userProfile?.username || 'Unknown User'}</h1>

                        {userProfile?.bio && (
                            <p className="text-white/80 mt-2 italic">"{userProfile.bio}"</p>
                        )}
                        
                        {/* Stats */}
                        <div className="flex space-x-6 mt-4">
                            <div className="text-center">
                                <div className="text-xl font-bold text-white">{totalPosts}</div>
                                <div className="text-sm text-white/60">Posts</div>
                            </div>
                            <div className="text-center">
                                <div className="text-xl font-bold text-white">{totalLikes}</div>
                                <div className="text-sm text-white/60">Likes</div>
                            </div>
                            <div className="text-center">
                                <div className="text-xl font-bold text-white">{totalComments}</div>
                                <div className="text-sm text-white/60">Comments</div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Edit Profile Button */}
                    <div className="flex flex-col space-y-2">
                        <button
                            onClick={handleEditProfile}
                            className="px-4 py-2 glass-light rounded-lg text-white border border-white/30 hover:bg-white/20 transition-all duration-300 backdrop-blur-glass flex items-center space-x-2"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                            <span>Edit Profile</span>
                        </button>
                    </div>
                </div>
                
                {/* Tab Navigation inside the glass card */}
                <div className="mt-6 pt-4 border-t border-white/10">
                    <nav className="flex space-x-4 justify-center">
                        <button
                            onClick={() => setActiveTab('myPosts')}
                            className={`inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 px-4 py-2 text-base ${
                                activeTab === 'myPosts'
                                    ? 'bg-purple-600 hover:bg-purple-700 text-white focus:ring-purple-500'
                                    : 'bg-purple-600/20 hover:bg-purple-600/30 text-white/80 hover:text-white focus:ring-purple-500 border border-purple-400/30'
                            }`}
                        >
                            My Posts 
                        </button>
                        <button
                            onClick={() => setActiveTab('likedPosts')}
                            className={`inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 px-4 py-2 text-base ${
                                activeTab === 'likedPosts'
                                    ? 'bg-purple-600 hover:bg-purple-700 text-white focus:ring-purple-500'
                                    : 'bg-purple-600/20 hover:bg-purple-600/30 text-white/80 hover:text-white focus:ring-purple-500 border border-purple-400/30'
                            }`}
                        >
                            Liked Posts 
                        </button>
                        <button
                            onClick={() => setActiveTab('commentedPosts')}
                            className={`inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 px-4 py-2 text-base ${
                                activeTab === 'commentedPosts'
                                    ? 'bg-purple-600 hover:bg-purple-700 text-white focus:ring-purple-500'
                                    : 'bg-purple-600/20 hover:bg-purple-600/30 text-white/80 hover:text-white focus:ring-purple-500 border border-purple-400/30'
                            }`}
                        >
                            My Comments 
                        </button>
                    </nav>
                </div>
            </div>

            {/* Posts Content */}
            <div className="space-y-6">
                {loading ? (
                    <LoadingSpinner />
                ) : (
                    <>
                        {activeTab === 'myPosts' && (
                            <div className="space-y-6">
                                {userPosts.length > 0 ? (
                                    userPosts.map(post => (
                                        <PostCard 
                                            key={post.id} 
                                            post={post} 
                                            onHashtagClick={handleHashtagClick}
                                            onPostUpdate={handlePostUpdate}
                                        />
                                    ))
                                ) : (
                                    <div className="glass-card rounded-lg border border-white/20 p-8 text-center">
                                        <p className="text-white/60">No posts yet. Create your first post!</p>
                                    </div>
                                )}
                            </div>
                        )}
                        {activeTab === 'likedPosts' && (
                            <div className="space-y-6">
                                {likedPosts.length > 0 ? (
                                    likedPosts.map(post => (
                                        <PostCard 
                                            key={post.id} 
                                            post={post} 
                                            onHashtagClick={handleHashtagClick}
                                            onPostUpdate={handlePostUpdate}
                                        />
                                    ))
                                ) : (
                                    <div className="glass-card rounded-lg border border-white/20 p-8 text-center">
                                        <p className="text-white/60">No liked posts yet.</p>
                                    </div>
                                )}
                            </div>
                        )}
                        {activeTab === 'commentedPosts' && (
                            <div className="space-y-6">
                                {commentedPosts.length > 0 ? (
                                    commentedPosts.map(post => (
                                        <PostCard 
                                            key={post.id} 
                                            post={post} 
                                            onHashtagClick={handleHashtagClick}
                                            onPostUpdate={handlePostUpdate}
                                        />
                                    ))
                                ) : (
                                    <div className="glass-card rounded-lg border border-white/20 p-8 text-center">
                                        <p className="text-white/60">No commented posts yet.</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Edit Profile Modal with Integrated Avatar Selection */}
            {showEditModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="glass-card rounded-lg border border-white/20 p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
                        <h2 className="text-xl font-bold text-white mb-6">Edit Profile</h2>
                        <form onSubmit={handleUpdateProfile} className="space-y-6">
                            {/* Avatar Section */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-white/90">Profile Picture</h3>
                                
                                {!showAvatarSelector ? (
                                    <div className="flex flex-col items-center space-y-4">
                                        <div className="relative">
                                            <Avatar
                                                user={userProfile} // This will show the new avatar immediately
                                                size="xl"
                                                className="ring-4 ring-purple-400/30"
                                            />
                                        </div>
                                        <div className="flex space-x-3">
                                            <button
                                                type="button"
                                                onClick={() => setShowAvatarSelector(true)}
                                                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center space-x-2"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                                <span>Change Avatar</span>
                                            </button>
                                        </div>
                                        <p className="text-white/60 text-sm text-center">Choose from Pexels gallery or upload your own image</p>
                                        {userProfile?.avatar?.photographer && (
                                            <p className="text-xs text-white/50 text-center">
                                                Photo by{' '}
                                                <a 
                                                    href={userProfile.avatar.photographer_url} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="text-purple-400 hover:underline"
                                                >
                                                    {userProfile.avatar.photographer}
                                                </a>
                                                {' '}on Pexels
                                            </p>
                                        )}
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <h4 className="text-md font-medium text-white/90">Select New Avatar</h4>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setShowAvatarSelector(false);
                                                    setPreviewAvatar(null);
                                                }}
                                                className="text-white/70 hover:text-white transition-colors"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        </div>
                                        <div className="bg-white/5 rounded-lg p-4 max-h-96 overflow-y-auto">
                                            <ImageSelector
                                                key={avatarSelectorKey}
                                                onImageSelect={handleImagePreview}
                                                searchTerm="portrait person face"
                                                allowUpload={true}
                                                loading={uploading}
                                            />
                                        </div>
                                        
                                        {/* Preview and Save/Cancel buttons */}
                                        {previewAvatar && (
                                            <div className="mt-4 space-y-4">
                                                <div className="flex justify-center">
                                                    <div className="relative">
                                                        <img 
                                                            src={previewAvatar.thumbnail || previewAvatar.url} 
                                                            alt="Preview" 
                                                            className="w-20 h-20 rounded-full object-cover ring-4 ring-purple-400/30"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="flex gap-2 justify-center">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleAvatarSelect(previewAvatar)}
                                                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                                                        disabled={updating}
                                                    >
                                                        {updating ? 'Saving...' : 'Save Avatar'}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setPreviewAvatar(null)}
                                                        className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                                                    >
                                                        Cancel Selection
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Profile Information */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-white/90">Profile Information</h3>
                                <div className="space-y-4">
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-white/70 mb-2">
                                            Username
                                        </label>
                                        <input
                                            type="text"
                                            name="username"
                                            value={editForm.username}
                                            onChange={handleEditFormChange}
                                            className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                                            placeholder="Enter username"
                                        />
                                        {errors.username && (
                                            <p className="mt-1 text-sm text-red-400">
                                                {errors.username}
                                            </p>
                                        )}
                                    </div>
                                    
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-white/70 mb-2">
                                            Email
                                        </label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={editForm.email}
                                            onChange={handleEditFormChange}
                                            className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                                            placeholder="Enter email"
                                        />
                                        {errors.email && (
                                            <p className="mt-1 text-sm text-red-400">
                                                {errors.email}
                                            </p>
                                        )}
                                    </div>
                                    
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-white/70 mb-2">
                                            Bio
                                        </label>
                                        <textarea
                                            name="bio"
                                            value={editForm.bio}
                                            onChange={handleEditFormChange}
                                            rows={3}
                                            className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors resize-none"
                                            placeholder="Tell us about yourself..."
                                        />
                                        {errors.bio && (
                                            <p className="mt-1 text-sm text-red-400">
                                                {errors.bio}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Change Password Section */}
                            <div className="space-y-4 pt-4 border-t border-white/10">
                                <h3 className="text-lg font-semibold text-white/90">Change Password</h3>
                                <p className="text-sm text-white/60">Leave blank to keep current password</p>
                                
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-white/70 mb-2">
                                        Current Password
                                    </label>
                                    <input
                                        type="password"
                                        name="currentPassword"
                                        value={editForm.currentPassword}
                                        onChange={handleEditFormChange}
                                        className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                                        placeholder="Enter current password to change"
                                    />
                                    {errors.currentPassword && (
                                        <p className="mt-1 text-sm text-red-400">
                                            {errors.currentPassword}
                                        </p>
                                    )}
                                </div>
                                
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-white/70 mb-2">
                                        New Password
                                    </label>
                                    <input
                                        type="password"
                                        name="newPassword"
                                        value={editForm.newPassword}
                                        onChange={handleEditFormChange}
                                        className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                                        placeholder="Enter new password"
                                    />
                                    {errors.newPassword && (
                                        <p className="mt-1 text-sm text-red-400">
                                            {errors.newPassword}
                                        </p>
                                    )}
                                </div>
                                
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-white/70 mb-2">
                                        Confirm New Password
                                    </label>
                                    <input
                                        type="password"
                                        name="confirmPassword"
                                        value={editForm.confirmPassword}
                                        onChange={handleEditFormChange}
                                        className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                                        placeholder="Confirm new password"
                                    />
                                    {errors.confirmPassword && (
                                        <p className="mt-1 text-sm text-red-400">
                                            {errors.confirmPassword}
                                        </p>
                                    )}
                                </div>
                            </div>
                            
                            {errors.submit && (
                                <div className="text-red-400 text-sm">{errors.submit}</div>
                            )}
                            
                            <div className="flex space-x-3 pt-4">
                                <Button
                                    type="submit"
                                    disabled={updating || showAvatarSelector}
                                    className="flex-1"
                                >
                                    {updating ? 'Updating...' : 'Update Profile'}
                                </Button>
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={handleCancel}
                                    className="flex-1"
                                >
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal for notifications */}
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
        </div>
    );
}

export default Profile;
