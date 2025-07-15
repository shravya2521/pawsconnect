import React, { useState, useEffect, useRef } from 'react';
import { Camera, Save, X } from 'lucide-react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';

const DEFAULT_AVATAR = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iI0NDQ0NDQyI+PHBhdGggZD0iTTEyIDJDNi40OCAyIDIgNi40OCAyIDEyczQuNDggMTAgMTAgMTAgMTAtNC40OCAxMC0xMFMxNy41MiAyIDEyIDJ6bTAgM2MyLjIxIDAgNCAxLjc5IDQgNHMtMS43OSA0LTQgNC00LTEuNzktNC00IDEuNzktNCA0LTR6bTAgMTQuMmMtMi41IDAtNC43LTEuMjgtNi02LjIgMy4wMy0xLjk4IDctMS45OCAxMCAwLTEuMyA0LjkyLTMuNSA2LjItNiA2LjJ6Ii8+PC9zdmc+';

export default function CenterProfile() {
  const [profile, setProfile] = useState({
    name: '',
    contactEmail: '',
    address: '',
    phone: '',
    license: '',
    description: '',
    avatar: null
  });
  const [originalProfile, setOriginalProfile] = useState(null); // Store original data
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const centerId = localStorage.getItem('centerId');

  useEffect(() => {
    if (centerId) {
      fetchProfile();
    }
  }, [centerId]);

  const fetchProfile = async () => {
    try {
      if (!centerId) {
        throw new Error('Center ID not found');
      }

      const response = await fetch(`https://pawsconnect.rf.gd/get_center_profile.php?id=${centerId}`);

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      if (data.status === 'success') {
        setProfile(data.profile);
        setOriginalProfile(data.profile); // Store original data
        if (data.profile.avatar) {
          const imageUrl = `data:image/jpeg;base64,${data.profile.avatar}`;
          setPreviewImage(imageUrl);
          setOriginalImage(imageUrl);
        }
      } else {
        throw new Error(data.message || 'Failed to fetch profile');
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
      alert('Failed to load profile. Please try again.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    
    // Add centerId to formData
    formData.append('centerId', centerId || '');
    
    Object.entries(profile).forEach(([key, value]) => {
      if (value !== null) {
        formData.append(key, value.toString());
      }
    });

    if (fileInputRef.current?.files?.[0]) {
      formData.append('avatar', fileInputRef.current.files[0]);
    }

    try {
      const response = await fetch('https://pawsconnect.rf.gd/update_center_profile.php', {
        method: 'POST',
        body: formData
      });
      const data = await response.json();
      
      if (data.status === 'success') {
        alert('Profile updated successfully');
        await fetchProfile();
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      alert('Failed to update profile');
    }
  };

  const handleCancel = () => {
    setProfile(originalProfile); // Restore original data
    setPreviewImage(originalImage); // Use stored original image
    if (fileInputRef.current) {
      fileInputRef.current.value = ''; // Reset file input
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
          userId: centerId,
          userType: 'center'
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-6">Center Profile</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
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

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Center Name
                </label>
                <input
                  type="text"
                  value={profile.name}
                  className="w-full px-4 py-2 border rounded-lg bg-gray-50"
                  disabled
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contact Email
                </label>
                <input
                  type="email"
                  value={profile.contactEmail}
                  onChange={(e) => setProfile({ ...profile, contactEmail: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  License Number
                </label>
                <input
                  type="text"
                  value={profile.license}
                  className="w-full px-4 py-2 border rounded-lg bg-gray-50"
                  disabled
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address
              </label>
              <textarea
                value={profile.address}
                onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={profile.description}
                onChange={(e) => setProfile({ ...profile, description: e.target.value })}
                rows={4}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                required
              />
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
