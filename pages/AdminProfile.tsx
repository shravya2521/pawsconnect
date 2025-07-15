import React, { useState, useEffect, useRef } from 'react';
import { Camera, Save, User, X } from 'lucide-react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';

const DEFAULT_AVATAR = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iI0NDQ0NDQyI+PHBhdGggZD0iTTEyIDJDNi40NyAyIDIgNi40NyAyIDEyczQuNDcgMTAgMTAgMTAgMTAtNC40NyAxMC0xMFMxNy41MyAyIDEyIDJ6bTAgMThjLTQuNDEgMC04LTMuNTktOC04czMuNTktOCA4LTggOCAzLjU5IDggOC0zLjU5IDgtOCA4em0tMTJjLTIuMjEgMC00IDEuNzktNCA0czEuNzkgNCA0IDQgNC0xLjc5IDQtNC0xLjc5LTQtNHptMCAxMGMtMy4zMSAwLTYgMS42OS02IDIuNzV2MS4yNWg2di0yLjc1YzAtMS4xMDYtMi42OS0yLjc1LTYtMi43NXoiLz48L3N2Zz4=';

export default function AdminProfile() {
  const [profile, setProfile] = useState({
    name: localStorage.getItem('adminName') || '',
    email: localStorage.getItem('adminEmail') || '',
    contact_email: '',  // Add contact email field
    phone: '',
    avatar: ''
  });
  const [originalProfile, setOriginalProfile] = useState(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const adminId = localStorage.getItem('adminId');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await fetch(`https://pawsconnect.rf.gd/get_admin_profile.php?id=${adminId}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      
      if (data.status === 'success') {
        setProfile(prev => ({
          ...prev,
          ...data.profile,
          contact_email: data.profile.contact_email || '', // Explicitly set contact_email
          avatar: data.profile.avatar_url ? `data:image/jpeg;base64,${data.profile.avatar_url}` : DEFAULT_AVATAR
        }));
        setOriginalProfile(data.profile); // Store original profile
        if (data.profile.avatar_url) {
          const imageUrl = `data:image/jpeg;base64,${data.profile.avatar_url}`;
          setPreviewImage(imageUrl);
          setOriginalImage(imageUrl);
        }
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      const response = await fetch('https://pawsconnect.rf.gd/remove_profile_image.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: localStorage.getItem('adminId'),
          userType: 'admin'
        }),
      });

      const data = await response.json();
      if (data.status === 'success') {
        setPreviewImage(null);
        setProfile({ ...profile, avatar: null });
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      console.error('Error removing profile image:', err);
      alert('Failed to remove profile image');
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ''); // Remove non-digits
    setProfile({ ...profile, phone: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
        const formData = new FormData();
        formData.append('id', adminId || '');
        formData.append('name', profile.name);
        formData.append('phone', profile.phone);
        formData.append('contact_email', profile.contact_email); // Add contact_email
        
        if (fileInputRef.current?.files?.[0]) {
            formData.append('avatar', fileInputRef.current.files[0]);
        }

        const response = await fetch('https://pawsconnect.rf.gd/update_admin_profile.php', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();
        if (data.status === 'success') {
            alert('Profile updated successfully!');
            fetchProfile(); // Refresh profile data
        } else {
            throw new Error(data.message || 'Failed to update profile');
        }
    } catch (err) {
        console.error('Error updating profile:', err);
        alert('Failed to update profile. Please try again.');
    }
  };

  const handleCancel = () => {
    setProfile(originalProfile); // Restore original data
    setPreviewImage(originalImage); // Use stored original image
    if (fileInputRef.current) {
      fileInputRef.current.value = ''; // Reset file input
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-6">Admin Profile</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Avatar Section */}
            <div className="flex flex-col items-center mb-6">
              <div className="relative group">
                <img
                  src={previewImage || DEFAULT_AVATAR}
                  alt="Profile"
                  className="w-32 h-32 rounded-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  {previewImage && (
                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 z-10"
                    >
                      <X size={16} />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-0 right-0 bg-indigo-600 text-white p-2 rounded-full hover:bg-indigo-700"
                  >
                    <Camera size={20} />
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                </div>
              </div>
            </div>

            {/* Profile Fields */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Email
                </label>
                <input
                  type="email"
                  value={profile.contact_email}
                  onChange={(e) => setProfile({ ...profile, contact_email: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter your public contact email"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  value={profile.phone}
                  onChange={handlePhoneChange}
                  maxLength={10}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter 10 digit number"
                  required
                />
              </div>
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                className="flex-1 bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition duration-200 flex items-center justify-center gap-2"
              >
                <Save size={20} />
                Save Changes
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="flex-1 bg-gray-100 text-gray-600 py-2 rounded-lg hover:bg-gray-200 transition duration-200 flex items-center justify-center gap-2"
              >
                <X size={20} />
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
}
