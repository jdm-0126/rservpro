export type Villa = {
  id: string;
  name: string;
  location: string;
  price: number;
  guests: number;
  bedrooms: number;
  description: string;
  amenities: string[];
  image: string;
};

export type Booking = {
  id: string;
  villaId: string;
  userId: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'cancelled';
};

export const VILLAS: Villa[] = [
  {
    id: '1',
    name: 'Azure Cliff Villa',
    location: 'Santorini, Greece',
    price: 450,
    guests: 8,
    bedrooms: 4,
    description: 'Stunning cliffside villa with panoramic sea views, private infinity pool, and direct access to the Aegean Sea.',
    amenities: ['Infinity Pool', 'WiFi', 'Air Conditioning', 'BBQ', 'Private Chef', 'Sea View'],
    image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800',
  },
  {
    id: '2',
    name: 'Tropical Haven',
    location: 'Bali, Indonesia',
    price: 280,
    guests: 6,
    bedrooms: 3,
    description: 'Lush tropical villa surrounded by rice terraces with a private pool and open-air living spaces.',
    amenities: ['Private Pool', 'WiFi', 'Daily Housekeeping', 'Breakfast', 'Garden', 'Yoga Deck'],
    image: 'https://images.unsplash.com/photo-1537640538966-79f369143f8f?w=800',
  },
  {
    id: '3',
    name: 'Tuscan Retreat',
    location: 'Tuscany, Italy',
    price: 380,
    guests: 10,
    bedrooms: 5,
    description: 'Historic stone villa nestled in rolling Tuscan hills with vineyard views and a heated outdoor pool.',
    amenities: ['Heated Pool', 'WiFi', 'Wine Cellar', 'Fireplace', 'Vineyard View', 'Parking'],
    image: 'https://images.unsplash.com/photo-1523531294919-4bcd7c65e216?w=800',
  },
];
