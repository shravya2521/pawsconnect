import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PawPrint, Heart, Search, ShoppingBag, Users, Stethoscope, Facebook, Instagram } from 'lucide-react';

interface Statistics {
  adoptions: number;
  shelters: number;
  community: number;
}

export default function LandingPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<Statistics>({
    adoptions: 0,
    shelters: 0,
    community: 0
  });

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        const response = await fetch('https://pawsconnect.rf.gd/get_statistics.php');
        const data = await response.json();
        if (data.status === 'success') {
          setStats(data.data);
        }
      } catch (error) {
        console.error('Error fetching statistics:', error);
      }
    };

    fetchStatistics();
  }, []);

  const statCards = [
    { icon: Heart, value: `${stats.adoptions}+`, label: 'Successful Adoptions' },
    { icon: Search, value: `${stats.shelters}+`, label: 'Partner Shelters' },
    { icon: Users, value: `${stats.community}+`, label: 'Community Members' }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="w-full py-6 px-8 bg-white shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <PawPrint className="h-8 w-8 text-indigo-600" />
            <span className="text-2xl font-bold text-gray-900">PawsConnect</span>
          </div>
          <button
            onClick={() => navigate('/login')}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition duration-200"
          >
            Login / Sign Up
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative h-[600px]">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url("https://images.unsplash.com/photo-1450778869180-41d0601e046e?auto=format&fit=crop&q=80")'
          }}
        >
          <div className="absolute inset-0 bg-black/40" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 h-full flex items-center">
          <div className="max-w-2xl text-white">
            <h1 className="text-5xl font-bold mb-6">
              Welcome to PawsConnect
            </h1>
            <p className="text-xl mb-8">
              Your one-stop platform for pet adoption, lost & found pets, and everything your furry friend needs.
            </p>
            <button
              onClick={() => navigate('/login')}
              className="px-8 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition duration-200 font-semibold"
            >
              Get Started
            </button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">What We Offer</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-shadow">
              <Heart className="w-12 h-12 text-indigo-600 mb-6" />
              <h3 className="text-xl font-semibold mb-4">Pet Adoption</h3>
              <p className="text-gray-600 leading-relaxed">
                Find your perfect companion from our network of trusted shelters.
              </p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-shadow">
              <Search className="w-12 h-12 text-indigo-600 mb-6" />
              <h3 className="text-xl font-semibold mb-4">Lost & Found</h3>
              <p className="text-gray-600 leading-relaxed">
                Reunite lost pets with their families through our platform.
              </p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-shadow">
              <ShoppingBag className="w-12 h-12 text-indigo-600 mb-6" />
              <h3 className="text-xl font-semibold mb-4">PawMart</h3>
              <p className="text-gray-600 leading-relaxed">
                Shop quality pet supplies with 50% of all sales donated to local pet adoption centers.
              </p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-shadow">
              <Users className="w-12 h-12 text-indigo-600 mb-6" />
              <h3 className="text-xl font-semibold mb-4">Community</h3>
              <p className="text-gray-600 leading-relaxed">
                Connect with fellow pet lovers and share experiences.
              </p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-shadow">
              <Stethoscope className="w-12 h-12 text-indigo-600 mb-6" />
              <h3 className="text-xl font-semibold mb-4">Veterinary Care</h3>
              <p className="text-gray-600 leading-relaxed">
                Access professional veterinary services and expert pet healthcare advice.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Impact Section */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Our Impact</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Together with our community, we're making a difference in the lives of pets and their families.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {statCards.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-4">
                  <stat.icon className="w-8 h-8 text-indigo-600" />
                </div>
                <div className="text-4xl font-bold text-indigo-600 mb-2">{stat.value}</div>
                <p className="text-gray-600">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <PawPrint className="h-6 w-6" />
                <h3 className="text-xl font-bold">PawsConnect</h3>
              </div>
              <p className="text-gray-400">
                Connecting pets with loving homes since 2025.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><button onClick={() => navigate('/login')} className="text-gray-400 hover:text-white">Adopt</button></li>
                <li><button onClick={() => navigate('/login')} className="text-gray-400 hover:text-white">Veterinary</button></li>
                <li><button onClick={() => navigate('/login')} className="text-gray-400 hover:text-white">Lost & Found</button></li>
                <li><button onClick={() => navigate('/login')} className="text-gray-400 hover:text-white">PawMart</button></li>
                <li><button onClick={() => navigate('/login')} className="text-gray-400 hover:text-white">Community</button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <div className="space-y-2 text-gray-400">
                <p>(555) 123-4567</p>
                <p>contact@pawsconnect.com</p>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Follow Us</h4>
              <div className="flex gap-4">
                 <a href="#" className="text-gray-400 hover:text-white">
                <Facebook size={24} />
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <Instagram size={24} />
              </a>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>© 2025 PawsConnect. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}