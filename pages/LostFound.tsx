import React, { useState, useEffect } from 'react';
import { Search, MapPin, Calendar, Upload, Check, X, Phone, Mail } from 'lucide-react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';

interface Pet {
  id: number;
  pet_name: string;  // Changed from petName to match database
  description: string;
  location: string;
  date: string;
  image: string;
  status: string;
  reporter_id: number;
  reporter_type: string;
  contact_name: string;  // Ensure these match your database fields
  contact_phone: string;
  contact_email: string;
  last_seen_details: string;
  type: string; // Added type property
}

export default function LostFound() {
  const [activeTab, setActiveTab] = useState<'lost' | 'found' | 'resolved'>('lost');
  const [showForm, setShowForm] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Pet | null>(null);
  const [reports, setReports] = useState<Pet[]>([]);
  const [error, setError] = useState<string | null>(null); // Add this line
  const [loading, setLoading] = useState(true);
  const isAdmin = localStorage.getItem('userType') === 'admin';
  const userId = localStorage.getItem('userId');

  const fetchReports = async () => {
    try {
      console.log('Fetching reports...');
      const response = await fetch('https://pawsconnect.rf.gd/get_lost_found_reports.php');
      
      const responseText = await response.text();
      console.log('Raw response:', responseText);

      if (!responseText.trim()) {
        throw new Error('Empty response received from server');
      }

      let result;
      try {
        result = JSON.parse(responseText);
      } catch (e) {
        console.error('JSON Parse Error:', e);
        console.error('Response Text:', responseText);
        throw new Error('Invalid JSON response from server: ' + responseText.substring(0, 100));
      }

      if (!result) {
        throw new Error('No data received from server');
      }

      if (result.status === 'success' && Array.isArray(result.data)) {
        const formattedReports = result.data.map((report: any) => ({
          id: parseInt(report.id),
          pet_name: report.pet_name || 'Unknown Pet',
          description: report.description || '',
          location: report.location || '',
          date: report.date || '',
          image: report.image || '',
          status: report.status || 'active',
          reporter_id: parseInt(report.reporter_id) || 0,
          reporter_type: report.reporter_type || '',
          contact_name: report.contact_name || '',
          contact_phone: report.contact_phone || '',
          contact_email: report.contact_email || '',
          type: report.type || 'unknown'
        }));

        setReports(formattedReports);
      } else {
        throw new Error(result.message || 'Invalid data format received');
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch reports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleReportClick = (type: 'lost' | 'found' | 'resolved') => {
    setActiveTab(type);
    setShowForm(true);
  };

  const handleResolveReport = async (reportId: number) => {
    if (!window.confirm('Are you sure you want to mark this case as resolved?')) return;

    try {
      const userType = localStorage.getItem('userType');
      const userId = userType === 'center' ? 
        parseInt(localStorage.getItem('centerId') || '0') : 
        parseInt(localStorage.getItem('customerId') || '0');

      const response = await fetch('https://pawsconnect.rf.gd/resolve_report.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reportId,
          userId,
          userType // Added userType
        })
      });

      const data = await response.json();
      if (data.status === 'success') {
        alert('Case marked as resolved successfully!');
        fetchReports();
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Error resolving report:', error);
      alert('Failed to resolve case. Please try again.');
    }
  };

  // Move getImageUrl function here, before any components that use it
  const getImageUrl = (pet: Pet) => {
    if (!pet.image) return 'https://placehold.co/400x300?text=No+Image';
    
    // If image is already a data URL, return it
    if (typeof pet.image === 'string' && pet.image.startsWith('data:')) {
      return pet.image;
    }
    
    // For base64 strings that don't include the data URL prefix
    if (typeof pet.image === 'string') {
      return `data:image/jpeg;base64,${pet.image}`;
    }
    
    return 'https://placehold.co/400x300?text=No+Image';
  };

  const ReportForm = () => {
    const [formInputs, setFormInputs] = useState({
      petName: '',
      description: '',
      location: '',
      date: '',
      lastSeenDetails: '',
      contactName: '',
      contactPhone: '',
      contactEmail: '',
      image: null as File | null,
      imagePreview: '' as string
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      
      if (name === 'contactPhone') {
        const numbersOnly = value.replace(/\D/g, '');
        if (numbersOnly.length <= 10) {
          setFormInputs(prev => ({ ...prev, [name]: numbersOnly }));
        }
        return;
      }

      setFormInputs(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        const objectUrl = URL.createObjectURL(file);
        
        setFormInputs(prev => ({
          ...prev,
          image: file,
          imagePreview: objectUrl
        }));
      }
    };

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      
      try {
        const data = new FormData();
        const userType = localStorage.getItem('userType');
        const userId = userType === 'center' ? 
            localStorage.getItem('centerId') : 
            localStorage.getItem('customerId');

        console.log('Submitting with user info:', { userType, userId }); // Debug log

        if (!userId || !userType) {
            throw new Error('User not logged in');
        }

        // Add user info to form data
        data.append('user_id', userId);
        data.append('user_type', userType); // Remove the admin check, send raw userType
        data.append('type', activeTab);

        // First append all text fields
        Object.entries(formInputs).forEach(([key, value]) => {
            if (key !== 'image' && key !== 'imagePreview' && value !== null) {
                data.append(key, value);
            }
        });

        // Then append the image file if it exists
        if (formInputs.image instanceof File) {
            data.append('image', formInputs.image, formInputs.image.name);
            console.log('Appending image:', formInputs.image.name, formInputs.image.type);
        }

        console.log('FormData entries:');
        for (const pair of data.entries()) {
            console.log(pair[0], pair[1]);
        }

        const response = await fetch('https://pawsconnect.rf.gd/report_pet.php', {
            method: 'POST',
            body: data
        });

        const responseText = await response.text();
        let result;
        
        try {
            result = JSON.parse(responseText);
        } catch (err) {
            console.log('Raw server response:', responseText);
            throw new Error('Server returned invalid JSON. Check console for details.');
        }

        if (result.status === 'success') {
            alert('Report submitted successfully!');
            setShowForm(false);
            fetchReports();
        } else {
            throw new Error(result.message || 'Failed to submit report');
        }

    } catch (err) {
        console.error('Error:', err);
        alert(err instanceof Error ? err.message : 'Failed to submit report');
    }
    };

    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-6">Report a {activeTab} Pet</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="petName" className="block text-sm font-medium text-gray-700 mb-1">
              Pet's Name (optional)
            </label>
            <input
              type="text"
              name="petName"
              id="petName"
              value={formInputs.petName}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Enter pet's name if known"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              name="description"
              id="description"
              value={formInputs.description}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Describe the pet (breed, color, size, distinguishing features, etc.)"
              required
            />
          </div>

          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
              Last Seen Location
            </label>
            <input
              type="text"
              name="location"
              id="location"
              value={formInputs.location}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Enter the location where the pet was last seen"
              required
            />
          </div>

          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
              Date
            </label>
            <input
              type="date"
              name="date"
              id="date"
              value={formInputs.date}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              required
            />
          </div>

          

          <div>
            <label htmlFor="contactName" className="block text-sm font-medium text-gray-700 mb-1">
              Contact Name
            </label>
            <input
              type="text"
              name="contactName"
              id="contactName"
              value={formInputs.contactName}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label htmlFor="contactPhone" className="block text-sm font-medium text-gray-700 mb-1">
              Contact Phone (10 digits)
            </label>
            <input
              type="tel"
              name="contactPhone"
              id="contactPhone"
              value={formInputs.contactPhone}
              onChange={handleChange}
              pattern="[0-9]{10}"
              maxLength={10}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700 mb-1">
              Contact Email
            </label>
            <input
              type="email"
              name="contactEmail"
              id="contactEmail"
              value={formInputs.contactEmail}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Upload Photo
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
              <div className="space-y-1 text-center">
                {formInputs.imagePreview ? (
                  <div className="mb-4">
                    <img 
                      src={formInputs.imagePreview} 
                      alt="Preview" 
                      className="mx-auto h-32 w-32 object-cover rounded-lg"
                    />
                  </div>
                ) : (
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                )}
                <div className="flex text-sm text-gray-600">
                  <label
                    htmlFor="file-upload"
                    className="relative cursor-pointer rounded-md font-medium text-indigo-600 hover:text-indigo-500"
                  >
                    <span>Click to upload</span>
                    <input
                      id="file-upload"
                      name="image"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="sr-only"
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">
                  PNG, JPG, GIF up to 10MB
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              className="flex-1 bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition duration-200"
            >
              Submit Report
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition duration-200"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    );
  };

  const filteredReports = reports.filter((report) => {
    console.log('Filtering report:', report);
    if (activeTab === 'resolved') {
      return report.status === 'resolved';
    }
    return report.type === activeTab && report.status === 'active';
  });

  const PetCard = ({ pet }: { pet: Pet }) => {
    const userType = localStorage.getItem('userType');
    const customerId = parseInt(localStorage.getItem('customerId') || '0');
    const centerId = parseInt(localStorage.getItem('centerId') || '0');

    console.log('Debug PetCard:', {
        userType,
        customerId,
        centerId,
        petReporterType: pet.reporter_type,
        petReporterId: pet.reporter_id,
        petStatus: pet.status
    });

    const canResolve = 
        pet.status === 'active' && 
        ((userType === 'customer' && pet.reporter_type === 'customer' && pet.reporter_id === customerId) ||
         (userType === 'center' && pet.reporter_type === 'center' && pet.reporter_id === centerId));

    return (
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="relative">
          <img 
            src={getImageUrl(pet)}
            alt={pet.pet_name || 'Pet'} 
            className="w-full h-48 object-cover rounded-lg"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              console.log('Image failed to load for pet:', pet.id);
              target.onerror = null; // Prevent infinite loop
              target.src = 'https://placehold.co/400x300?text=No+Image';
            }}
          />
        </div>
        <div className="p-4">
          <h3 className="text-xl font-semibold mb-2">{pet.pet_name}</h3>
          <p className="text-gray-600 mb-2">{pet.description}</p>
          <div className="flex items-center gap-2 text-gray-600 mb-2">
            <MapPin size={16} />
            <span>{pet.location}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600 mb-4">
            <Calendar size={16} />
            <span>{pet.date}</span>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setSelectedReport(pet)}
              className="flex-1 bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition duration-200"
            >
              View Details
            </button>
            {canResolve && (
              <button
                onClick={() => handleResolveReport(pet.id)}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition duration-200"
                title="Mark as resolved"
              >
                <Check size={20} />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 py-8">
        {!isAdmin && !showForm && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Report a Pet</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <button
                className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition duration-200"
                onClick={() => handleReportClick('lost')}
              >
                <h3 className="text-lg font-semibold mb-2">Report Lost Pet</h3>
                <p className="text-gray-600">Lost your pet? File a report and we'll help you find them.</p>
              </button>
              <button
                className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition duration-200"
                onClick={() => handleReportClick('found')}
              >
                <h3 className="text-lg font-semibold mb-2">Report Found Pet</h3>
                <p className="text-gray-600">Found a pet? Help them reunite with their family.</p>
              </button>
            </div>
          </div>
        )}

        {showForm && <ReportForm />}

        <div className="mb-8">
          <div className="flex gap-4 mb-6">
            <button
              className={`px-6 py-2 rounded-lg ${activeTab === 'lost' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700'}`}
              onClick={() => setActiveTab('lost')}
            >
              Lost Pets
            </button>
            <button
              className={`px-6 py-2 rounded-lg ${activeTab === 'found' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700'}`}
              onClick={() => setActiveTab('found')}
            >
              Found Pets
            </button>
            <button
              className={`px-6 py-2 rounded-lg ${activeTab === 'resolved' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700'}`}
              onClick={() => setActiveTab('resolved')}
            >
              Resolved Cases
            </button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              <div className="col-span-full text-center py-8">Loading...</div>
            ) : reports.length === 0 ? (
              <div className="col-span-full text-center py-8">
                {activeTab === 'resolved' ? 'No resolved cases yet.' : `No ${activeTab} pets reported yet.`}
              </div>
            ) : (
              filteredReports.map((report) => (
                <PetCard key={report.id} pet={report} />
              ))
            )}
          </div>
        </div>

        {selectedReport && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
                <h2 className="text-2xl font-bold">
                  {selectedReport.type === 'lost' ? 'Lost Pet Details' : 'Found Pet Details'}
                </h2>
                <button
                  onClick={() => setSelectedReport(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={24} />
                </button>
              </div>
              
              <div className="p-6">
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <img
                      src={getImageUrl(selectedReport)}
                      alt={selectedReport.pet_name || 'Pet'}
                      className="w-full h-64 object-cover rounded-lg mb-4"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'https://placehold.co/400x300?text=No+Image';
                      }}
                    />
                    <h3 className="text-xl font-semibold mb-2">
                      {selectedReport.pet_name || 'Unknown Pet'}
                    </h3>
                    <p className="text-gray-600 mb-4">{selectedReport.description}</p>
                  </div>
                  
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold mb-2">Last Seen Details</h4>
                      <div className="flex items-center gap-2 text-gray-600 mb-2">
                        <MapPin size={16} />
                        <span>{selectedReport.location}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600 mb-2">
                        <Calendar size={16} />
                        <span>{selectedReport.date}</span>
                      </div>
                      {selectedReport.last_seen_details && (
                        <p className="text-gray-600 mt-2 p-3 bg-gray-50 rounded-lg">
                          {selectedReport.last_seen_details}
                        </p>
                      )}
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">Contact Information</h4>
                      <div className="space-y-2">
                        <p className="text-gray-600">{selectedReport.contact_name}</p>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Phone size={16} />
                          <a href={`tel:${selectedReport.contact_phone}`} className="hover:text-indigo-600">
                            {selectedReport.contact_phone}
                          </a>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Mail size={16} />
                          <a href={`mailto:${selectedReport.contact_email}`} className="hover:text-indigo-600">
                            {selectedReport.contact_email}
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}