import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { Dog, Calendar, Users, AlertCircle, Plus, Edit, Check, X, Search, Trash2 } from 'lucide-react';
import AddPetModal from '../components/AddPetModal';

interface Pet {
  id: number;
  center_id: number;
  name: string;
  age: string;
  breed: string;
  type: string;
  image: string;
  medical_history: string;
  behavior: string[];
  special_needs: string[];
  status: 'available' | 'pending' | 'approved';
}

interface AdoptionRequest {
  id: number;
  pet_id: number;
  pet_name: string;
  pet_image: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

interface DashboardStats {
  pending_requests: number;
  adopted_pets: number;
  available_pets: number;
}

export default function CenterDashboard() {
  const centerType = localStorage.getItem('centerType');
  const [pets, setPets] = useState<Pet[]>([]);
  const [requests, setRequests] = useState<AdoptionRequest[]>([]);
  const [showAddPetModal, setShowAddPetModal] = useState(false);
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [adoptionRequests, setAdoptionRequests] = useState<AdoptionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const centerId = localStorage.getItem('centerId');
  const [stats, setStats] = useState<DashboardStats>({
    pending_requests: 0,
    adopted_pets: 0,
    available_pets: 0
  });

  const animalTypes = [
    'all',
    'dog',
    'cat',
    'bird',
    'rabbit',
    'hamster',
    'guinea pig',
    'fish',
    'reptile',
    'other'
  ];

  if (centerType === 'veterinary') {
    return null; // Veterinary centers use VeterinaryDashboard
  }

  const handleAddPet = () => {
    setShowAddPetModal(true);
  };

  const handleEditPet = (pet: Pet) => {
    // Format the pet data to match form structure
    const formattedPet = {
      ...pet,
      medicalHistory: pet.medical_history,
      behavior: Array.isArray(pet.behavior) ? pet.behavior : [''],
      specialNeeds: Array.isArray(pet.special_needs) ? pet.special_needs : ['']
    };
    setSelectedPet(formattedPet);
    setShowAddPetModal(true);
  };

  const handleUpdatePetStatus = (petId: number, status: Pet['status']) => {
    setPets(pets.map(pet => 
      pet.id === petId ? { ...pet, status } : pet
    ));
  };

  const handleSavePet = async (petData: any) => {
    console.log('handleSavePet called with:', petData);
    
    try {
      const centerId = localStorage.getItem('centerId');
      if (!centerId) {
        alert('Center ID not found. Please login again.');
        return;
      }
  
      const formData = new FormData();
      
      // Create pet info object with required fields
      const petInfo = {
        center_id: parseInt(centerId),
        name: petData.name,
        age: petData.age,
        breed: petData.breed,
        type: petData.type || 'Dog', // Default value
        medical_history: petData.medical_history || '',
        behavior: petData.behavior || [],
        special_needs: petData.special_needs || []
      };
  
      // Add image if exists
      if (petData.image) {
        formData.append('image', petData.image);
      }
  
      // Add pet data
      formData.append('petData', JSON.stringify(petInfo));
  
      console.log('Sending form data:', {
        petInfo,
        hasImage: !!petData.image
      });

      const response = await fetch('https://pawsconnect.rf.gd/add_pet.php', {
        method: 'POST',
        body: formData
      });
  
      const result = await response.json();
      console.log('Server response:', result);
  
      if (result.status === 'success') {
        alert('Pet added successfully!');
        setShowAddPetModal(false);
        fetchPets(); // Refresh the pet list
        fetchDashboardStats(); // Refresh stats after adding pet
      } else {
        throw new Error(result.message || 'Failed to add pet');
      }
    } catch (error) {
      console.error('Error saving pet:', error);
      alert('Failed to add pet. Please try again.');
    }
  };

  const fetchPets = async () => {
    try {
        const centerId = localStorage.getItem('centerId');
        if (!centerId) {
            throw new Error('Center ID not found');
        }

        const response = await fetch('https://pawsconnect.rf.gd/get_center_pets.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ center_id: centerId })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        if (data.status === 'success') {
            setPets(data.data);
        } else {
            throw new Error(data.message || 'Failed to fetch pets');
        }
    } catch (error) {
        console.error('Error fetching pets:', error);
    }
};

  const handleDeletePet = async (petId: number) => {
    if (!window.confirm('Are you sure you want to delete this pet?')) {
      return;
    }
  
    try {
      const centerId = localStorage.getItem('centerId');
      const response = await fetch('https://pawsconnect.rf.gd/delete_pet.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: petId,
          center_id: parseInt(centerId || '0')
        })
      });
  
