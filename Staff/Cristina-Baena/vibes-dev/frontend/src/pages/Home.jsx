import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import PostFeed from '../components/posts/PostFeed';
import Button from '../components/common/Button';

const Home = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600-70 via-purple-700 to-purple-900">

      <div className="relative overflow-hidden">
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
            Share Your Vibes
          </h1>
          <p className="text-xl text-purple-100 mb-8 max-w-2xl mx-auto">
            Connect with others and express yourself in a positive community where every vibe matters
          </p>
          
          {user ? (
            <Link to="/dashboard">
              <Button size="lg" className="bg-yellow-400 hover:bg-yellow-500 text-purple-900">
                Go to Dashboard
              </Button>
            </Link>
          ) : (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register">
                <Button size="lg" className="bg-yellow-400 hover:bg-yellow-500 text-purple-900">
                  Join the Community
                </Button>
              </Link>
              <Link to="/login">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-purple-900">
                  Sign In
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>

      <div className="glass-card mx-4 my-8">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-4">
              Latest Community Vibes
            </h2>
            <p className="text-white/70 max-w-2xl mx-auto">
              Discover what the community is sharing and get inspired by the positive energy
            </p>
          </div>
          
         
          <PostFeed sortBy="likes" />
        </div>
      </div>
    </div>
  );
};

export default Home;