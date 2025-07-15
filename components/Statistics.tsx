import React, { useState, useEffect } from 'react';
import { Heart, Home, Users } from 'lucide-react';

interface StatsData {
  adoptions: number;
  shelters: number;
  community: number;
}

export default function Statistics() {
  const [counts, setCounts] = useState<StatsData>({
    adoptions: 0,
    shelters: 0,
    community: 0
  });

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('https://pawsconnect.rf.gd/get_statistics.php');
        if (!response.ok) throw new Error('Failed to fetch statistics');
        
        const data = await response.json();
        if (data.status === 'success') {
          setCounts(data.data);
        }
      } catch (error) {
        console.error('Error fetching statistics:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  const stats = [
    {
      icon: Heart,
      value: `${counts.adoptions}+`,
      label: 'Successful Adoptions',
      description: 'Pets found their forever homes'
    },
    {
      icon: Home,
      value: `${counts.shelters}+`,
      label: 'Partner Shelters',
      description: 'Working together to save lives'
    },
    {
      icon: Users,
      value: `${counts.community}+`,
      label: 'Community Members',
      description: 'Active pet lovers in our network'
    }
  ];

  return (
    <div className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">Our Impact</h2>
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-3 gap-12 justify-items-center">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center max-w-xs w-full">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-4 mx-auto">
                  <stat.icon className="w-8 h-8 text-indigo-600" />
                </div>
                <div className="text-4xl font-bold text-indigo-600 mb-2">
                  {isLoading ? '...' : stat.value}
                </div>
                <h3 className="text-xl font-semibold mb-2">{stat.label}</h3>
                <p className="text-gray-600">{stat.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}