      const result = await response.json();
      if (result.status === 'success') {
        await fetchPets(); // Refresh the list
        alert('Pet deleted successfully');
        fetchDashboardStats(); // Refresh stats after deleting pet
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('Error deleting pet:', error);
      alert('Failed to delete pet: ' + (error.message || 'Unknown error'));
    }
  };

  const handleAdoptionStatus = async (requestId: number, petId: number, status: 'approved' | 'rejected') => {
    try {
      const response = await fetch('https://pawsconnect.rf.gd/update_adoption_status.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          request_id: requestId,
          pet_id: petId,
          status: status
        })
      });
  
      const result = await response.json();
      if (result.status === 'success') {
        // Refresh adoption requests
        fetchAdoptionRequests();
        alert(`Adoption request ${status} successfully`);
        fetchDashboardStats(); // Refresh stats after updating adoption status
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      alert('Failed to update adoption status');
      console.error('Error:', error);
    }
  };

  const fetchAdoptionRequests = async () => {
    try {
      const centerId = localStorage.getItem('centerId');
      const response = await fetch(`https://pawsconnect.rf.gd/get_adoption_requests.php?center_id=${centerId}`);
      if (!response.ok) throw new Error('Network response was not ok');
      
      const result = await response.json();
      if (result.status === 'success') {
        setAdoptionRequests(result.data);
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('Error fetching adoption requests:', error);
      setError('Failed to load adoption requests');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (requestId: number, status: 'approved' | 'rejected') => {
    try {
      const response = await fetch('https://pawsconnect.rf.gd/update_adoption_status.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ request_id: requestId, status })
      });

      const result = await response.json();
      if (result.status === 'success') {
        fetchAdoptionRequests(); // Refresh the list
        fetchDashboardStats(); // Refresh stats after status update
      }
    } catch (error) {
      console.error('Error updating adoption status:', error);
    }
  };

  const fetchDashboardStats = async () => {
    try {
      const centerId = localStorage.getItem('centerId');
      const response = await fetch(`https://pawsconnect.rf.gd/get_center_stats.php?center_id=${centerId}`);
      const result = await response.json();
      
      if (result.status === 'success') {
        setStats(result.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    }
  };

  // Add sample data
  useEffect(() => {
    fetchPets();
    fetchAdoptionRequests();
    fetchDashboardStats();
    // setRequests([
    //   {
    //     id: 1,
    //     pet_id: 2,
    //     pet_name: "Luna",
    //     customer_name: "John Smith",
    //     customer_email: "john@example.com",
    //     customer_phone: "123-456-7890",
    //     status: "pending",
    //     created_at: "2024-03-20",
    //     pet_image: "https://placehold.co/200x200?text=No+Image"
    //   },
    //   {
    //     id: 2,
    //     pet_id: 1,
    //     pet_name: "Max",
    //     customer_name: "Sarah Johnson",
    //     customer_email: "sarah@example.com",
    //     customer_phone: "987-654-3210",
    //     status: "approved",
    //     created_at: "2024-03-19",
    //     pet_image: "https://placehold.co/200x200?text=No+Image"
    //   }
    // ]);
  }, []);

  const getImageUrl = (pet: Pet) => {
    if (!pet.image_url) return 'https://placehold.co/400x300?text=No+Image';
    return `https://pawsconnect.rf.gd/${pet.image_url}`;
  };

  const renderPetsList = () => {
    const filteredPets = pets.filter(pet => {
      const matchesSearch = searchTerm.toLowerCase() === '' || 
        pet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pet.breed.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = selectedType === 'all' || pet.type.toLowerCase() === selectedType.toLowerCase();
      const matchesStatus = ['available', 'pending'].includes(pet.status);
      return matchesSearch && matchesType && matchesStatus;
    });

    return (
      <div className="h-[450px] overflow-y-auto pr-2">
        <div className="space-y-4">
          {filteredPets.map(pet => (
            <div key={pet.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition duration-200">
              <div className="flex items-center gap-4">
                <img 
                  src={getImageUrl(pet)}
                  alt={pet.name}
                  className="w-16 h-16 rounded-lg object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://placehold.co/200x200?text=No+Image';
                  }}
                />
                <div>
                  <h3 className="font-semibold text-lg">{pet.name}</h3>
                  <p className="text-gray-600">{pet.breed}, {pet.age}</p>
                  <div className="flex gap-2 mt-1">
                    {pet.behavior?.slice(0, 2).map((trait, i) => (
                      <span key={i} className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs rounded-full">
                        {trait}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleDeletePet(pet.id)}
                  className="p-2 text-red-600 hover:text-red-700"
                  title="Delete pet"
                >
                  <Trash2 size={18} />
                </button>
                <button
                  onClick={() => handleEditPet(pet)}
                  className="p-2 text-gray-600 hover:text-indigo-600"
                  title="Edit pet"
                >
                  <Edit size={18} />
                </button>
                <span className={`px-3 py-1 rounded-full text-sm ${
                  pet.status === 'available' ? 'bg-green-100 text-green-800' :
                  pet.status === 'adopted' ? 'bg-blue-100 text-blue-800' :
                  'bg-orange-100 text-orange-800'
                }`}>
                  {pet.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const filteredPets = pets.filter(pet => {
    const matchesSearch = pet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         pet.breed.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || pet.type === selectedType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Adoption Center Dashboard</h1>
          <button
            onClick={handleAddPet}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            <Plus size={20} />
            Add New Pet
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-500 text-sm">Pending Requests</h3>
            <p className="text-3xl font-bold text-indigo-600">{stats.pending_requests}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-500 text-sm">Adopted Pets</h3>
            <p className="text-3xl font-bold text-green-600">{stats.adopted_pets}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-500 text-sm">Available Pets</h3>
            <p className="text-3xl font-bold text-blue-600">{stats.available_pets}</p>
          </div>
        </div>

        {/* Pets and Requests Grid */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Pet List */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-6">Pets</h2>
            
            {/* Search and Filter */}
            <div className="mb-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search pets by name or breed..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 capitalize"
                >
                  {animalTypes.map(type => (
                    <option key={type} value={type} className="capitalize">
                      {type === 'all' ? 'All Pets' : type}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Scrollable Pet List */}
            {renderPetsList()}
          </div>

          {/* Adoption Requests */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-6">Adoption Requests</h2>
            
            {/* Scrollable Requests List */}
            <div className="h-[450px] overflow-y-auto pr-2">
              {loading ? (
                <div>Loading requests...</div>
              ) : error ? (
                <div className="text-red-500">{error}</div>
              ) : adoptionRequests.length === 0 ? (
                <div className="text-gray-500">No pending adoption requests</div>
              ) : (
                <div className="space-y-4">
                  {adoptionRequests.map(request => (
                    <div key={request.id} className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-semibold text-lg">{request.customer_name}</h3>
                          <p className="text-gray-600">For: {request.pet_name}</p>
                          <p className="text-sm text-gray-500">Phone: {request.customer_phone}</p>
                          <p className="text-sm text-gray-500">Requested on: {new Date(request.created_at).toLocaleDateString()}</p>
                        </div>
                        {request.status === 'pending' && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleUpdateStatus(request.id, 'approved')}
                              className="p-2 bg-green-500 text-white rounded-full hover:bg-green-600"
                            >
                              <Check size={20} />
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(request.id, 'rejected')}
                              className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
                            >
                              <X size={20} />
                            </button>
                          </div>
                        )}
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm ${
                        request.status === 'approved' ? 'bg-green-100 text-green-800' :
                        request.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        'bg-orange-100 text-orange-800'
                      }`}>
                        {request.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {showAddPetModal && (
        <AddPetModal
          pet={selectedPet}
          onClose={() => {
            setShowAddPetModal(false);
            setSelectedPet(null);
          }}
          onSave={handleSavePet}
          onSuccess={fetchPets} // Add this new prop
        />
      )}
      <Footer />
    </div>
  );
}