import React, { useState, useEffect } from 'react';
import { MapPin, Phone, Mail, Search, X, Calendar, Clock } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';

interface VeterinaryCenter {
  id: number;
  name: string;
  description: string;
  address: string;
  phone: string;
  contact_email: string;
  license_number: string;
  avatar: string;
  status: string;
  image_url: string;
}

interface VeterinaryService {
  id: number;
  service_name: string;
  description: string;
  price: number;
  duration: string;
}

interface CenterDetails {
  center: VeterinaryCenter;
  services: VeterinaryService[];
}

// Add new interface for selected services
interface SelectedService {
  id: number;
  service_name: string;
  price: number;
}

// Add new interface for appointment form
interface AppointmentForm {
  pet_name: string;
  pet_type: string;
  pet_age: string;
  appointment_date: string;
  appointment_time: string;
}

// Add new interface for customer appointments
interface CustomerAppointment {
  id: number;
  center_name: string;
  center_phone: string;
  center_email: string;
  center_address: string;
  pet_name: string;
  pet_type: string;
  pet_age: string;
  appointment_date: string;
  appointment_time: string;
  selected_services: Array<{service_name: string; price: number}>;
  total_amount: number;
  status: 'pending' | 'scheduled' | 'rejected';
}

export default function VeterinaryCenters() {
  const [centers, setCenters] = useState<VeterinaryCenter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCenter, setSelectedCenter] = useState<CenterDetails | null>(null);
  const [selectedServices, setSelectedServices] = useState<SelectedService[]>([]);
  const [showMyAppointments, setShowMyAppointments] = useState(false);
  const [myAppointments, setMyAppointments] = useState<CustomerAppointment[]>([]);
  const [loadingAppointments, setLoadingAppointments] = useState(false);

  const fetchCenters = async () => {
    try {
      const response = await fetch('https://pawsconnect.rf.gd/get_veterinary_centers.php');
      const data = await response.json();
      
      if (data.status === 'success') {
        setCenters(data.centers);
      } else {
        throw new Error(data.message || 'Failed to fetch centers');
      }
    } catch (error) {
      setError('Failed to load veterinary centers');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCenterDetails = async (centerId: number) => {
    try {
      const response = await fetch(`https://pawsconnect.rf.gd/get_veterinary_center_details.php?center_id=${centerId}`);
      const data = await response.json();
      
      if (data.status === 'success') {
        setSelectedCenter(data.data);
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Error fetching center details:', error);
    }
  };

  const fetchMyAppointments = async () => {
    try {
      setLoadingAppointments(true);
      const customerId = localStorage.getItem('customerId');
      const response = await fetch(`https://pawsconnect.rf.gd/get_customer_vet_appointments.php?customer_id=${customerId}`);
      const data = await response.json();
      
      if (data.status === 'success') {
        setMyAppointments(data.appointments);
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoadingAppointments(false);
    }
  };

  useEffect(() => {
    fetchCenters();
  }, []);

  const filteredCenters = centers.filter(center => 
    center.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    center.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getImageUrl = (center: VeterinaryCenter) => {
    if (!center.image_url) return 'https://placehold.co/100x100?text=Vet';
    return `https://pawsconnect.rf.gd/${center.image_url}`;
  };

  const CenterCard = ({ center }: { center: VeterinaryCenter }) => (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center gap-4 mb-4">
        <img
          src={getImageUrl(center)}
          alt={center.name}
          className="w-16 h-16 rounded-full object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = 'https://placehold.co/100x100?text=Vet';
          }}
        />
        <div>
          <h3 className="font-semibold text-lg">{center.name}</h3>
          <p className="text-sm text-gray-500">License #{center.license_number}</p>
        </div>
      </div>
      
      <p className="text-gray-600 mb-4">{center.description}</p>
      
      <div className="space-y-2 text-gray-600">
        <div className="flex items-center gap-2">
          <MapPin size={16} />
          <span>{center.address}</span>
        </div>
        <div className="flex items-center gap-2">
          <Phone size={16} />
          <a href={`tel:${center.phone}`} className="hover:text-indigo-600">
            {center.phone}
          </a>
        </div>
        <div className="flex items-center gap-2">
          <Mail size={16} />
          <a href={`mailto:${center.contact_email}`} className="hover:text-indigo-600">
            {center.contact_email}
          </a>
        </div>
      </div>
      <button 
        onClick={() => fetchCenterDetails(center.id)}
        className="mt-4 w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700"
      >
        Book an Appointment
      </button>
    </div>
  );

  const CenterDetailsModal = () => {
    if (!selectedCenter) return null;

    const [appointmentForm, setAppointmentForm] = useState<AppointmentForm>({
      pet_name: '',
      pet_type: '',
      pet_age: '',
      appointment_date: '',
      appointment_time: ''
    });

    const handleServiceSelect = (service: VeterinaryService) => {
      setSelectedServices(prev => {
        const exists = prev.some(s => s.id === service.id);
        if (exists) {
          return prev.filter(s => s.id !== service.id);
        } else {
          return [...prev, { 
            id: service.id, 
            service_name: service.service_name, 
            price: service.price 
          }];
        }
      });
    };

    const handleConfirmAppointment = () => {
      if (selectedServices.length === 0) {
        alert('Please select at least one service');
        return;
      }
      // TODO: Add appointment booking logic
      alert('Appointment booking feature coming soon!');
      setSelectedCenter(null);
      setSelectedServices([]);
    };

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      const customerId = localStorage.getItem('customerId');
      
      if (!selectedServices.length) {
        toast.error('Please select at least one service');
        return;
      }
  
      if (!customerId) {
        toast.error('Please login to book an appointment');
        return;
      }
  
      try {
        const response = await fetch('https://pawsconnect.rf.gd/book_vet_appointment.php', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...appointmentForm,
            center_id: selectedCenter?.center.id,
            customer_id: parseInt(customerId),
            selected_services: selectedServices,
            total_amount: selectedServices.reduce((sum, service) => sum + service.price, 0)
          })
        });
  
        const data = await response.json();
        if (data.status === 'success') {
          toast.success('Appointment request sent successfully!');
          setSelectedCenter(null);
          setSelectedServices([]);
        } else {
          throw new Error(data.message);
        }
      } catch (error) {
        toast.error('Failed to book appointment');
        console.error(error);
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Book an Appointment</h2>
              <button 
                onClick={() => {
                  setSelectedCenter(null);
                  setSelectedServices([]);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-4">Available Services</h3>
              <div className="grid gap-4">
                {selectedCenter.services.map(service => (
                  <div key={service.id} className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          id={`service-${service.id}`}
                          checked={selectedServices.some(s => s.id === service.id)}
                          onChange={() => handleServiceSelect(service)}
                          className="w-4 h-4 rounded border-gray-300 text-indigo-600"
                        />
                        <div>
                          <label htmlFor={`service-${service.id}`} className="font-semibold">
                            {service.service_name}
                          </label>
                          <p className="text-gray-600">{service.description}</p>
                          <p className="text-gray-500 text-sm">{service.duration}</p>
                        </div>
                      </div>
                      <p className="font-semibold text-indigo-600">
                        {new Intl.NumberFormat('en-IN', {
                          style: 'currency',
                          currency: 'INR'
                        }).format(service.price)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {selectedServices.length > 0 && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold mb-2">Selected Services</h4>
                  <div className="space-y-2">
                    {selectedServices.map(service => (
                      <div key={service.id} className="flex justify-between">
                        <span>{service.service_name}</span>
                        <span>{new Intl.NumberFormat('en-IN', {
                          style: 'currency',
                          currency: 'INR'
                        }).format(service.price)}</span>
                      </div>
                    ))}
                    <div className="border-t pt-2 mt-2 font-bold flex justify-between">
                      <span>Total</span>
                      <span>{new Intl.NumberFormat('en-IN', {
                        style: 'currency',
                        currency: 'INR'
                      }).format(selectedServices.reduce((sum, service) => sum + service.price, 0))}</span>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <h3 className="text-xl font-semibold mb-4">Book an Appointment</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Pet Details */}
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Pet Name"
                      value={appointmentForm.pet_name}
                      onChange={(e) => setAppointmentForm(prev => ({
                        ...prev,
                        pet_name: e.target.value
                      }))}
                      className="p-2 border rounded"
                      required
                    />
                    <input
                      type="text"
                      placeholder="Pet Type (e.g., Dog, Cat)"
                      value={appointmentForm.pet_type}
                      onChange={(e) => setAppointmentForm(prev => ({
                        ...prev,
                        pet_type: e.target.value
                      }))}
                      className="p-2 border rounded"
                      required
                    />
                    <input
                      type="text"
                      placeholder="Pet Age"
                      value={appointmentForm.pet_age}
                      onChange={(e) => setAppointmentForm(prev => ({
                        ...prev,
                        pet_age: e.target.value
                      }))}
                      className="p-2 border rounded"
                      required
                    />
                  </div>

                  {/* Date and Time */}
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="date"
                      value={appointmentForm.appointment_date}
                      onChange={(e) => setAppointmentForm(prev => ({
                        ...prev,
                        appointment_date: e.target.value
                      }))}
                      className="p-2 border rounded"
                      required
                    />
                    <input
                      type="time"
                      value={appointmentForm.appointment_time}
                      onChange={(e) => setAppointmentForm(prev => ({
                        ...prev,
                        appointment_time: e.target.value
                      }))}
                      className="p-2 border rounded"
                      required
                    />
                  </div>

                  {/* Services selection and rest of the form remains the same */}
                  <button
                    type="submit"
                    className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700"
                  >
                    Confirm Appointment
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Add MyAppointments modal component
  const MyAppointmentsModal = () => {
    if (!showMyAppointments) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">My Appointments</h2>
              <button 
                onClick={() => setShowMyAppointments(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            {loadingAppointments ? (
              <div className="text-center py-8">Loading appointments...</div>
            ) : myAppointments.length === 0 ? (
              <div className="text-center py-8">No appointments found</div>
            ) : (
              <div className="space-y-4">
                {myAppointments.map(appointment => (
                  <div key={appointment.id} className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-lg">{appointment.center_name}</h3>
                        <p className="text-sm text-gray-600">Pet: {appointment.pet_name} ({appointment.pet_type})</p>
                        <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                          <Calendar size={16} />
                          <span>{appointment.appointment_date}</span>
                          <Clock size={16} />
                          <span>{appointment.appointment_time}</span>
                        </div>
                        <div className="mt-2 space-y-1">
                          <div className="flex items-center gap-2">
                            <MapPin size={16} className="text-gray-600" />
                            <span className="text-sm text-gray-600">{appointment.center_address}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone size={16} className="text-gray-600" />
                            <a href={`tel:${appointment.center_phone}`} className="text-sm text-gray-600 hover:text-indigo-600">
                              {appointment.center_phone}
                            </a>
                          </div>
                          <div className="flex items-center gap-2">
                            <Mail size={16} className="text-gray-600" />
                            <a href={`mailto:${appointment.center_email}`} className="text-sm text-gray-600 hover:text-indigo-600">
                              {appointment.center_email}
                            </a>
                          </div>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm ${
                        appointment.status === 'scheduled' ? 'bg-green-100 text-green-800' :
                        appointment.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {appointment.status}
                      </span>
                    </div>
                    <div className="mt-4 pt-4 border-t">
                      <h4 className="font-medium mb-2">Selected Services:</h4>
                      <div className="space-y-1">
                        {appointment.selected_services.map((service, idx) => (
                          <div key={idx} className="flex justify-between text-sm text-gray-600">
                            <span>{service.service_name}</span>
                            <span>{new Intl.NumberFormat('en-IN', {
                              style: 'currency',
                              currency: 'INR'
                            }).format(service.price)}</span>
                          </div>
                        ))}
                        <div className="pt-2 mt-2 border-t font-medium flex justify-between">
                          <span>Total</span>
                          <span>{new Intl.NumberFormat('en-IN', {
                            style: 'currency',
                            currency: 'INR'
                          }).format(appointment.total_amount)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
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
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Veterinary Centers</h1>
          <button
            onClick={() => {
              fetchMyAppointments();
              setShowMyAppointments(true);
            }}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            My Appointments
          </button>
        </div>
        
        <div className="mb-8 max-w-xl">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by center name or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {loading ? (
          <div>Loading centers...</div>
        ) : error ? (
          <div className="text-red-500">{error}</div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCenters.map(center => (
              <CenterCard key={center.id} center={center} />
            ))}
          </div>
        )}
      </div>
      {selectedCenter && <CenterDetailsModal />}
      <MyAppointmentsModal />
      <Footer />
    </div>
  );
}
