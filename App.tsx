import React, { useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Hero from './components/Hero';
import QuickNav from './components/QuickNav';
import Statistics from './components/Statistics';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import Adopt from './pages/Adopt';
import LostFound from './pages/LostFound';
import PawMart from './pages/PawMart';
import Checkout from './pages/Checkout';
import Login from './pages/Login';
import LandingPage from './pages/LandingPage';
import AdminDashboard from './pages/AdminDashboard';
import CenterDashboard from './pages/CenterDashboard';
import CustomerDashboard from './pages/CustomerDashboard';
import Community from './pages/Community';
import AdminProfile from './pages/AdminProfile';
import CenterApproval from './pages/CenterApproval';
import VeterinaryDashboard from './pages/VeterinaryDashboard';
import CenterProfile from './pages/CenterProfile';
import CustomerProfile from './pages/CustomerProfile';
import VeterinaryCenters from './pages/VeterinaryCenters';
import ResetPassword from './pages/ResetPassword';

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const userType = localStorage.getItem('userType');
  const centerType = localStorage.getItem('centerType');
  const isAdmin = userType === 'admin';

  useEffect(() => {
    // Skip authentication check for reset password route
    if (location.pathname === '/reset-password') {
      return;
    }

    // Regular authentication checks
    if (!userType && location.pathname !== '/login' && location.pathname !== '/') {
      navigate('/login');
      return;
    }

    if (userType && location.pathname === '/') {
      if (userType === 'center') {
        navigate(centerType === 'veterinary' ? '/veterinaryDashboard' : '/centerDashboard');
      } else {
        navigate(`/${userType}Dashboard`);
      }
      return;
    }

    // Restore admin restrictions
    if (isAdmin && location.pathname === '/contact') {
      navigate(`/${userType}Dashboard`);
    }
  }, [userType, location.pathname, navigate, isAdmin, centerType]);

  return (
    <>
      <Routes>
        {/* Place ResetPassword route first */}
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<LandingPage />} />
        
        {/* Dashboard routes for each user type */}
        <Route path="/adminDashboard" element={<AdminDashboard />} />
        <Route path="/centerDashboard" element={<CenterDashboard />} />
        <Route path="/customerDashboard" element={<CustomerDashboard />} />
        <Route path="/veterinaryDashboard" element={<VeterinaryDashboard />} />
        
        <Route path="/adopt" element={<><Adopt /><ScrollToTop /></>} />
        <Route path="/lost-found" element={<><LostFound /><ScrollToTop /></>} />
        <Route path="/pawmart" element={<><PawMart /><ScrollToTop /></>} />
        <Route path="/checkout" element={<><Checkout /><ScrollToTop /></>} />
        <Route path="/community" element={<><Community /><ScrollToTop /></>} />
        <Route path="/admin/profile" element={<AdminProfile />} />
        <Route path="/admin/center-approval" element={<CenterApproval />} />
        <Route path="/center/profile" element={<CenterProfile />} />
        <Route path="/customer-profile" element={<CustomerProfile />} />
        <Route path="/veterinary" element={<VeterinaryCenters />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Routes>
      <Toaster position="top-right" />
    </>
  );
}

export default App;