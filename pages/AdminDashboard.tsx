import React, { useState, useEffect } from 'react';
import { Users, Building, Building2, Heart, Search, DollarSign } from 'lucide-react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';

interface DashboardStats {
  total_users: number;
  adoption_centers: number;
  veterinary_centers: number;
  total_revenue: number;
  successful_adoptions: number;
  lost_found_reports: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchStats = async () => {
    try {
      const response = await fetch('https://pawsconnect.rf.gd/get_admin_stats.php');
      const data = await response.json();
      
      if (data.status === 'success') {
        setStats(data.data);
      } else {
        throw new Error(data.message || 'Failed to fetch statistics');
      }
    } catch (err) {
      setError('Failed to load dashboard statistics');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch stats on component mount and every 30 seconds
  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  if (error) return <div className="text-red-500 text-center p-4">{error}</div>;

  const formatNumber = (num: number) => new Intl.NumberFormat('en-IN').format(num);
  const formatCurrency = (num: number) => new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR'
  }).format(num);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navigation />
      <div className="flex-grow max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Total Users */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center gap-4">
              <Users className="w-8 h-8 text-blue-500" />
              <div>
                <p className="text-gray-500">Total Users</p>
                <p className="text-2xl font-bold">{formatNumber(stats?.total_users || 0)}</p>
              </div>
            </div>
          </div>

          {/* Adoption Centers */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center gap-4">
              <Building className="w-8 h-8 text-green-500" />
              <div>
                <p className="text-gray-500">Adoption Centers</p>
                <p className="text-2xl font-bold">{formatNumber(stats?.adoption_centers || 0)}</p>
              </div>
            </div>
          </div>

          {/* Veterinary Centers */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center gap-4">
              <Building2 className="w-8 h-8 text-purple-500" />
              <div>
                <p className="text-gray-500">Veterinary Centers</p>
                <p className="text-2xl font-bold">{formatNumber(stats?.veterinary_centers || 0)}</p>
              </div>
            </div>
          </div>

          {/* Total Revenue */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center gap-4">
              <DollarSign className="w-8 h-8 text-yellow-500" />
              <div>
                <p className="text-gray-500">Total Revenue</p>
                <p className="text-2xl font-bold">{formatCurrency(stats?.total_revenue || 0)}</p>
              </div>
            </div>
          </div>

          {/* Successful Adoptions */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center gap-4">
              <Heart className="w-8 h-8 text-red-500" />
              <div>
                <p className="text-gray-500">Successful Adoptions</p>
                <p className="text-2xl font-bold">{formatNumber(stats?.successful_adoptions || 0)}</p>
              </div>
            </div>
          </div>

          {/* Lost & Found Reports */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center gap-4">
              <Search className="w-8 h-8 text-indigo-500" />
              <div>
                <p className="text-gray-500">Lost & Found Reports</p>
                <p className="text-2xl font-bold">{formatNumber(stats?.lost_found_reports || 0)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
o    </div>
  );
}