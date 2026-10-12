export type VehicleCategory = 'Hatchback' | 'Sedan' | 'Compact SUV' | 'Full SUV' | 'Luxury & Sports';

export interface BusinessSettings {
  businessName: string;
  cityAndServiceArea: string;
  address: string;
  phone: string;
  whatsappNumber: string;
  openingHours: string;
  currency: string;
  bookingPolicy: string;
  cancellationPolicy: string;
  updatedAt?: string;
}

export interface ServiceItem {
  id: string;
  name: string;
  category: 'Washing' | 'Detailing' | 'Ceramic & Graphene' | 'Paint Protection Film (PPF)' | 'Restoration';
  description: string;
  durationMinutes: number;
  startingPrice: number;
  categoryPricing: Record<VehicleCategory, number>;
  inspectionRequired: boolean;
  features: string[];
  isActive: boolean;
  popularTag?: string;
  aftercareAdvice?: string;
}

export type LeadStatus = 'New' | 'Contacted' | 'Quotation Sent' | 'Interested' | 'Booking Confirmed' | 'Lost';

export interface Lead {
  id: string;
  customerName: string;
  customerPhone: string;
  vehicleMakeModel?: string;
  vehicleCategory?: VehicleCategory;
  serviceId?: string;
  serviceName?: string;
  primaryConcern?: string;
  preferredDate?: string;
  budget?: string;
  notes?: string;
  source: 'website' | 'whatsapp';
  status: LeadStatus;
  consentGiven: boolean;
  assignedStaff?: string;
  followUpNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export type BookingStatus = 'Pending' | 'Confirmed' | 'Reschedule Requested' | 'Cancelled' | 'Completed' | 'No Show';

export interface Booking {
  id: string;
  bookingReference: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  serviceId: string;
  serviceName: string;
  vehicleMakeModel: string;
  vehicleCategory: VehicleCategory;
  appointmentDate: string; // YYYY-MM-DD
  appointmentSlot: string; // "09:00 AM"
  durationMinutes: number;
  estimatedPrice: number;
  status: BookingStatus;
  notes?: string;
  bookingSource: 'website' | 'whatsapp' | 'admin';
  createdAt: string;
  updatedAt: string;
  calendarEventId?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  text: string;
  timestamp: string;
  quickReplies?: string[];
  actionCard?: {
    type: 'estimate' | 'booking' | 'whatsapp' | 'services' | 'human_handoff';
    serviceId?: string;
    vehicleCategory?: VehicleCategory;
    estimateAmount?: number;
    title?: string;
  };
}

export interface ConversationSession {
  conversationId: string;
  channel: 'website' | 'whatsapp';
  customerPhone?: string;
  customerName?: string;
  status: 'active' | 'handed_off_to_human' | 'closed';
  requiresHumanHandoff: boolean;
  lastMessageSnippet: string;
  createdAt: string;
  updatedAt: string;
}

export interface TimeSlotAvailability {
  slot: string;
  isAvailable: boolean;
  conflictReason?: string;
}
