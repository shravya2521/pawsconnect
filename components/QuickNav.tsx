import React from 'react';
import { Heart, Search, ShoppingBag, Users, CheckSquare, Stethoscope } from 'lucide-react';

const getNavItems = (isAdmin: boolean) => {
  const baseItems = [
    {
      title: 'Lost & Found',
      description: 'Report or find lost pets.',
      icon: Search,
      href: '/lost-found'
    },
    {
      title: 'PawMart',
      description: 'Shop essentials for your pet.',
      icon: ShoppingBag,
      href: '/pawmart'
    },
    {
      title: 'Community',
      description: 'Join our community of pet lovers.',
      icon: Users,
      href: '/community'
    },
    {
      title: 'Veterinary',
      description: 'Professional pet healthcare services.',
      icon: Stethoscope,
      href: '/veterinary'
    }
  ];

  if (isAdmin) {
    return [
      ...baseItems,
      {
        title: 'Center Approval',
        description: 'Manage center registration requests.',
        icon: CheckSquare,
        href: '/admin/center-approval'
      }
    ];
  }

  const userType = localStorage.getItem('userType');
  if (userType === 'center') {
    return baseItems;
  }

  return [
    {
      title: 'Adopt',
      description: 'Find your furry friend.',
      icon: Heart,
      href: '/adopt'
    },
    ...baseItems
  ];
};

export default function QuickNav() {
  const userType = localStorage.getItem('userType');
  const isAdmin = userType === 'admin';
  const navItems = getNavItems(isAdmin);

  return (
    <div className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className={`grid md:grid-cols-2 ${isAdmin ? 'lg:grid-cols-3' : 'lg:grid-cols-4'} gap-6`}>
          {navItems.map((item) => (
            <div key={item.title} className="card hover:translate-y-[-4px]">
              <item.icon className="w-8 h-8 text-indigo-600 mb-4" />
              <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
              <p className="text-gray-600 mb-4">{item.description}</p>
              <a 
                href={item.href}
                className="text-indigo-600 font-medium hover:text-indigo-700"
              >
                Learn more →
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}