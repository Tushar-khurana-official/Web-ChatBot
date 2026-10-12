/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { ServicesGrid } from './components/ServicesGrid';
import { WhyChooseUs } from './components/WhyChooseUs';
import { ReviewsAndFAQ } from './components/ReviewsAndFAQ';
import { Footer } from './components/Footer';
import { ChatWidget } from './components/ChatWidget';
import { BookingModal } from './components/BookingModal';
import { EstimateModal } from './components/EstimateModal';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { BusinessSettings, ServiceItem, Lead, Booking, VehicleCategory } from './types';
import { INITIAL_BUSINESS_SETTINGS, INITIAL_SERVICES } from './lib/defaultData';
import { auth, testFirestoreConnection } from './lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

export default function App() {
  const [settings, setSettings] = useState<BusinessSettings>(INITIAL_BUSINESS_SETTINGS);
  const [services, setServices] = useState<ServiceItem[]>(INITIAL_SERVICES);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);

  // Modals & Chat Widget State
  const [isBookingOpen, setIsBookingOpen] = useState<boolean>(false);
  const [isEstimatorOpen, setIsEstimatorOpen] = useState<boolean>(false);
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [isAdminView, setIsAdminView] = useState<boolean>(false);

  const [preSelectedService, setPreSelectedService] = useState<ServiceItem | null>(null);
  const [preSelectedCategory, setPreSelectedCategory] = useState<VehicleCategory>('Sedan');
  const [adminUser, setAdminUser] = useState<any>(null);

  // Test connection to Firestore on initial boot as required by skill
  useEffect(() => {
    testFirestoreConnection();
    const unsub = onAuthStateChanged(auth, (user) => {
      setAdminUser(user);
    });
    fetchData();
    return () => unsub();
  }, []);

  const fetchData = async () => {
    try {
      const [settingsRes, servicesRes, leadsRes, bookingsRes] = await Promise.all([
        fetch('/api/settings').catch(() => null),
        fetch('/api/services').catch(() => null),
        fetch('/api/leads').catch(() => null),
        fetch('/api/bookings').catch(() => null),
      ]);

      if (settingsRes && settingsRes.ok) {
        const sData = await settingsRes.json();
        setSettings(sData);
      }
      if (servicesRes && servicesRes.ok) {
        const srvData = await servicesRes.json();
        setServices(srvData);
      }
      if (leadsRes && leadsRes.ok) {
        const lData = await leadsRes.json();
        setLeads(lData);
      }
      if (bookingsRes && bookingsRes.ok) {
        const bData = await bookingsRes.json();
        setBookings(bData);
      }
    } catch (err) {
      console.warn('Initial data fetch notice:', err);
    }
  };

  const handleSelectServiceToBook = (service: ServiceItem, category: VehicleCategory) => {
    setPreSelectedService(service);
    setPreSelectedCategory(category);
    setIsBookingOpen(true);
  };

  const handleOpenBooking = () => {
    setPreSelectedService(services[0] || null);
    setIsBookingOpen(true);
  };

  const handleProceedFromEstimator = (service: ServiceItem, category: VehicleCategory) => {
    setPreSelectedService(service);
    setPreSelectedCategory(category);
    setIsBookingOpen(true);
  };

  if (isAdminView) {
    return (
      <AdminDashboard
        settings={settings}
        services={services}
        leads={leads}
        bookings={bookings}
        onRefreshData={fetchData}
        onExitAdmin={() => setIsAdminView(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white selection:bg-amber-400 selection:text-zinc-950">
      {/* Top Banner Notice */}
      <div className="bg-gradient-to-r from-amber-500/10 via-amber-400/20 to-amber-500/10 border-b border-amber-500/20 px-4 py-2 text-center text-xs text-amber-300 font-medium flex items-center justify-center gap-2">
        <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
        <span>Monsoon Detailing Shield Offers Live • Free Decontamination Clay Bar with Ceramic Packages</span>
      </div>

      <Navbar
        settings={settings}
        onOpenBooking={handleOpenBooking}
        onOpenEstimator={() => setIsEstimatorOpen(true)}
        onOpenChat={() => setIsChatOpen(true)}
        onToggleAdmin={() => setIsAdminView(true)}
        isAdminView={isAdminView}
        adminUser={adminUser}
      />

      <main>
        <HeroSection
          settings={settings}
          onOpenBooking={handleOpenBooking}
          onOpenEstimator={() => setIsEstimatorOpen(true)}
          onOpenChat={() => setIsChatOpen(true)}
        />

        <ServicesGrid
          services={services}
          onSelectServiceToBook={handleSelectServiceToBook}
          onOpenEstimator={() => setIsEstimatorOpen(true)}
        />

        <WhyChooseUs />

        <ReviewsAndFAQ />
      </main>

      <Footer
        settings={settings}
        onOpenBooking={handleOpenBooking}
        onOpenEstimator={() => setIsEstimatorOpen(true)}
        onOpenChat={() => setIsChatOpen(true)}
      />

      {/* Floating Chat Widget */}
      <ChatWidget
        settings={settings}
        isOpen={isChatOpen}
        onToggle={() => setIsChatOpen(!isChatOpen)}
        onOpenBooking={handleOpenBooking}
        onOpenEstimator={() => setIsEstimatorOpen(true)}
      />

      {/* Booking Modal */}
      <BookingModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        services={services}
        preSelectedService={preSelectedService}
        preSelectedCategory={preSelectedCategory}
        onBookingSuccess={() => fetchData()}
      />

      {/* Price Estimator Modal */}
      <EstimateModal
        isOpen={isEstimatorOpen}
        onClose={() => setIsEstimatorOpen(false)}
        services={services}
        onProceedToBooking={handleProceedFromEstimator}
      />
    </div>
  );
}
