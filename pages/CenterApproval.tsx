import React, { useState, useEffect } from 'react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { Check, X, Trash2 } from 'lucide-react';

type CenterType = 'adoption' | 'veterinary';
type StatusFilter = 'all' | 'pending' | 'approved' | 'rejected'; // Removed 'inactive'

interface Center {
  id: number;
  name: string;
  email: string;
  center_type: CenterType;
  license_number: string;
  registration_date: string;
  status: 'pending' | 'approved' | 'rejected'; // Removed 'inactive'
}

interface PendingCenter {
  id: number;
  name: string;
  email: string;
  centerType: string;
  licenseNumber: string;
  registrationDate: string;
}

export default function CenterApproval() {
  const [activeTab, setActiveTab] = useState<CenterType>('adoption');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('pending');
  const [centers, setCenters] = useState<Center[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingCenters, setPendingCenters] = useState<PendingCenter[]>([]);

  // Add new state for counts
  const [pendingCounts, setPendingCounts] = useState({
    adoption: 0,
    veterinary: 0,
    total: 0
  });

  // Add event emitter for badge refresh
  const emitUpdateBadge = () => {
    const event = new CustomEvent('refreshPendingCount');
    window.dispatchEvent(event);
  };

  useEffect(() => {
    fetchCenters();
    fetchPendingCounts();
    fetchPendingCenters();
  }, []);

  const fetchCenters = async () => {
    try {
      setLoading(true);
      const response = await fetch('https://pawsconnect.rf.gd/get_centers.php');

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const result = await response.json();
      console.log('Centers data:', result); // Debug log
      
      if (result.status === 'success' && Array.isArray(result.data)) {
        setCenters(result.data);
        setError(null);
      } else {
        throw new Error('Invalid data format received');
      }
    } catch (err) {
      console.error('Error fetching centers:', err);
      setError('Failed to fetch centers: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingCounts = async () => {
    try {
      const response = await fetch('https://pawsconnect.rf.gd/get_pending_count.php');
      const data = await response.json();
      if (data.status === 'success') {
        setPendingCounts(data.counts);
      }
    } catch (error) {
      console.error('Error fetching counts:', error);
    }
  };

  const fetchPendingCenters = async () => {
    try {
      console.log('Fetching pending centers...');
      const response = await fetch('https://pawsconnect.rf.gd/get_pending_centers.php');

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const text = await response.text();
      console.log('Raw response:', text);

      const data = JSON.parse(text);
      console.log('Parsed data:', data);

      if (data.status === 'success') {
        if (Array.isArray(data.centers)) {
          console.log('Found centers:', data.centers.length);
          setPendingCenters(data.centers);
          setError(null);
        } else {
          throw new Error('Centers data is not an array');
        }
      } else {
        throw new Error(data.message || 'Failed to fetch centers');
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Failed to fetch centers: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  };

  const handleApprove = async (centerId: number) => {
    try {
      const response = await fetch('https://pawsconnect.rf.gd/update_center_status.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          centerId,
          status: 'approved'
        }),
      });

      if (response.ok) {
        await fetchCenters(); // Refresh centers list
        await fetchPendingCounts(); // Refresh counts
        emitUpdateBadge(); // Emit event to refresh navigation badge
      }
    } catch (error) {
      console.error('Error approving center:', error);
    }
  };

  const handleReject = async (centerId: number) => {
    try {
      const response = await fetch('https://pawsconnect.rf.gd/update_center_status.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          centerId,
          status: 'rejected'
        }),
      });

      if (response.ok) {
        await fetchCenters(); // Refresh centers list
        await fetchPendingCounts(); // Refresh counts
        emitUpdateBadge(); // Emit event to refresh navigation badge
      }
    } catch (error) {
      console.error('Error rejecting center:', error);
    }
  };

  const statusActions = {
    pending: [
      { label: 'Approve', action: 'approved', className: 'bg-green-100 text-green-700 hover:bg-green-200' },
      { label: 'Reject', action: 'rejected', className: 'bg-red-100 text-red-700 hover:bg-red-200' }
    ],
    approved: [
      { label: 'Reject', action: 'rejected', className: 'bg-red-100 text-red-700 hover:bg-red-200' }
    ],
    rejected: [
      { label: 'Approve', action: 'approved', className: 'bg-green-100 text-green-700 hover:bg-green-200' }
    ]
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Center Approval Dashboard</h1>
        
        {/* Center Type Tabs */}
        <div className="flex gap-4 mb-6">
          <button
            className={`relative px-6 py-2 rounded-lg font-semibold transition-all duration-200
              ${activeTab === 'adoption' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600'}`}
            onClick={() => setActiveTab('adoption')}
          >
            Adoption Centers
            {pendingCounts.adoption > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                {pendingCounts.adoption}
              </span>
            )}
          </button>
          <button
            className={`relative px-6 py-2 rounded-lg font-semibold transition-all duration-200
              ${activeTab === 'veterinary' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600'}`}
            onClick={() => setActiveTab('veterinary')}
          >
            Veterinary Centers
            {pendingCounts.veterinary > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                {pendingCounts.veterinary}
              </span>
            )}
          </button>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex gap-3 mb-6">
          {(['all', 'pending', 'approved', 'rejected'] as StatusFilter[]).map((status) => (
            <button
              key={status}
              className={`px-4 py-2 rounded-lg font-semibold capitalize transition-all duration-200
                ${statusFilter === status 
                  ? 'bg-indigo-100 text-indigo-600' 
                  : 'bg-gray-100 text-gray-600'}`}
              onClick={() => setStatusFilter(status)}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Centers List */}
        <div className="bg-white rounded-lg shadow-md">
          {loading ? (
            <div className="p-4 text-center text-gray-500">Loading...</div>
          ) : error ? (
            <div className="p-4 text-center text-red-500">{error}</div>
          ) : centers.length === 0 ? (
            <div className="p-4 text-center text-gray-500">No centers found</div>
          ) : (
            centers
              .filter(center => center.center_type === activeTab)
              .filter(center => statusFilter === 'all' || center.status === statusFilter)
              .map(center => (
                <div key={center.id} className="p-4 border-b last:border-b-0">
                  <div className="flex justify-between items-center">
                    <div className="flex-1">
                      <div className="flex items-center gap-4">
                        <h3 className="text-lg font-semibold">{center.name}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          center.status === 'approved' ? 'bg-green-100 text-green-600' :
                          center.status === 'rejected' ? 'bg-red-100 text-red-600' :
                          'bg-yellow-100 text-yellow-600'
                        }`}>
                          {center.status}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-4 mt-2 text-sm text-gray-600">
                        <p>Email: {center.email}</p>
                        <p>License: {center.license_number}</p>
                        <p>Date: {center.registration_date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {center.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleApprove(center.id)}
                            className="p-2 bg-green-100 text-green-600 rounded-full hover:bg-green-200 transition duration-200"
                            title="Approve"
                          >
                            <Check size={16} />
                          </button>
                          <button
                            onClick={() => handleReject(center.id)}
                            className="p-2 bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition duration-200"
                            title="Reject"
                          >
                            <X size={16} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
