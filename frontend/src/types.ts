/**
 * Types for Karabu Visas y Viajes Application
 */

export interface Destination {
  id: string;
  name: string;
  image: string;
  description: string;
  category?: string;
}

export interface Service {
  id: string;
  title: string;
  iconName: string; // Lucide icon identifier
  description: string;
}

export interface Promotion {
  id: string;
  title: string;
  badgeText: string;
  badgeType: 'highlight' | 'limited' | 'default';
  image: string;
  duration: string;
  details: string;
  price: number;
}

export interface Testimonial {
  id: string;
  quote: string;
  name: string;
  destination: string;
  stars: number;
  avatar: string;
}

export interface ValueItem {
  id: string;
  title: string;
  iconName: string;
  description: string;
}

export interface StepItem {
  id: number;
  title: string;
  description: string;
  iconName: string;
}

export interface ContactFormInput {
  fullName: string;
  email: string;
  phone: string;
  country: string;
  city: string;
  preferredHotel: string;
  departureDate: string;
  returnDate: string;
  flexibleDates: string; // 'Sí' | 'No'
  adultsCount: number;
  childrenCount: number;
  babiesCount: number;
  budgetRange: string;
  additionalServices: string[];
  preferredContact: string; // 'email' | 'whatsapp' | 'ambos'
  travelType: string;
  hotelCategory: string;
  comments: string;
  habitacionesSencilla: number;
  habitacionesDoble: number;
  habitacionesTriple: number;
}
