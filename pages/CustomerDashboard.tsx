import React from 'react';
import Hero from '../components/Hero';
import QuickNav from '../components/QuickNav';
import Statistics from '../components/Statistics';
import Footer from '../components/Footer';
import ScrollToTop from '../components/ScrollToTop';

export default function CustomerDashboard() {
  return (
    <div className="min-h-screen bg-white">
      <Hero />
      <QuickNav />
      <Statistics />
      <Footer />
      <ScrollToTop />
    </div>
  );
}