import { useState, useEffect } from 'react';
import { useLocation, Link, Outlet } from 'react-router-dom';
import { Bars3Icon, XMarkIcon, UserIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../hooks/useAuth';
import Avatar from '../common/Avatar';

const MainLayout = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();
  const isUserLogged = !!user;

  const navigation = isUserLogged 
    ? [
        { name: 'Dashboard', path: '/dashboard' },
        { name: 'Profile', path: '/profile' }
      ]
    : [
        { name: 'Login', path: '/login' },
        { name: 'Register', path: '/register' }
      ];

  const onLogoutClick = () => {
    setIsMenuOpen(false);
    logout();
  };


  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  return (
    <div className="min-h-screen">

      <nav className="glass-nav fixed w-full z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            <div className="flex-shrink-0">
              <Link 
                to="/" 
                className="text-xl sm:text-2xl font-bold text-white hover:text-purple-200 transition-colors"
              >
                Vibes
              </Link>
            </div>

            <div className="hidden lg:block">
              <div className="flex items-center space-x-1">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={`text-white hover:bg-white/10 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      location.pathname === item.path ? 'bg-white/20 backdrop-blur-sm' : ''
                    }`}
                  >
                    {item.name}
                  </Link>
                ))}
                {isUserLogged && (
                  <button
                    onClick={onLogoutClick}
                    className="text-white hover:bg-red-500/20 bg-red-500/30 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ml-2 backdrop-blur-sm"
                  >
                    Logout
                  </button>
                )}
              </div>
            </div>

            <div className="hidden md:flex lg:hidden items-center space-x-2">
              {isUserLogged ? (
                <>
                  <Link
                    to="/dashboard"
                    className={`text-white hover:bg-white/10 p-2 rounded-lg transition-all duration-200 ${
                      location.pathname === '/dashboard' ? 'bg-white/20 backdrop-blur-sm' : ''
                    }`}
                    title="Dashboard"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z" />
                    </svg>
                  </Link>
                  <Link
                    to="/profile"
                    className={`hover:bg-white/10 p-1 rounded-lg transition-all duration-200 ${
                      location.pathname === '/profile' ? 'bg-white/20 backdrop-blur-sm' : ''
                    }`}
                    title="Profile"
                  >
                    <Avatar user={user} size="sm" />
                  </Link>
                  <button
                    onClick={onLogoutClick}
                    className="text-white hover:bg-red-500/20 bg-red-500/30 p-2 rounded-lg transition-all duration-200 backdrop-blur-sm"
                    title="Logout"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="text-white hover:bg-white/10 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="bg-yellow-400/80 hover:bg-yellow-400/90 text-purple-900-70 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 backdrop-blur-sm"
                  >
                    Register
                  </Link>
                </>
              )}
            </div>

            <div className="flex md:hidden">
              {isUserLogged && (
                <Link
                  to="/profile"
                  className="mr-2 hover:bg-white/10 p-1 rounded-lg transition-all duration-200"
                >
                  <Avatar user={user} size="sm" />
                </Link>
              )}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-lg text-white hover:bg-white/10 focus:outline-none transition-all duration-200"
                aria-expanded="false"
              >
                <span className="sr-only">Open main menu</span>
                {isMenuOpen ? (
                  <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                ) : (
                  <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>
        </div>

        <div className={`md:hidden transition-all duration-300 ease-in-out ${
          isMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
        }`}>
          <div className="px-4 pt-2 pb-3 space-y-1 glass-card border-t border-white/10">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`text-white hover:bg-white/10 block px-4 py-3 rounded-lg text-base font-medium transition-all duration-200 ${
                  location.pathname === item.path ? 'bg-white/20' : ''
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                <div className="flex items-center">
                  {item.name === 'Dashboard' && (
                    <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z" />
                    </svg>
                  )}
                  {item.name === 'Profile' && (
                    <UserIcon className="w-5 h-5 mr-3" />
                  )}
                  {item.name === 'Login' && (
                    <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                  )}
                  {item.name === 'Register' && (
                    <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                  )}
                  {item.name}
                </div>
              </Link>
            ))}
            {isUserLogged && (
              <button
                onClick={onLogoutClick}
                className="text-white hover:bg-red-500/20 bg-red-500/30 block w-full text-left px-4 py-3 rounded-lg text-base font-medium transition-all duration-200 mt-2 backdrop-blur-sm"
              >
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Logout
                </div>
              </button>
            )}
          </div>
        </div>
      </nav>

      <main className="pt-16">
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;