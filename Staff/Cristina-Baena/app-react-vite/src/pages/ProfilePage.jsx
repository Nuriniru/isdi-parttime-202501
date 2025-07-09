import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserFromStorage } from '../utils/auth';
import Header from '../components/Header';

function ProfilePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const currentUser = getUserFromStorage();
    
    if (currentUser) {
      setUser(currentUser);
      
      // Get user's posts
      loadUserPosts(currentUser.id);
      setIsLoading(false);
    } else {
      // Redirect to login if no user
      navigate('/', { replace: true });
    }
  }, [navigate]);

  // Function to load posts
  const loadUserPosts = (userId) => {
    const allPosts = JSON.parse(localStorage.getItem('posts') || '[]');
    const userPosts = allPosts.filter(post => post.authorId === userId);
    
    // Sort posts by date (newest first)
    const sortedPosts = userPosts.sort((a, b) => 
      new Date(b.timestamp) - new Date(a.timestamp)
    );
    
    setPosts(sortedPosts);
  };

  // Function to delete a post
  const handleDeletePost = (postId) => {
    // Ask for confirmation before deleting
    if (window.confirm('¿Estás seguro de que quieres eliminar esta publicación? Esta acción no se puede deshacer.')) {
      // Get all posts from localStorage
      const allPosts = JSON.parse(localStorage.getItem('posts') || '[]');
      
      // Filter out the post to be deleted
      const updatedPosts = allPosts.filter(post => post.id !== postId);
      
      // Save the updated posts array back to localStorage
      localStorage.setItem('posts', JSON.stringify(updatedPosts));
      
      // Update the local state with the filtered posts
      loadUserPosts(user.id);
    }
  };

  if (isLoading || !user) {
    return <div>Cargando perfil...</div>;
  }

  return (
    <div className="profile-container">
      <Header user={user} />
      
      <div className="content-container">
        <div className="profile-card">
          <div className="profile-header">
            <div className="profile-avatar">
              {user.username.charAt(0).toUpperCase()}
            </div>
            <div className="profile-info">
              <h2>Perfil de {user.username}</h2>
              <p>Correo: {user.email}</p>
              <p>ID: {user.id}</p>
            </div>
          </div>
          
          <div className="profile-stats">
            <div className="stat-item">
              <div className="stat-value">{posts.length}</div>
              <div className="stat-label">Posts</div>
            </div>
            
            <div className="stat-item">
              <div className="stat-value">{posts.reduce((total, post) => total + (post.comments?.length || 0), 0)}</div>
              <div className="stat-label">Comentarios</div>
            </div>
            
            <div className="stat-item">
              <div className="stat-value">{posts.reduce((total, post) => total + (post.likeCount || 0), 0)}</div>
              <div className="stat-label">Me gusta</div>
            </div>
          </div>
        </div>
        
        <h3>Mis Posts</h3>
        
        <div className="posts-list profile-posts">
          {posts.length === 0 ? (
            <p>Aún no has creado ningún post. ¡Comienza a compartir!</p>
          ) : (
            posts.map(post => (
              <div key={post.id} className="post-item">
                <div className="post-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h4>{post.title}</h4>
                  <button 
                    onClick={() => handleDeletePost(post.id)}
                    className="delete-button"
                    style={{
                      backgroundColor: 'transparent',
                      color: '#c62828',
                      border: '1px solid #c62828',
                      borderRadius: '15px',
                      padding: '5px 10px',
                      cursor: 'pointer',
                      fontSize: '0.8rem',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    Eliminar
                  </button>
                </div>
                <p>Fecha: {new Date(post.timestamp).toLocaleString()}</p>
                {post.category && <p>Categoría: {post.category}</p>}
                <p>{post.content}</p>
                <div className="post-stats">
                  <span>♥ {post.likeCount || 0} me gusta</span>
                  <span>💬 {(post.comments?.length || 0)} comentarios</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;