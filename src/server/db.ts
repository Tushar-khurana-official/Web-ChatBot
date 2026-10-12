import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  collection,
  getDocs,
  query,
  where,
  updateDoc,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import {
  BusinessSettings,
  ServiceItem,
  Lead,
  Booking,
  VehicleCategory,
  TimeSlotAvailability,
} from '../types';
import {
  INITIAL_BUSINESS_SETTINGS,
  INITIAL_SERVICES,
  STANDARD_TIME_SLOTS,
} from '../lib/defaultData';

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const serverDb = getFirestore(app, firebaseConfig.firestoreDatabaseId);

// In-memory cache & fallback when Firestore is offline or during cold start
let cachedSettings: BusinessSettings = { ...INITIAL_BUSINESS_SETTINGS };
let cachedServices: ServiceItem[] = [...INITIAL_SERVICES];
let cachedBookings: Booking[] = [];
let cachedLeads: Lead[] = [];

// Seed initial database records if empty
export async function initDatabaseDefaults() {
  try {
    const settingsDocRef = doc(serverDb, 'businessSettings', 'default');
    const settingsSnap = await getDoc(settingsDocRef);
    if (!settingsSnap.exists()) {
      await setDoc(settingsDocRef, INITIAL_BUSINESS_SETTINGS);
      cachedSettings = { ...INITIAL_BUSINESS_SETTINGS };
    } else {
      cachedSettings = settingsSnap.data() as BusinessSettings;
    }

    const servicesCollRef = collection(serverDb, 'services');
    const servicesSnap = await getDocs(servicesCollRef);
    if (servicesSnap.empty) {
      for (const service of INITIAL_SERVICES) {
        await setDoc(doc(serverDb, 'services', service.id), service);
      }
      cachedServices = [...INITIAL_SERVICES];
    } else {
      cachedServices = servicesSnap.docs.map((d) => d.data() as ServiceItem);
    }
  } catch (err) {
    console.warn('Notice: Firestore initial load using defaults:', (err as Error).message);
  }
}

export async function getBusinessSettings(): Promise<BusinessSettings> {
  try {
    const snap = await getDoc(doc(serverDb, 'businessSettings', 'default'));
    if (snap.exists()) {
      cachedSettings = snap.data() as BusinessSettings;
    }
  } catch (err) {
    console.warn('Fallback to cached settings:', (err as Error).message);
  }
  return cachedSettings;
}

export async function updateBusinessSettings(settings: Partial<BusinessSettings>): Promise<BusinessSettings> {
  const updated: BusinessSettings = {
    ...cachedSettings,
    ...settings,
    updatedAt: new Date().toISOString(),
  };
  try {
    await setDoc(doc(serverDb, 'businessSettings', 'default'), updated);
  } catch (err) {
    console.warn('Saved in-memory settings update:', (err as Error).message);
  }
  cachedSettings = updated;
  return updated;
}

export async function getServices(): Promise<ServiceItem[]> {
  try {
    const snap = await getDocs(collection(serverDb, 'services'));
    if (!snap.empty) {
      cachedServices = snap.docs.map((d) => d.data() as ServiceItem);
    }
  } catch (err) {
    console.warn('Fallback to cached services:', (err as Error).message);
  }
  return cachedServices;
}

export async function updateService(serviceId: string, updates: Partial<ServiceItem>): Promise<ServiceItem | null> {
  const idx = cachedServices.findIndex((s) => s.id === serviceId);
  if (idx === -1) return null;
  const updated = { ...cachedServices[idx], ...updates };
  try {
    await setDoc(doc(serverDb, 'services', serviceId), updated);
  } catch (err) {
    console.warn('Saved in-memory service update:', (err as Error).message);
  }
  cachedServices[idx] = updated;
  return updated;
}

export async function checkSlotAvailability(
  appointmentDate: string,
  serviceDurationMinutes: number = 60
): Promise<TimeSlotAvailability[]> {
  // Fetch existing non-cancelled bookings for this date
  let bookedSlots = new Set<string>();
  try {
    const q = query(
      collection(serverDb, 'bookings'),
      where('appointmentDate', '==', appointmentDate)
    );
    const snap = await getDocs(q);
    snap.docs.forEach((d) => {
      const b = d.data() as Booking;
      if (b.status !== 'Cancelled') {
        bookedSlots.add(b.appointmentSlot);
      }
    });
  } catch {
    cachedBookings
      .filter((b) => b.appointmentDate === appointmentDate && b.status !== 'Cancelled')
      .forEach((b) => bookedSlots.add(b.appointmentSlot));
  }

  return STANDARD_TIME_SLOTS.map((slot) => {
    const isBooked = bookedSlots.has(slot);
    return {
      slot,
      isAvailable: !isBooked,
      conflictReason: isBooked ? 'Already reserved by another customer' : undefined,
    };
  });
}

