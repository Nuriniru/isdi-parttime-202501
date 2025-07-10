import React from 'react'
import { useAuth } from '../hooks/useAuth'
import { Link } from 'react-router-dom'
import Button from '../components/common/Button'
import Avatar from '../components/common/Avatar'
import PostFeed from '../components/posts/PostFeed'

const Dashboard = () => {
  const { user, logout, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <div className="glass-card mx-4 mt-6 mb-6">
        <div className="max-w-7xl mx-auto p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <Avatar user={user} size="lg" />
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-white">
                  Welcome back, {user?.username || 'User'}!
                </h1>
                <p className="text-white/80">
                  Share your vibes and connect with the community
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 w-full sm:w-auto">
              <Link to="/profile" className="flex-1 sm:flex-none">
                <Button variant="outline" size="sm" className="w-full sm:w-auto glass-light border-white/20 text-white hover:bg-white/20">
                  Profile
                </Button>
              </Link>
              <Button 
                onClick={logout} 
                variant="secondary" 
                size="sm"
                className="flex-1 sm:flex-none bg-red-500/30 hover:bg-red-500/20 border-red-500/40 text-white backdrop-blur-sm transition-all duration-200"
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="py-6">
          <PostFeed sortBy="recent" />
      </div>
    </div>
  )
}

export default Dashboard