import React, { useState, useRef, useEffect } from 'react';
import { Search, X, Heart, MapPin, Calendar, Syringe, Bone, Cake, Upload, Plus, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';

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
  status: 'available' | 'pending' | 'adopted';
  created_at?: string;
  center_address: string;
  center_name: string;
  center_phone: string;
}

export default function Adopt() {
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPets();
  }, []);

  const fetchPets = async () => {
    try {
      const userType = localStorage.getItem('userType');
      const centerId = localStorage.getItem('centerId');
      
      let url = 'https://pawsconnect.rf.gd/get_pets.php';
      
      // Add query parameters for center users
      if (userType === 'center' && centerId) {
        url += `?userType=${userType}&centerId=${centerId}`;
      }
      
      const response = await fetch(url);
      const result = await response.json();
      
      if (result.status === 'success') {
        setPets(result.data);
      } else {
        throw new Error(result.message);
      }
    } catch (err) {
      console.error('Error fetching pets:', err);
      setError('Failed to load pets');
    } finally {
      setLoading(false);
    }
  };

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [showAddPetForm, setShowAddPetForm] = useState(false);
  const navigate = useNavigate();
  const userType = localStorage.getItem('userType');
  const isCenter = userType === 'center';
  const isAdmin = userType === 'admin';
  const [petsList, setPetsList] = useState<Pet[]>(pets);

  const [newPet, setNewPet] = useState({
    name: '',
    breed: '',
    age: '',
    type: 'Dog',
    medical_history: '',
    behavior: [''],
    special_needs: [''],
    image: ''
  });

  const animalTypes = ['All Pets', 'Dog', 'Cat', 'Bird', 'Rabbit', 'Hamster', 'Guinea Pig', 'Fish', 'Reptile', 'Other'];

  const handleStartAdoption = async (pet: Pet) => {
    const customerId = localStorage.getItem('customerId'); // Changed from userId to customerId
    
    if (!customerId) {
      alert('Please login to submit an adoption request');
      navigate('/login');
      return;
    }

    if (window.confirm(`Are you sure you want to request adoption for ${pet.name}?`)) {
      try {
        const response = await fetch('https://pawsconnect.rf.gd/create_adoption_request.php', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            pet_id: pet.id,
            center_id: pet.center_id,
            customer_id: parseInt(customerId)  // Use customer_id directly
          })
        });

        const result = await response.json();
        if (result.status === 'success') {
          alert(`Thank you for your interest in adopting ${pet.name}! The adoption center will contact you soon for further process.`);
          setSelectedPet(null);
          fetchPets();
        } else {
          throw new Error(result.message);
        }
      } catch (error) {
        alert('Failed to submit adoption request. Please try again.');
        console.error('Error:', error);
      }
    }
  };

  const handleAddBehavior = () => {
    setNewPet(prev => ({
      ...prev,
      behavior: [...prev.behavior, '']
    }));
  };

  const handleAddSpecialNeed = () => {
    setNewPet(prev => ({
      ...prev,
      special_needs: [...prev.special_needs, '']
    }));
  };

  // const handleSubmitPet = (e: React.FormEvent) => {
  //   e.preventDefault();
  //   const newId = Math.max(...petsList.map(p => p.id)) + 1;
  //   const newPetObj: Pet = {
  //     ...newPet,
  //     id: newId,
  //     centerId: 1,
  //     image: newPet.image || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80'
  //   };
  //   setPetsList([...petsList, newPetObj]);
  //   setShowAddPetForm(false);
  // };

  const handleDeletePet = (petId: number) => {
    if (window.confirm('Are you sure you want to remove this pet from the listings?')) {
      setPetsList(prevPets => prevPets.filter(pet => pet.id !== petId));
      setSelectedPet(null);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewPet(prev => ({
          ...prev,
          image: reader.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    if (selectedType === 'all' || selectedType === 'all pets') {
      fetchPets();
    }
  }, [selectedType]);

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const type = e.target.value.toLowerCase();
    setSelectedType(type);
  };

  const filteredPets = pets.filter(pet => {
    const matchesSearch = 
      pet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pet.breed.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pet.type.toLowerCase().includes(searchTerm.toLowerCase());

    if (selectedType === 'all' || selectedType === 'all pets') return matchesSearch;
    return matchesSearch && pet.type.toLowerCase() === selectedType.toLowerCase();
  });

  const displayPets = isCenter 
    ? filteredPets.filter(pet => pet.centerId === 1)
    : filteredPets;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 py-8">
        {isCenter && (
          <div className="mb-8">
            <button
              onClick={() => setShowAddPetForm(true)}
              className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition duration-200 flex items-center gap-2"
            >
              <Plus size={20} />
              Add New Pet
            </button>
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, breed, or location..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            value={selectedType}
            onChange={handleTypeChange}
            className="px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="all">All Pets</option>
            {animalTypes.filter(type => type !== 'All Pets').map((type) => (
              <option key={type} value={type.toLowerCase()}>
                {type}
              </option>
            ))}
          </select>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div>Loading pets...</div>
          ) : error ? (
            <div className="text-red-500">{error}</div>
          ) : (
            filteredPets.map((pet) => (
              <div key={pet.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="relative">
                  <img 
                    src={pet.image || 'https://placehold.co/400x300?text=No+Image'} 
                    alt={pet.name}
                    className="w-full h-48 object-cover"
                  />
                  {pet.status === 'pending' && (
                    <div className="absolute top-2 right-2 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs">
                      Pending Adoption
                    </div>
                  )}
                  {pet.status === 'available' && (
                    <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs">
                      Available
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="text-xl font-semibold mb-2">{pet.name}</h3>
                  <p className="text-gray-600">{pet.breed} • {pet.age}</p>
                  <div className="flex gap-2 mt-2">
                    {(pet.personality || []).slice(0, 2).map((trait, i) => (
                      <span key={i} className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs rounded-full">
                        {trait}
                      </span>
                    ))}
                  </div>
                  <button 
                    onClick={() => setSelectedPet(pet)}
                    className="mt-4 w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {showAddPetForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
                <h2 className="text-2xl font-bold">Add New Pet</h2>
                <button
                  onClick={() => setShowAddPetForm(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={24} />
                </button>
              </div>
              
              <form onSubmit={handleSubmitPet} className="p-6 space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Pet Type
                    </label>
                    <select
                      value={newPet.type}
                      onChange={(e) => setNewPet(prev => ({ ...prev, type: e.target.value }))}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      required
                    >
                      {animalTypes.filter(type => type !== 'All Pets').map((type) => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Pet Name
                    </label>
                    <input
                      type="text"
                      value={newPet.name}
                      onChange={(e) => setNewPet(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Breed
                    </label>
                    <input
                      type="text"
                      value={newPet.breed}
                      onChange={(e) => setNewPet(prev => ({ ...prev, breed: e.target.value }))}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Age
                    </label>
                    <input
                      type="text"
                      value={newPet.age}
                      onChange={(e) => setNewPet(prev => ({ ...prev, age: e.target.value }))}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Medical History
                  </label>
                  <textarea
                    value={newPet.medical_history}
                    onChange={(e) => setNewPet(prev => ({ ...prev, medical_history: e.target.value }))}
                    rows={4}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Behavior Traits
                  </label>
                  {newPet.behavior.map((trait, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={trait}
                        onChange={(e) => {
                          const newTraits = [...newPet.behavior];
                          newTraits[index] = e.target.value;
                          setNewPet(prev => ({ ...prev, behavior: newTraits }));
                        }}
                        className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        placeholder="Enter behavior trait"
                        required
                      />
                      {index === newPet.behavior.length - 1 && (
                        <button
                          type="button"
                          onClick={handleAddBehavior}
                          className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
                        >
                          <Plus size={20} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Special Needs
                  </label>
                  {newPet.special_needs.map((need, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={need}
                        onChange={(e) => {
                          const newNeeds = [...newPet.special_needs];
                          newNeeds[index] = e.target.value;
                          setNewPet(prev => ({ ...prev, special_needs: newNeeds }));
                        }}
                        className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        placeholder="Enter special need"
                        required
                      />
                      {index === newPet.special_needs.length - 1 && (
                        <button
                          type="button"
                          onClick={handleAddSpecialNeed}
                          className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
                        >
                          <Plus size={20} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pet Photo
                  </label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
                    <div className="space-y-1 text-center">
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="flex text-sm text-gray-600">
                        <label className="relative cursor-pointer rounded-md font-medium text-indigo-600 hover:text-indigo-500">
                          <span>Upload a file</span>
                          <input
                            type="file"
                            className="sr-only"
                            accept="image/*"
                            onChange={handleImageUpload}
                          />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    type="submit"
                    className="flex-1 bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition duration-200"
                  >
                    Add Pet
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddPetForm(false)}
                    className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition duration-200"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {selectedPet && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
                <h2 className="text-2xl font-bold">Pet Details</h2>
                <button
                  onClick={() => setSelectedPet(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={24} />
                </button>
              </div>
              
              <div className="p-6">
                <div className="grid md:grid-cols-2 gap-8">
                  {/* Left Column - Image and Center Details */}
                  <div className="space-y-6">
                    <img
                      src={selectedPet.image || 'https://placehold.co/400x300?text=No+Image'}
                      alt={selectedPet.name}
                      className="w-full h-64 object-cover rounded-lg"
                    />
                    
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-lg mb-3">Adoption Center Details</h4>
                      <div className="space-y-2">
                          <p><span className="font-medium">Center Name:</span> {selectedPet.center_name}</p>
                          <p><span className="font-medium">Phone:</span> 
                              <a href={`tel:${selectedPet.center_phone}`} className="text-indigo-600 hover:text-indigo-800 ml-1">
                                  {selectedPet.center_phone}
                              </a>
                          </p>
                          <p><span className="font-medium">Address:</span> {selectedPet.center_address}</p>
                      </div>
                    </div>
                  </div>

                  {/* Right Column - Pet Details */}
                  <div className="space-y-6">
                    {/* Basic Information */}
                    <div>
                      <h3 className="text-xl font-semibold mb-4">Basic Information</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-gray-500">Name</p>
                          <p className="font-medium">{selectedPet.name}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Age</p>
                          <p className="font-medium">{selectedPet.age}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Pet Type</p>
                          <p className="font-medium">{selectedPet.type}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Breed</p>
                          <p className="font-medium">{selectedPet.breed}</p>
                        </div>
                      </div>
                    </div>

                    {/* Medical History */}
                    <div>
                      <h3 className="text-xl font-semibold mb-2">Medical History</h3>
                      <p className="text-gray-600">{selectedPet.medical_history}</p>
                    </div>

                    {/* Behavior Traits */}
                    <div>
                      <h3 className="text-xl font-semibold mb-2">Behavior Traits</h3>
                      <div className="flex flex-wrap gap-2">
                        {(selectedPet.behavior || []).map((trait, index) => (
                          <span
                            key={index}
                            className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm"
                          >
                            {trait}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Special Needs */}
                    <div>
                      <h3 className="text-xl font-semibold mb-2">Special Needs</h3>
                      <div className="flex flex-wrap gap-2">
                        {(selectedPet.special_needs || []).map((need, index) => (
                          <span
                            key={index}
                            className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm"
                          >
                            {need}
                          </span>
                        ))}
                      </div>
                    </div>

                    {!isCenter && !isAdmin && selectedPet.status === 'available' && (
                      <button 
                        onClick={() => handleStartAdoption(selectedPet)}
                        className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition duration-200 flex items-center justify-center gap-2"
                      >
                        <Heart size={20} />
                        Request For Adoption
                      </button>
                    )}
                    {selectedPet.status === 'pending' && (
                      <div className="text-yellow-600 text-center py-3">
                        This pet has a pending adoption request
                      </div>
                    )}
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