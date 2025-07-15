import React, { useState, useEffect } from 'react';
import { Heart, Calendar, Package, MessageCircle, Plus, Check, X } from 'lucide-react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';

interface Appointment {
  id: number;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  pet_name: string;
  pet_type: string;
  pet_age: string;
  appointment_date: string;
  appointment_time: string;
  selected_services: Array<{id: number; service_name: string; price: number}>;
  total_amount: number;
  status: 'pending' | 'scheduled' | 'completed' | 'rejected';
  completed_at?: string;
}

interface Service {
  id: number;
  name: string;
  description: string;
  price: number;
  duration: string;
}

interface VetService {
  id: number;
  center_id: number;
  service_name: string;
  description: string;
  price: number;
  duration: string;
}

export default function VeterinaryDashboard() {
  const [stats, setStats] = useState({
    patients: 0,
    appointments: 0,
    services: 0
  });

  const [appointments, setAppointments] = useState<Appointment[]>([]);

  const fetchAppointments = async () => {
    try {
      const centerId = localStorage.getItem('centerId');
      const response = await fetch(`https://pawsconnect.rf.gd/get_vet_appointments.php?center_id=${centerId}`);
      const data = await response.json();
      
      if (data.status === 'success') {
        setAppointments(data.appointments);
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
    }
  };

  const fetchDashboardStats = async () => {
    try {
      const centerId = localStorage.getItem('centerId');
      const response = await fetch(`https://pawsconnect.rf.gd/get_vet_dashboard_stats.php?center_id=${centerId}`);
      const data = await response.json();
      
      if (data.status === 'success') {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    }
  };

  useEffect(() => {
    fetchServices();
    fetchAppointments();
    fetchDashboardStats();
  }, []);

  const handleAppointmentStatus = async (appointmentId: number, status: 'scheduled' | 'completed' | 'rejected') => {
    try {
      const response = await fetch('https://pawsconnect.rf.gd/update_vet_appointment.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ appointment_id: appointmentId, status })
      });

      const data = await response.json();
      if (data.status === 'success') {
        await Promise.all([
          fetchAppointments(),
          fetchDashboardStats() // Ensure stats are refreshed
        ]);
      }
    } catch (error) {
      console.error('Error updating appointment:', error);
    }
  };

  const [services, setServices] = useState<VetService[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchServices = async () => {
    try {
      const centerId = localStorage.getItem('centerId');
      const response = await fetch(`https://pawsconnect.rf.gd/get_veterinary_services.php?center_id=${centerId}`);

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      
      const data = await response.json();
      if (data.status === 'success') {
        setServices(data.services);
        // Update stats with correct service count
        setStats(prevStats => ({
          ...prevStats,
          services: data.services.length
        }));
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Error fetching services:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const [showServiceForm, setShowServiceForm] = useState(false);

  const handleAddAppointment = () => {
    // TODO: Implement appointment creation
    alert('Add appointment functionality coming soon!');
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
    }).format(price);
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const ServiceForm = () => {
    const [service, setService] = useState({
        service_name: '',
        description: '',
        price: '',
        duration: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const centerId = localStorage.getItem('centerId');

        try {
            const response = await fetch('https://pawsconnect.rf.gd/add_veterinary_service.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...service,
                    center_id: parseInt(centerId || '0'),
                    price: parseFloat(service.price)
                })
            });

            const data = await response.json();
            if (data.status === 'success') {
                alert('Service added successfully!');
                // Refresh services list
                fetchServices();
                setShowServiceForm(false);
            } else {
                throw new Error(data.message);
            }
        } catch (error) {
            alert('Failed to add service');
            console.error(error);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium mb-1">Service Name</label>
                <input
                    type="text"
                    value={service.service_name}
                    onChange={(e) => setService(prev => ({
                        ...prev,
                        service_name: e.target.value
                    }))}
                    className="w-full p-2 border rounded"
                    required
                />
            </div>
            <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                    value={service.description}
                    onChange={(e) => setService(prev => ({
                        ...prev,
                        description: e.target.value
                    }))}
                    className="w-full p-2 border rounded"
                    rows={3}
                />
            </div>
            <div>
                <label className="block text-sm font-medium mb-1">Price (₹)</label>
                <input
                    type="number"
                    step="1"
                    value={service.price}
                    onChange={(e) => setService(prev => ({
                        ...prev,
                        price: e.target.value
                    }))}
                    className="w-full p-2 border rounded"
                    required
                />
            </div>
            <div>
                <label className="block text-sm font-medium mb-1">Duration</label>
                <input
                    type="text"
                    value={service.duration}
                    onChange={(e) => setService(prev => ({
                        ...prev,
                        duration: e.target.value
                    }))}
                    placeholder="e.g., 30 minutes"
                    className="w-full p-2 border rounded"
                />
            </div>
            <div className="flex gap-4">
                <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                >
                    Add Service
                </button>
                <button
                    type="button"
                    onClick={() => setShowServiceForm(false)}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                >
                    Cancel
                </button>
            </div>
        </form>
    );
  };

  const renderServices = () => {
    if (loading) {
      return <div>Loading services...</div>;
    }

    return (
      <div className="grid gap-4">
        {services.map(service => (
          <div key={service.id} className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-semibold">{service.service_name}</h3>
            <p className="text-gray-600">{service.description}</p>
            <div className="flex justify-between mt-2">
              <span className="font-medium">{formatPrice(service.price)}</span>
              <span className="text-gray-500">{service.duration}</span>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Veterinary Dashboard</h1>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500">Total Patients</p>
                <p className="text-2xl font-bold">{stats.patients}</p>
              </div>
              <Heart className="w-8 h-8 text-pink-500" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500">Appointments</p>
                <p className="text-2xl font-bold">{stats.appointments}</p>
              </div>
              <Calendar className="w-8 h-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500">Services</p>
                <p className="text-2xl font-bold">{stats.services}</p>
              </div>
              <Package className="w-8 h-8 text-green-500" />
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Recent Appointments */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Recent Appointments</h2>
               
              </div>
              <div className="space-y-4">
                {appointments.map(appointment => (
                  <div key={appointment.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="space-y-2">
                      <div>
                        <h3 className="font-semibold">{appointment.pet_name}</h3>
                        <p className="text-sm text-gray-600">Owner: {appointment.customer_name}</p>
                        <p className="text-sm text-gray-600">Pet Age: {appointment.pet_age}</p>
                        <p className="text-sm text-gray-600">
                          Date: {appointment.appointment_date} at {formatTime(appointment.appointment_time)}
                        </p>
                      </div>
                      <div className="mt-2">
                        <p className="text-sm font-medium">Selected Services:</p>
                        <div className="space-y-1">
                          {appointment.selected_services.map(service => (
                            <p key={service.id} className="text-sm text-gray-600">
                              • {service.service_name} ({formatPrice(service.price)})
                            </p>
                          ))}
                        </div>
                        <p className="text-sm font-medium mt-1">
                          Total: {formatPrice(appointment.total_amount)}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {appointment.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleAppointmentStatus(appointment.id, 'scheduled')}
                            className="p-2 bg-green-500 text-white rounded-full hover:bg-green-600"
                            title="Schedule"
                          >
                            <Check size={20} />
                          </button>
                          <button
                            onClick={() => handleAppointmentStatus(appointment.id, 'rejected')}
                            className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
                            title="Reject"
                          >
                            <X size={20} />
                          </button>
                        </>
                      )}
                      {appointment.status === 'scheduled' && (
                        <button
                          onClick={() => handleAppointmentStatus(appointment.id, 'completed')}
                          className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600"
                          title="Mark as Completed"
                        >
                          <Check size={20} />
                        </button>
                      )}
                      <span className={`px-3 py-1 rounded-full text-sm ${
                        appointment.status === 'scheduled' ? 'bg-green-100 text-green-800' :
                        appointment.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                        appointment.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {appointment.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Services Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Services</h2>
              <button 
                onClick={() => setShowServiceForm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                <Plus size={20} />
                Add Service
              </button>
            </div>
            <div className="space-y-4">
              {renderServices()}
            </div>
          </div>
        </div>
      </div>
      {showServiceForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Add New Service</h2>
            <ServiceForm />
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
}
