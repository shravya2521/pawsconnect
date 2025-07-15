import React, { useState, useEffect } from 'react';
import { X, Upload, Plus, Minus } from 'lucide-react';

interface AddPetModalProps {
  pet?: Pet | null;
  onClose: () => void;
  onSave: (petData: Omit<Pet, 'id'>) => void;
  onSuccess?: () => void; // Add this prop
}

export default function AddPetModal({ pet, onClose, onSave, onSuccess }: AddPetModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    breed: '',
    image: '',
    medicalHistory: '',
    behavior: [''],
    specialNeeds: [''],
    status: 'available' as const,
    type: 'dog' // Add new type field
  });
  
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');

  const petTypes = [
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

  useEffect(() => {
    if (pet) {
      // Ensure behavior and specialNeeds are arrays
      setFormData({
        name: pet.name || '',
        age: pet.age || '',
        breed: pet.breed || '',
        image: pet.image || '',
        medicalHistory: pet.medical_history || '',
        behavior: Array.isArray(pet.behavior) ? pet.behavior : [''],
        specialNeeds: Array.isArray(pet.special_needs) ? pet.special_needs : [''],
        status: pet.status || 'available',
        type: pet.type || 'dog'
      });
      
      // Set preview image if exists
      if (pet.image) {
        setPreviewUrl(pet.image);
      }
    }
  }, [pet]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formDataToSend = new FormData();
      
      // Always send image if selected
      if (selectedImage) {
        console.log('Adding image to form data:', selectedImage);
        formDataToSend.append('image', selectedImage);
      }

      // Add all other data
      const petInfo = {
        center_id: parseInt(localStorage.getItem('centerId') || '0'),
        id: pet?.id,
        name: formData.name,
        age: formData.age,
        breed: formData.breed,
        type: formData.type,
        medical_history: formData.medicalHistory,
        behavior: formData.behavior.filter(b => b.trim() !== ''),
        special_needs: formData.specialNeeds.filter(s => s.trim() !== '')
      };

      formDataToSend.append('petData', JSON.stringify(petInfo));

      // Send the update request
      const endpoint = pet?.id ? 'update_pet.php' : 'add_pet.php';
      const response = await fetch(`https://pawsconnect.rf.gd/${endpoint}`, {
        method: 'POST',
        body: formDataToSend
      });

      const result = await response.json();
      console.log('Server response:', result);

      if (result.status === 'success') {
        alert(pet ? 'Pet updated successfully!' : 'Pet added successfully!');
        // Make sure to refresh the list
        await onSuccess?.();
        onClose();
      } else {
        throw new Error(result.message);
      }

    } catch (error) {
      console.error('Error:', error);
      alert(`Failed to ${pet ? 'update' : 'add'} pet: ${error.message}`);
    }
  };

  const handleArrayInput = (
    field: 'behavior' | 'specialNeeds',
    index: number,
    value: string
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => (i === index ? value : item))
    }));
  };

  const handleAddArrayItem = (field: 'behavior' | 'specialNeeds') => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const handleRemoveArrayItem = (field: 'behavior' | 'specialNeeds', index: number) => {
    if (formData[field].length > 1) { // Ensure at least one field remains
      setFormData(prev => ({
        ...prev,
        [field]: prev[field].filter((_, i) => i !== index)
      }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setFormData(prev => ({ ...prev, image: url }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl flex flex-col max-h-[90vh]">
        {/* Fixed Header */}
        <div className="p-4 border-b flex justify-between items-center shrink-0">
          <h2 className="text-xl font-semibold">{pet ? 'Edit Pet' : 'Add New Pet'}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        {/* Scrollable Form Content */}
        <div className="overflow-y-auto p-6 flex-1">
          <form id="pet-form" onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                <input
                  type="text"
                  value={formData.age}
                  onChange={e => setFormData(prev => ({ ...prev, age: e.target.value }))}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pet Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 capitalize"
                  required
                >
                  {petTypes.map(type => (
                    <option key={type} value={type} className="capitalize">
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Breed</label>
                <input
                  type="text"
                  value={formData.breed}
                  onChange={e => setFormData(prev => ({ ...prev, breed: e.target.value }))}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pet Image</label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
                  {previewUrl ? (
                    <div className="relative">
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="w-full h-48 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setPreviewUrl('');
                          setSelectedImage(null);
                        }}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-1 text-center">
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="flex text-sm text-gray-600">
                        <label className="relative cursor-pointer rounded-md font-medium text-indigo-600 hover:text-indigo-500">
                          <span>Upload a photo</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="sr-only"
                            required={!pet}
                          />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Medical History</label>
              <textarea
                value={formData.medicalHistory}
                onChange={e => setFormData(prev => ({ ...prev, medicalHistory: e.target.value }))}
                rows={4}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            {/* Behavior Traits */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Behavior Traits</label>
              {formData.behavior.map((trait, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={trait}
                    onChange={e => handleArrayInput('behavior', index, e.target.value)}
                    className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                    placeholder="Enter behavior trait"
                    required
                  />
                  <div className="flex gap-1">
                    {formData.behavior.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveArrayItem('behavior', index)}
                        className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                      >
                        <Minus size={20} />
                      </button>
                    )}
                    {index === formData.behavior.length - 1 && (
                      <button
                        type="button"
                        onClick={() => handleAddArrayItem('behavior')}
                        className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200"
                      >
                        <Plus size={20} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Special Needs */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Special Needs</label>
              {formData.specialNeeds.map((need, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={need}
                    onChange={e => handleArrayInput('specialNeeds', index, e.target.value)}
                    className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                    placeholder="Enter special need"
                    required
                  />
                  <div className="flex gap-1">
                    {formData.specialNeeds.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveArrayItem('specialNeeds', index)}
                        className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                      >
                        <Minus size={20} />
                      </button>
                    )}
                    {index === formData.specialNeeds.length - 1 && (
                      <button
                        type="button"
                        onClick={() => handleAddArrayItem('specialNeeds')}
                        className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200"
                      >
                        <Plus size={20} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </form>
        </div>

        {/* Fixed Footer */}
        <div className="p-4 border-t shrink-0 bg-white">
          <div className="flex gap-4">
            <button
              type="submit"
              form="pet-form"
              className="flex-1 bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700"
            >
              {pet ? 'Save Changes' : 'Add Pet'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
