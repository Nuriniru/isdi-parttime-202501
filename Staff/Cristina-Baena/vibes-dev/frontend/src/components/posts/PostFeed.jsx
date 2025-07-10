import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import PostCard from './PostCard';
import CreatePostModal from './CreatePostModal';
import Button from '../common/Button';
import { useAuth } from '../../hooks/useAuth';
import { getPosts } from '../../services/postService';
import { getPopularHashtags, getTrendingHashtags } from '../../services/hashtagService';

const PostFeed = ({ sortBy = 'likes', onPostCreated }) => {
    const { isAuthenticated } = useAuth();
    const isUserAuthenticated = isAuthenticated();
    
    const [searchParams, setSearchParams] = useSearchParams();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedHashtag, setSelectedHashtag] = useState(() => {
        // Initialize selectedHashtag from URL on component mount
        return searchParams.get('hashtag') || null;
    });
    const [trendingHashtags, setTrendingHashtags] = useState([]);
    const [popularHashtags, setPopularHashtags] = useState([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);

    // Check for hashtag in URL parameters on component mount
    useEffect(() => {
        const hashtagFromUrl = searchParams.get('hashtag');
        if (hashtagFromUrl !== selectedHashtag) {
            setSelectedHashtag(hashtagFromUrl);
        }
    }, [searchParams]);

    // Update the handlePostUpdate function to handle deletions
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

   
    const loadPosts = async (pageNum = 1, hashtag = null, append = false) => {
        try {
            if (!append) {
                setLoading(true);
            } else {
                setLoadingMore(true);
            }
            
            const response = await getPosts(pageNum, 10, hashtag, null, sortBy);

            const postsData = Array.isArray(response.data?.posts) ? response.data.posts : 
                             Array.isArray(response.data) ? response.data : 
                             Array.isArray(response.posts) ? response.posts : [];
            
            if (append) {
                setPosts(prev => {
                    const prevArray = Array.isArray(prev) ? prev : [];
                    return [...prevArray, ...postsData];
                });
            } else {
                setPosts(postsData);
            }
            
            
            setHasMore(postsData.length === 10);
            setError('');
        } catch (error) {
            console.error('Error loading posts:', error);
            setError(error.message);
            if (!append) {
                setPosts([]);
            }
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    // Load hashtags
    const loadHashtags = async () => {
        try {
            const [trendingResponse, popularResponse] = await Promise.all([
                getTrendingHashtags(8),
                getPopularHashtags(8)
            ]);
            
            setTrendingHashtags(trendingResponse.hashtags || trendingResponse.data || []);
            setPopularHashtags(popularResponse.hashtags || popularResponse.data || []);
        } catch (error) {
            console.error('Error loading hashtags:', error);
        }
    };

    // Initial load - only trigger when selectedHashtag changes or on mount
    useEffect(() => {
        const hashtagFromUrl = searchParams.get('hashtag') || null;
        
        // Load posts with the hashtag from URL
        loadPosts(1, hashtagFromUrl);
        loadHashtags();
        setPage(1);
        
        // Update selectedHashtag state to match URL
        setSelectedHashtag(hashtagFromUrl);
    }, [searchParams, sortBy]); 
    

    // Handle hashtag filter with URL update
    const handleHashtagClick = (hashtag) => {
        setSelectedHashtag(hashtag);
        setPage(1);
        // Update URL parameter
        setSearchParams({ hashtag });
    };

    // Clear hashtag filter with URL update
    const clearHashtagFilter = () => {
        setSelectedHashtag(null);
        setPage(1);
        // Clear URL parameter
        setSearchParams({});
    };

    // Handle post creation
const handlePostCreated = (newPost) => {
    setPosts(prev => {
        // Ensure prev is always an array
        const prevArray = Array.isArray(prev) ? prev : [];
        // Extract the actual post data from the response
        const postData = newPost.data || newPost;
        
        // Check if post already exists to prevent duplicates
        if (postData.id && prevArray.some(post => post.id === postData.id)) {
            return prevArray;
        }
        
        return [postData, ...prevArray];
    });
    // Refresh hashtags
    loadHashtags();
};

    
    const loadMorePosts = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        loadPosts(nextPage, selectedHashtag, true);
    };

    return (
        <div className="max-w-7xl mx-auto p-4">
            {/* Header */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
                <h1 className="text-2xl font-bold text-gray-900">
                    {selectedHashtag ? `Posts tagged #${selectedHashtag}` : 'Latest Vibes'}
                </h1>
                {isUserAuthenticated && (
                    <Button onClick={() => setShowCreateModal(true)}>
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Create Vibe
                    </Button>
                )}
            </div>

            {/* Filter Bar */}
            <div className="mb-6">
                {/* Active Filter */}
                {selectedHashtag && (
                    <div className="flex items-center mb-4">
                        <span className="text-sm text-gray-600 mr-2">Filtering by:</span>
                        <span className="inline-flex items-center bg-purple-100 text-purple-800 text-sm px-3 py-1 rounded-full">
                            #{selectedHashtag}
                            <button
                                onClick={clearHashtagFilter}
                                className="ml-2 text-purple-600 hover:text-purple-800 transition-colors"
                            >
                                ×
                            </button>
                        </span>
                    </div>
                )}

                {/* Hashtag Categories */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {/* Trending Hashtags */}
                    {trendingHashtags.length > 0 && (
                        <div>
                            <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                                <svg className="w-4 h-4 mr-1 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
                                </svg>
                                Trending
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {trendingHashtags.slice(0, 6).map((hashtag) => (
                                    <button
                                        key={hashtag.name || hashtag.id || hashtag}
                                        onClick={() => handleHashtagClick(hashtag.name || hashtag.id)}
                                        className={`inline-block text-sm px-3 py-1 rounded-full transition-colors ${
                                            selectedHashtag === (hashtag.name || hashtag.id)
                                                ? 'bg-red-500 text-white'
                                                : 'bg-red-100 text-red-700 hover:bg-red-200'
                                        }`}
                                    >
                                        #{hashtag.name || hashtag.id} ({hashtag.count || 0})
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Popular Hashtags */}
                    {popularHashtags.length > 0 && (
                        <div>
                            <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                                <svg className="w-4 h-4 mr-1 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                                Popular
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {popularHashtags.slice(0, 6).map((hashtag) => (
                                    <button
                                        key={hashtag.name || hashtag.id || hashtag}
                                        onClick={() => handleHashtagClick(hashtag.name || hashtag.id)}
                                        className={`inline-block text-sm px-3 py-1 rounded-full transition-colors ${
                                            selectedHashtag === (hashtag.name || hashtag.id)
                                                ? 'bg-purple-500 text-white'
                                                : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                                        }`}
                                    >
                                        #{hashtag.name || hashtag.id} ({hashtag.count || 0})
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                    <div className="flex items-center">
                        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 01-2 2z" clipRule="evenodd" />
                        </svg>
                        {error}
                    </div>
                </div>
            )}

            {/* Loading State */}
            {loading && (
                <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                    <span className="ml-3 text-gray-600">Loading vibes...</span>
                </div>
            )}

            {/* Posts */}
            {!loading && (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {/* Posts mapping section */}
                    {posts.length > 0 ? (
                        <>
                            {posts
                                .filter(post => post && post.id) // Filter out posts without IDs
                                .map((post) => (
                                    <PostCard 
                                        key={post.id} 
                                        post={post} 
                                        onHashtagClick={handleHashtagClick}
                                        onPostUpdate={handlePostUpdate}
                                    />
                                ))}
                        </>
                    ) : (
                        <div className="col-span-full text-center py-12">
                            <div className="mx-auto w-24 h-24 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                                <svg className="w-12 h-12 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-medium text-gray-900 mb-2">
                                {selectedHashtag ? `No vibes found for #${selectedHashtag}` : 'No vibes yet'}
                            </h3>
                            <p className="text-gray-500 mb-6 max-w-md mx-auto">
                                {selectedHashtag 
                                    ? 'Try searching for a different hashtag or create the first vibe with this tag!' 
                                    : isAuthenticated() 
                                        ? 'Be the first to share your vibe and start the conversation!'
                                        : 'Sign in to share your vibe and start the conversation!'}
                            </p>
                            {isAuthenticated() && (
                                <Button onClick={() => setShowCreateModal(true)} size="lg">
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                    Create Your First Vibe
                                </Button>
                            )}
                        </div>
                    )}
                </div>
            )}
            
            {/* Load More Button - Move outside the grid */}
            {!loading && posts.length > 0 && hasMore && (
                <div className="flex justify-center mt-8">
                    <Button
                        onClick={loadMorePosts}
                        disabled={loadingMore}
                        variant="outline"
                        size="lg"
                    >
                        {loadingMore ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600 mr-2"></div>
                                Loading more vibes...
                            </>
                        ) : (
                            <>
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                                </svg>
                                Load More Vibes
                            </>
                        )}
                    </Button>
                </div>
            )}

            {/* Create Post Modal - Only render if authenticated */}
            {isUserAuthenticated && (
                <CreatePostModal
                    isOpen={showCreateModal}
                    onClose={() => setShowCreateModal(false)}
                    onPostCreated={handlePostCreated}
                />
            )}
        </div>
    );
};

export default PostFeed;



