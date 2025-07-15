import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Camera, X, Save, XCircle } from 'lucide-react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';

interface CustomerDetails {
  name: string;
  email: string;
  phone: string;
  address: string;
  profile_picture?: string;
}

const CustomerProfile: React.FC = () => {
  const [customerDetails, setCustomerDetails] = useState<CustomerDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState<CustomerDetails | null>(null);
  const customerId = localStorage.getItem('customerId');

  useEffect(() => {
    fetchCustomerDetails();
  }, []);

  const fetchCustomerDetails = async () => {
    try {
      const response = await fetch(`https://pawsconnect.rf.gd/get_customer_details.php?id=${customerId}`);
      const data = await response.json();
      
      if (data.status === 'success') {
        setCustomerDetails(data.customer);
        setFormData(data.customer);
      }
    } catch (error) {
      console.error('Error fetching customer details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'phone') {
      // Only allow digits and limit to 10 characters
      const numbersOnly = value.replace(/\D/g, '');
      if (numbersOnly.length <= 10) {
        setFormData(prev => prev ? { ...prev, [name]: numbersOnly } : null);
      }
      return;
    }
    
    setFormData(prev => prev ? { ...prev, [name]: value } : null);
  };

  const handleSave = async () => {
    if (!formData || !customerId) return;

    try {
      const response = await fetch('https://pawsconnect.rf.gd/update_customer.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customer_id: customerId,
          name: formData.name,
          phone: formData.phone,
          address: formData.address,
        }),
      });

      const data = await response.json();
      if (data.status === 'success') {
        setEditing(false);
        fetchCustomerDetails();
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile');
    }
  };

  const handleCancel = () => {
    setFormData(customerDetails);
    setEditing(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const formData = new FormData();
      formData.append('image', e.target.files[0]);
      formData.append('customer_id', customerId || '');

      try {
        const response = await fetch('https://pawsconnect.rf.gd/update_profile_image.php', {
          method: 'POST',
          body: formData,
        });

        const data = await response.json();
        if (data.status === 'success') {
          fetchCustomerDetails();
        } else {
          throw new Error(data.message);
        }
      } catch (error) {
        console.error('Error uploading image:', error);
        alert('Failed to update profile picture');
      }
    }
  };

  const handleDeleteImage = async () => {
    try {
      const response = await fetch('https://pawsconnect.rf.gd/delete_profile_picture.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ customer_id: customerId }),
      });

      const data = await response.json();
      if (data.status === 'success') {
        fetchCustomerDetails(); // Refresh profile data
      }
    } catch (error) {
      console.error('Error deleting image:', error);
      alert('Failed to delete profile picture');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Customer Profile</h1>
            
            {/* Profile Avatar Section */}
            <div className="relative w-32 h-32 mx-auto mb-6 group">
              <div className="w-full h-full bg-indigo-100 rounded-full flex items-center justify-center overflow-hidden">
                {customerDetails?.profile_picture ? (
                  <img 
                    src={customerDetails.profile_picture}
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User size={64} className="text-indigo-600" />
                )}
              </div>
              {editing && (
                <div className="absolute inset-0 bg-black bg-opacity-40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <label className="cursor-pointer p-2 hover:text-indigo-400 text-white">
                    <Camera size={24} />
                    <input 
                      type="file" 
                      className="hidden" 
                      onChange={handleImageUpload} 
                      accept="image/*"
                    />
                  </label>
                  {customerDetails?.profile_picture && (
                    <button 
                      onClick={handleDeleteImage}
                      className="p-2 hover:text-red-400 text-white"
                    >
                      <X size={24} />
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Profile Form */}
            <form onSubmit={e => e.preventDefault()} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData?.name || ''}
                  onChange={handleInputChange}
                  disabled={!editing}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 disabled:bg-gray-50 disabled:text-gray-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData?.email || ''}
                  onChange={handleInputChange}
                  disabled={!editing}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 disabled:bg-gray-50 disabled:text-gray-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData?.phone || ''}
                  onChange={handleInputChange}
                  disabled={!editing}
                  pattern="[0-9]{10}"
                  maxLength={10}
                  placeholder="Enter 10 digit number"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 disabled:bg-gray-50 disabled:text-gray-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Address</label>
                <textarea
                  name="address"
                  value={formData?.address || ''}
                  onChange={handleInputChange}
                  disabled={!editing}
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 disabled:bg-gray-50 disabled:text-gray-500"
                  placeholder="Enter your address"
                />
              </div>

              <div className="flex justify-end gap-4 pt-4">
                {!editing ? (
                  <button
                    type="button"
                    onClick={() => setEditing(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Edit Profile
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      <XCircle className="mr-2 h-4 w-4" />
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSave}
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </button>
                  </>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CustomerProfile;
