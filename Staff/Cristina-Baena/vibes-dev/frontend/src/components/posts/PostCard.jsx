import React, { useState } from 'react';
import Avatar from '../common/Avatar';
import { useAuth } from '../../hooks/useAuth';
import { likePost, addComment, updatePost, deletePost } from '../../services/postService';
import Button from '../common/Button';
import Modal from '../common/Modal';
import { useModal } from '../../hooks/useModal';
import { useNavigate, useLocation } from 'react-router-dom';

const PostCard = ({ post, onHashtagClick, onPostUpdate }) => {
    const { user, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const { modal, hideModal, showError, showSuccess, showWarning, showConfirm, showModal } = useModal();
    
    const [isLiked, setIsLiked] = useState(post.likes?.includes(user?.id) || false);
    const [likesCount, setLikesCount] = useState(post.likes?.length || 0);
    const [showComments, setShowComments] = useState(false);
    const [newComment, setNewComment] = useState('');
    const [comments, setComments] = useState(post.comments || []);
    const [loading, setLoading] = useState(false);
    const [commentLoading, setCommentLoading] = useState(false);
    
 
    const [isEditing, setIsEditing] = useState(false);
    const [editTitle, setEditTitle] = useState(post.title);
    const [editContent, setEditContent] = useState(post.content);
    const [editLoading, setEditLoading] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);


    const isAuthor = isAuthenticated && user?.id && post.author?.id && 
                     (String(user.id) === String(post.author.id));
    
    

    const handleUserClick = (userId) => {
        if (isAuthenticated && user?.id === userId) {
            navigate('/profile'); 
        } else {
            navigate(`/user/${userId}`);
        }
    };

   
    const handleHashtagClick = (hashtag) => {
        
        if (onHashtagClick) {
            
            onHashtagClick(hashtag);
        } else {
          
            const currentPath = location.pathname;
            if (currentPath !== '/dashboard' && currentPath !== '/') {
                
                navigate(`/dashboard?hashtag=${encodeURIComponent(hashtag)}`);
            }
        }
    };


    const handleLike = async () => {
        
        if (!isAuthenticated()) { 
            showModal({
                title: 'Authentication Required',
                message: 'You need to be logged in to like posts. Would you like to login or register?',
                type: 'warning',
                showCancel: true,
                confirmText: 'Login / Register',
                cancelText: 'Cancel',
                onConfirm: () => {
                    hideModal();
                    navigate('/login');
                }
            });
            return;
        }

        try {
            setLoading(true);
            const response = await likePost(post.id);
            
            
            setIsLiked(response.isLiked);
            setLikesCount(response.likesCount);
        } catch (error) {
            console.error('Error liking post:', error.message);
            showError('Failed to like post');
        } finally {
            setLoading(false);
        }
    };

    
    const handleAddComment = async (e) => {
        e.preventDefault();
        if (!isAuthenticated()) {
            showModal({
                title: 'Authentication Required',
                message: 'You need to be logged in to add comments. Would you like to login or register?',
                type: 'warning',
                showCancel: true,
                confirmText: 'Login / Register',
                cancelText: 'Cancel',
                onConfirm: () => {
                    hideModal();
                    navigate('/login');
                }
            });
            return;
        }

        if (!newComment.trim()) return;

        try {
            setCommentLoading(true);
            const response = await addComment(post.id, newComment.trim());
            
            
            if (response.comments) {
                setComments(response.comments);
            } else {

                setComments(prevComments => [...prevComments, response]);
            }
            setNewComment('');
        } catch (error) {
            console.error('Error adding comment:', error.message);
            showError('Failed to add comment');
        } finally {
            setCommentLoading(false);
        }
    };


    const handleToggleComments = () => {
        if (!isAuthenticated()) {
            showModal({
                title: 'Authentication Required',
                message: 'You need to be logged in to view comments. Would you like to login or register?',
                type: 'warning',
                showCancel: true,
                confirmText: 'Login / Register',
                cancelText: 'Cancel',
                onConfirm: () => {
                    hideModal();
                    navigate('/login');
                }
            });
            return;
        }
        setShowComments(!showComments);
    };


    const handleEditPost = async () => {
        if (!editTitle.trim() || !editContent.trim()) {
            showWarning('Title and content are required', 'Missing Information');
            return;
        }

        try {
            setEditLoading(true);
            const response = await updatePost(post.id, {
                title: editTitle.trim(),
                content: editContent.trim()
            });
            
            if (response.success) {
                showSuccess('Post updated successfully!');
                setIsEditing(false);
                if (onPostUpdate) {
                    onPostUpdate(response.post);
                }
            }
        } catch (error) {
            console.error('Error updating post:', error.message);
            showError(`Failed to update post: ${error.message}`);
        } finally {
            setEditLoading(false);
        }
    };


    const handleDeletePost = () => {
        showConfirm(
            'Are you sure you want to delete this post? This action cannot be undone.',
            async () => {
                hideModal();
                
                try {
                    setDeleteLoading(true);
                    const response = await deletePost(post.id);
                    
                    if (response.success) {
                        showSuccess('Post deleted successfully!');
                        if (onPostUpdate) {
                            onPostUpdate(null, post.id);
                        }
                    } else {
                        showError('Failed to delete post');
                    }
                } catch (error) {
                    console.error('Error deleting post:', error.message);
                    showError(`Failed to delete post: ${error.message}`);
                } finally {
                    setDeleteLoading(false);
                }
            },
            'Delete Post'
        );
    };

    
    const handleCancelEdit = () => {
        setEditTitle(post.title);
        setEditContent(post.content);
        setIsEditing(false);
    };

    return (
        <div className="glass-card p-6 mb-4">

            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                    <Avatar user={post.author} size="md" />
                    <div>
                        <span
                            onClick={() => handleUserClick(post.author?.id)}
                            className="font-semibold text-white hover:underline cursor-pointer transition-all"
                        >
                            {post.author?.username}
                        </span>
                        <p className="text-sm text-gray-500">
                            {new Date(post.createdAt).toLocaleDateString()}
                        </p>
                    </div>
                </div>
                
               
                {isAuthor && (
                    <div className="flex items-center space-x-2">
                        {!isEditing && (
                            <>
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
                                    disabled={deleteLoading}
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={handleDeletePost}
                                    disabled={deleteLoading}
                                    className="text-blue-600 hover:text-red-800 text-sm font-medium transition-colors disabled:opacity-50"
                                >
                                    {deleteLoading ? 'Deleting...' : 'Delete'}
                                </button>
                            </>
                        )}
                    </div>
                )}
            </div>
            
           
            <div className="mb-4">
                {isEditing ? (
                    <form onSubmit={handleEditPost} className="space-y-4">
                        <div>
                            <input
                                type="text"
                                value={editTitle}
                                onChange={(e) => setEditTitle(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                placeholder="Post title"
                                required
                            />
                        </div>
                        <div>
                            <textarea
                                value={editContent}
                                onChange={(e) => setEditContent(e.target.value)}
                                rows={4}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                                placeholder="What's on your mind?"
                                required
                            />
                        </div>
                        <div className="flex items-center space-x-3">
                            <Button
                                type="submit"
                                disabled={editLoading}
                                size="sm"
                            >
                                {editLoading ? 'Saving...' : 'Save Changes'}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleCancelEdit}
                                disabled={editLoading}
                                size="sm"
                            >
                                Cancel
                            </Button>
                        </div>
                    </form>
                ) : (
                    <>
                        <h2 className="text-xl font-bold mb-2 text-white">{post.title}</h2>
                        <p className="text-white">
                            {post.content}
                        </p>
                    </>
                )}
            </div>
            

            {post.hashtags && post.hashtags.length > 0 && (
                <div className="mb-4">
                    <div className="flex flex-wrap gap-2">
                        {post.hashtags.map((hashtag, index) => (
                            <button
                                key={`hashtag-${post.id || 'unknown'}-${hashtag}-${index}`}
                                onClick={() => handleHashtagClick(hashtag)}
                                className="inline-block bg-purple-100 text-purple-800 text-sm px-3 py-1 rounded-full hover:bg-purple-200 transition-colors"
                            >
                                #{hashtag}
                            </button>
                        ))}
                    </div>
                </div>
            )}
            

            {post.image?.url && (
                <div className="mb-4">
                    <img 
                        src={post.image.url} 
                        alt={post.image.alt || post.title}
                        className="w-full h-64 object-cover rounded-lg"
                    />
                    {post.image.photographer && (
                        <p className="text-xs text-gray-500 mt-2">
                            Photo by{' '}
                            <a 
                                href={post.image.photographer_url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-500 hover:underline"
                            >
                                {post.image.photographer}
                            </a>
                            {' '}on Pexels
                        </p>
                    )}
                </div>
            )}
            

            <div className="border-t pt-4">
                <div className="flex items-center space-x-4 mb-4">

                    <button 
                        onClick={handleLike}
                        disabled={loading}
                        className={`flex items-center space-x-2 transition-colors ${
                            isLiked 
                                ? 'text-red-500 hover:text-red-600' 
                                : 'text-gray-500 hover:text-red-500'
                        } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        <svg 
                            className="w-5 h-5" 
                            fill={isLiked ? 'currentColor' : 'none'} 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                        >
                            <path 
                                strokeLinecap="round" 
                                strokeLinejoin="round" 
                                strokeWidth={2} 
                                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
                            />
                        </svg>
                        <span>{likesCount}</span>
                    </button>
                    

                    <button 
                        onClick={handleToggleComments} 
                        className="flex items-center space-x-2 text-gray-500 hover:text-blue-500 transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path 
                                strokeLinecap="round" 
                                strokeLinejoin="round" 
                                strokeWidth={2} 
                                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8z" 
                            />
                        </svg>
                        <span>{comments?.length || 0}</span>
                    </button>
                </div>
                

                {showComments && (
                    <div className="space-y-4">

                        {isAuthenticated && (
                            <form onSubmit={handleAddComment} className="flex space-x-3">
                                <Avatar user={user} size="sm" />
                                <div className="flex-1">
                                    <textarea
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                        placeholder="Write a comment..."
                                        className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        rows="2"
                                    />
                                    <div className="mt-2 flex justify-end">
                                        <Button 
                                            type="submit" 
                                            size="sm" 
                                            disabled={!newComment.trim() || commentLoading}
                                        >
                                            {commentLoading ? 'Posting...' : 'Post Comment'}
                                        </Button>
                                    </div>
                                </div>
                            </form>
                        )}
                        

                        <div className="space-y-3">
                            {comments?.map((comment) => (
                                <div key={comment.id} className="flex space-x-3">
                                    <Avatar user={comment.user || comment.author} size="sm" />
                                    <div className="flex-1">
                                        <span
                                            onClick={() => handleUserClick(comment.user?.id || comment.author?.id)}
                                            className="font-medium text-white hover:underline cursor-pointer"
                                        >
                                            {comment.user?.username || comment.author?.username || 'Anonymous'}
                                        </span>
                                        <div className="bg-gray-50 rounded-lg p-3">
                                            <div className="flex items-center space-x-2 mb-1">
                                                <span
                                                    onClick={() => handleUserClick(comment.user?.id || comment.author?.id)}
                                                    className="font-medium text-sm text-gray-700 - darker grey hover:underline cursor-pointer transition-all"
                                                >
                                                    {comment.user?.username || comment.author?.username || 'Anonymous'}
                                                </span>
                                                <span className="text-xs text-gray-500">
                                                    {new Date(comment.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-700">{comment.content}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        {!isAuthenticated && (
                            <p className="text-center text-gray-500 py-4">
                                Please login to view and add comments
                            </p>
                        )}
                    </div>
                )}
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
    );
};

export default PostCard;

