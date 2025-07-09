import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Avatar from '../common/Avatar';
import PostCard from '../posts/PostCard';
import Button from '../common/Button';
import { getUserPosts } from '../../services/postService';
import { useAuth } from '../../hooks/useAuth';

const PublicUserProfile = () => {
    const { userId } = useParams();
    const { user: currentUser } = useAuth();
    const [userInfo, setUserInfo] = useState(null);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [postsLoading, setPostsLoading] = useState(false);
    const [error, setError] = useState('');
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    // Load user posts
    const loadUserPosts = async (pageNum = 1, append = false) => {
        try {
            
            if (!append) {
                setPostsLoading(true);
            }
            
            const response = await getUserPosts(userId, pageNum, 10);
            
            
            if (append) {
                setPosts(prev => [...prev, ...(response.posts || [])]);
            } else {
                setPosts(response.posts || []);
                
                if (response.posts && response.posts.length > 0) {
                    setUserInfo(response.posts[0].author);
                }
            }
            
            setHasMore(response.posts && response.posts.length === 10);
            setError('');
        } catch (error) {
            console.error('Error loading user posts:', error);
            setError('Failed to load user posts');
            if (!append) {
                setPosts([]);
            }
        } finally {
            setLoading(false);
            setPostsLoading(false);
        }
    };

    // Load more posts
    const loadMorePosts = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        loadUserPosts(nextPage, true);
    };

    // Handle post updates
    const handlePostUpdate = (updatedPost, deletedPostId) => {
        if (deletedPostId) {
            setPosts(prevPosts => prevPosts.filter(post => post.id !== deletedPostId));
        } else if (updatedPost) {
            setPosts(prevPosts => 
                prevPosts.map(post => 
                    post.id === updatedPost.id ? updatedPost : post
                )
            );
        }
    };

    useEffect(() => {
        if (userId) {
            loadUserPosts();
        }
    }, [userId]);

    if (loading) {
        return (
            <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                <span className="ml-3 text-gray-600">Loading profile...</span>
            </div>
        );
    }

    if (error && !userInfo) {
        return (
            <div className="text-center py-12">
                <div className="text-red-600 mb-4">{error}</div>
                <Button onClick={() => loadUserPosts()}>Try Again</Button>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-6">
            {/* User Profile Header */}
            {userInfo && (
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <div className="flex items-center space-x-6">
                        <Avatar user={userInfo} size="xl" />
                        <div className="flex-1">
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                {userInfo.username}
                            </h1>
                            {userInfo.bio && (
                                <p className="text-gray-600 mb-4">{userInfo.bio}</p>
                            )}
                            <div className="flex items-center space-x-6 text-sm text-gray-500">
                                <span>{posts.length} posts</span>
                                <span>Joined {new Date(userInfo.createdAt).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Posts Section */}
            <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900">
                    {userInfo?.username}'s Posts
                </h2>
                
                {posts.length > 0 ? (
                    <>
                        {posts.map((post) => (
                            <PostCard 
                                key={post.id} 
                                post={post} 
                                onPostUpdate={handlePostUpdate}
                            />
                        ))}
                        
                        {/* Load More Button */}
                        {hasMore && (
                            <div className="flex justify-center mt-8">
                                <Button
                                    onClick={loadMorePosts}
                                    disabled={postsLoading}
                                    variant="outline"
                                    size="lg"
                                >
                                    {postsLoading ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600 mr-2"></div>
                                            Loading...
                                        </>
                                    ) : (
                                        'Load More Posts'
                                    )}
                                </Button>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="text-center py-12">
                        <div className="text-gray-500 mb-4">
                            {userInfo?.username} hasn't posted anything yet.
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PublicUserProfile;