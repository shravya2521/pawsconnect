import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { PawPrint, LogOut, User, CheckSquare } from 'lucide-react';

interface PendingCounts {
  adoption: number;
  veterinary: number;
  total: number;
}

export default function Navigation() {
  const location = useLocation();
  const navigate = useNavigate();
  const isHome = location.pathname === '/';
  const userType = localStorage.getItem('userType');
  const isAdmin = userType === 'admin';
  const isCenter = userType === 'center';
  const isCustomer = userType === 'customer';
  const centerType = localStorage.getItem('centerType');
  const [pendingCounts, setPendingCounts] = useState<PendingCounts>({
    adoption: 0,
    veterinary: 0,
    total: 0
  });

  useEffect(() => {
    if (userType === 'admin') {
      fetchPendingCount();
      
      // Add event listener for badge refresh
      const handleRefresh = () => fetchPendingCount();
      window.addEventListener('refreshPendingCount', handleRefresh);
      
      // Cleanup listener
      return () => window.removeEventListener('refreshPendingCount', handleRefresh);
    }
  }, [userType]);

  const fetchPendingCount = async () => {
    try {
      const response = await fetch('https://pawsconnect.rf.gd/get_pending_count.php');
      const data = await response.json();
      if (data.status === 'success') {
        setPendingCounts(data.counts);
      }
    } catch (error) {
      console.error('Error fetching pending count:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('userType');
    navigate('/login');
  };

  const getHomeLink = () => {
    if (userType === 'admin') return '/adminDashboard';
    if (userType === 'center') {
      return centerType === 'veterinary' ? '/veterinaryDashboard' : '/centerDashboard';
    }
    return '/customerDashboard';
  };

  const renderNavLinks = () => {
    const links = [
      { to: '/', text: 'Home' },
      ...(isCustomer ? [
        { to: '/adopt', text: 'Adopt' },
        { to: '/veterinary', text: 'Veterinary' }
      ] : []),
      { to: '/lost-found', text: 'Lost & Found' },
      { to: '/pawmart', text: 'PawMart' },
      { to: '/community', text: 'Community' }
    ];

    if (isAdmin) {
      links.push({
        to: '/admin/center-approval',
        text: 'Center Approval',
        badge: pendingCounts.total > 0 ? pendingCounts.total : null
      });
    }

    return (
      <div className="flex items-center space-x-4">
        {links.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className={`relative px-4 py-2 rounded-lg font-semibold transition-all duration-200
              ${isHome 
                ? 'text-white hover:bg-white/20' 
                : 'text-gray-700 hover:bg-gray-100'
              }`}
          >
            {link.text}
            {link.badge && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                {link.badge}
              </span>
            )}
          </Link>
        ))}
        {(isAdmin || isCenter) && (
          <Link
            to={isAdmin ? "/admin/profile" : "/center/profile"}
            className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all duration-200 bg-indigo-600 text-white hover:bg-indigo-700"
          >
            <User size={20} />
            Profile
          </Link>
        )}
      </div>
    );
  };

  return (
    <nav className={`${isHome ? 'absolute w-full z-10' : 'bg-white border-b'}`}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to={getHomeLink()} className="flex items-center gap-2">
            <PawPrint className={isHome ? 'text-white' : 'text-indigo-600'} />
            <span className={`text-2xl font-bold ${isHome ? 'text-white' : 'text-gray-900'}`}>
              PawsConnect
            </span>
          </Link>

          <div className="flex items-center space-x-4">
            {renderNavLinks()}
            <div className="flex items-center gap-2">
              {isCustomer && (
                <button
                  onClick={() => navigate('/customer-profile')}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  title="Profile"
                >
                  <User size={20} />
                  <span className="hidden md:inline">Profile</span>
                </button>
              )}
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                <LogOut size={20} />
                <span className="hidden md:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}