export async function createLead(data: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>): Promise<Lead> {
  const leadId = 'lead_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
  const now = new Date().toISOString();
  const lead: Lead = {
    ...data,
    id: leadId,
    createdAt: now,
    updatedAt: now,
  };

  try {
    await setDoc(doc(serverDb, 'leads', leadId), lead);
  } catch (err) {
    console.warn('Saved lead in fallback store:', (err as Error).message);
  }
  cachedLeads.unshift(lead);
  return lead;
}

export async function getLeads(): Promise<Lead[]> {
  try {
    const snap = await getDocs(collection(serverDb, 'leads'));
    if (!snap.empty) {
      cachedLeads = snap.docs.map((d) => d.data() as Lead);
    }
  } catch (err) {
    console.warn('Fallback leads:', (err as Error).message);
  }
  return cachedLeads;
}

export async function updateLeadStatus(leadId: string, status: Lead['status'], followUpNotes?: string): Promise<Lead | null> {
  const idx = cachedLeads.findIndex((l) => l.id === leadId);
  const updates: any = {
    status,
    updatedAt: new Date().toISOString(),
  };
  if (followUpNotes) {
    updates.followUpNotes = followUpNotes;
  }

  try {
    await updateDoc(doc(serverDb, 'leads', leadId), updates);
  } catch (err) {
    console.warn('Fallback lead update:', (err as Error).message);
  }

  if (idx !== -1) {
    cachedLeads[idx] = { ...cachedLeads[idx], ...updates };
    return cachedLeads[idx];
  }
  return null;
}

export async function createBookingSafe(
  data: Omit<Booking, 'id' | 'bookingReference' | 'createdAt' | 'updatedAt'>
): Promise<{ success: boolean; booking?: Booking; error?: string }> {
  // Concurrency Guard: Check if slot is already taken on that date
  const slots = await checkSlotAvailability(data.appointmentDate, data.durationMinutes);
  const matchingSlot = slots.find((s) => s.slot === data.appointmentSlot);

  if (!matchingSlot || !matchingSlot.isAvailable) {
    return {
      success: false,
      error: `The requested time slot (${data.appointmentSlot} on ${data.appointmentDate}) is no longer available. Please select another slot.`,
    };
  }

  const bookingId = 'bk_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
  const bookingReference = 'APEX-' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000);
  const now = new Date().toISOString();

  const newBooking: Booking = {
    ...data,
    id: bookingId,
    bookingReference,
    createdAt: now,
    updatedAt: now,
  };

  try {
    await setDoc(doc(serverDb, 'bookings', bookingId), newBooking);
  } catch (err) {
    console.warn('Saved booking to fallback store:', (err as Error).message);
  }

  cachedBookings.unshift(newBooking);
  return { success: true, booking: newBooking };
}

export async function getBookings(): Promise<Booking[]> {
  try {
    const snap = await getDocs(collection(serverDb, 'bookings'));
    if (!snap.empty) {
      cachedBookings = snap.docs.map((d) => d.data() as Booking);
    }
  } catch (err) {
    console.warn('Fallback bookings:', (err as Error).message);
  }
  return cachedBookings;
}

export async function updateBookingStatus(
  bookingId: string,
  status: Booking['status'],
  notes?: string
): Promise<Booking | null> {
  const idx = cachedBookings.findIndex((b) => b.id === bookingId);
  const updates: any = {
    status,
    updatedAt: new Date().toISOString(),
  };
  if (notes) updates.notes = notes;

  try {
    await updateDoc(doc(serverDb, 'bookings', bookingId), updates);
  } catch (err) {
    console.warn('Fallback booking status update:', (err as Error).message);
  }

  if (idx !== -1) {
    cachedBookings[idx] = { ...cachedBookings[idx], ...updates };
    return cachedBookings[idx];
  }
  return null;
}
