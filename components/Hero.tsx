import React, { useEffect, useState } from 'react';
import { Heart, Search, ShoppingBag } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import Navigation from './Navigation';

const backgroundImages = [
  'https://images.unsplash.com/photo-1450778869180-41d0601e046e?auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1560807707-8cc77767d783?auto=format&fit=crop&q=80'
];

export default function Hero() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const navigate = useNavigate();
  const userType = localStorage.getItem('userType');
  const isAdmin = userType === 'admin';

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === backgroundImages.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative h-[600px]">
      <div 
        className="absolute inset-0 bg-cover bg-center transition-opacity duration-1000"
        style={{
          backgroundImage: `url("${backgroundImages[currentImageIndex]}")`,
        }}
      >
        <div className="absolute inset-0 bg-black/40" />
      </div>
      
      <div className="relative h-full">
        <Navigation />
        <div className="relative max-w-7xl mx-auto px-4 h-full flex items-center">
          <div className="max-w-2xl text-white">
            <h1 className="text-5xl font-bold mb-6">
              Find Your Perfect Pet Companion with PawsConnect!
            </h1>
            <p className="text-xl mb-8">
              Connecting paws and people, one adoption at a time.
            </p>
            {!isAdmin && (
              <div className="flex gap-4">
                <Link to="/adopt" className="btn-primary flex items-center gap-2">
                  <Heart size={20} />
                  Adopt Now
                </Link>
                <Link to="/lost-found" className="btn-secondary flex items-center gap-2">
                  <Search size={20} />
                  Report Lost Pet
                </Link>
                <Link to="/pawmart" className="btn-secondary flex items-center gap-2">
                  <ShoppingBag size={20} />
                  Explore PawMart
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}