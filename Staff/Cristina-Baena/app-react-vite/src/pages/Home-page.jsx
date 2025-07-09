import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserFromStorage } from '../utils/auth';
import Header from '../components/Header';

function HomePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    category: ''
  });
  const [commentForm, setCommentForm] = useState({
    postId: null,
    content: ''
  });
  const [showCommentForm, setShowCommentForm] = useState(null);

  useEffect(() => {
    // Retrieve user from storage
    const currentUser = getUserFromStorage();
    
    if (currentUser) {
      setUser(currentUser);
      
      // Load posts
      const storedPosts = JSON.parse(localStorage.getItem('posts') || '[]');
      const sortedPosts = storedPosts.sort((a, b) => 
        new Date(b.timestamp) - new Date(a.timestamp)
      );
      setPosts(sortedPosts);
    } else {
      // Redirect to login if no user
      navigate('/', { replace: true });
    }
  }, [navigate]);

  const handlePostSubmit = (e) => {
    e.preventDefault();
    
    // Validate post data
    if (!newPost.title || !newPost.content) {
      alert('Por favor completa todos los campos del post');
      return;
    }

    // Create new post
    const postToAdd = {
      id: Date.now().toString(),
      ...newPost,
      category: newPost.category || 'General',
      authorId: user.id,
      authorName: user.username,
      timestamp: new Date().toISOString(),
      comments: [],
      likes: [],
      likeCount: 0
    };

    // Retrieve existing posts
    const existingPosts = JSON.parse(localStorage.getItem('posts') || '[]');
    
    // Add post and save
    const updatedPosts = [postToAdd, ...existingPosts];
    localStorage.setItem('posts', JSON.stringify(updatedPosts));
    
    // Update local state
    setPosts(updatedPosts);
    
    // Reset form
    setNewPost({
      title: '',
      content: '',
      category: ''
    });
  };

  const handleLikeToggle = (postId) => {
    const updatedPosts = posts.map(post => {
      if (post.id === postId) {
        // Initialize likes array if it doesn't exist
        const likes = post.likes || [];
        
        // Check if user already liked this post
        const userLikeIndex = likes.indexOf(user.id);
        
        if (userLikeIndex === -1) {
          // User hasn't liked, add like
          return {
            ...post,
            likes: [...likes, user.id],
            likeCount: (post.likeCount || 0) + 1
          };
        } else {
          // User already liked, remove like
          const updatedLikes = [...likes];
          updatedLikes.splice(userLikeIndex, 1);
          return {
            ...post,
            likes: updatedLikes,
            likeCount: (post.likeCount || 0) - 1
          };
        }
      }
      return post;
    });
    
    // Update local state
    setPosts(updatedPosts);
    
    // Save to localStorage
    localStorage.setItem('posts', JSON.stringify(updatedPosts));
  };

  const toggleCommentForm = (postId) => {
    if (showCommentForm === postId) {
      setShowCommentForm(null);
    } else {
      setShowCommentForm(postId);
      setCommentForm({
        postId: postId,
        content: ''
      });
    }
  };

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    
    if (!commentForm.content.trim()) {
      alert('Por favor escribe un comentario');
      return;
    }
    
    const updatedPosts = posts.map(post => {
      if (post.id === commentForm.postId) {
        const newComment = {
          id: Date.now().toString(),
          content: commentForm.content,
          authorId: user.id,
          authorName: user.username,
          timestamp: new Date().toISOString()
        };
        
        return {
          ...post,
          comments: [...(post.comments || []), newComment]
        };
      }
      return post;
    });
    
    // Update local state
    setPosts(updatedPosts);
    
    // Save to localStorage
    localStorage.setItem('posts', JSON.stringify(updatedPosts));
    
    // Reset form and hide it
    setCommentForm({
      postId: null,
      content: ''
    });
    setShowCommentForm(null);
  };

  // Function to check if user has liked a post
  const hasUserLiked = (post) => {
    return post.likes && post.likes.includes(user.id);
  };

  // Prevent render if no user
  if (!user) {
    return null;
  }

  return (
    <div className="home-container">
      {/* Using the Header component instead of inline header */}
      <Header user={user} />

      <div className="content-container">
        <h2>Bello foro de habladurías</h2>
        
        {/* Create Post Form */}
        <form onSubmit={handlePostSubmit} className="form create-post-form">
          <input 
            type="text"
            placeholder="Título del Post"
            value={newPost.title}
            onChange={(e) => setNewPost(prev => ({...prev, title: e.target.value}))}
            required
          />
          <input 
            type="text"
            placeholder="Contenido del Post"
            value={newPost.content}
            onChange={(e) => setNewPost(prev => ({...prev, content: e.target.value}))}
            required
          />
          <input 
            type="text"
            placeholder="Categoría (opcional)"
            value={newPost.category}
            onChange={(e) => setNewPost(prev => ({...prev, category: e.target.value}))}
          />
          <input type="submit" value="Publicar" />
        </form>

        {/* Posts List */}
        <div className="posts-list">
          <h3>Posts Recientes</h3>
          {posts.length === 0 ? (
            <p>No hay posts aún. ¡Sé el primero en publicar!</p>
          ) : (
            posts.map(post => (
              <div key={post.id} className="post-item">
                <h4>{post.title}</h4>
                <p>Autor: {post.authorName}</p>
                <p>Fecha: {new Date(post.timestamp).toLocaleString()}</p>
                {post.category && <p>Categoría: {post.category}</p>}
                <p>{post.content}</p>
                
                {/* Like button */}
                <div className="post-actions">
                  <button 
                    onClick={() => handleLikeToggle(post.id)}
                    className={`like-button ${hasUserLiked(post) ? 'liked' : ''}`}
                  >
                    {hasUserLiked(post) ? 'Me gusta ♥' : 'Me gusta ♡'} ({post.likeCount || 0})
                  </button>
                  
                  <button 
                    onClick={() => toggleCommentForm(post.id)}
                    className="comment-button"
                  >
                    Comentar ({(post.comments && post.comments.length) || 0})
                  </button>
                </div>
                
                {/* Comments section */}
                <div className="comments-section">
                  {post.comments && post.comments.length > 0 && (
                    <div className="comments-list">
                      <h5>Comentarios:</h5>
                      {post.comments.map(comment => (
                        <div key={comment.id} className="comment-item">
                          <p className="comment-author">{comment.authorName}</p>
                          <p className="comment-date">{new Date(comment.timestamp).toLocaleString()}</p>
                          <p className="comment-content">{comment.content}</p>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Comment form */}
                  {showCommentForm === post.id && (
                    <form onSubmit={handleCommentSubmit} className="comment-form">
                      <textarea
                        placeholder="Escribe tu comentario..."
                        value={commentForm.content}
                        onChange={(e) => setCommentForm(prev => ({...prev, content: e.target.value}))}
                        required
                      />
                      <div className="comment-form-actions">
                        <button type="submit">Enviar</button>
                        <button type="button" onClick={() => setShowCommentForm(null)}>Cancelar</button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default HomePage;