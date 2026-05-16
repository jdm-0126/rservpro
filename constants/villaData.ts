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
    name: 'Casa Luna Silang Cavite',
    location: 'Silang, Cavite',
    price: 5000,
    guests: 20,
    bedrooms: 5,
    description: 'A beautiful private villa nestled in the cool highlands of Silang, Cavite. Perfect for family gatherings, reunions, and special celebrations with lush garden surroundings and refreshing mountain air.',
    amenities: ['Private Pool', 'WiFi', 'Air Conditioning', 'BBQ', 'Parking', 'Garden', 'Outdoor Dining', 'Karaoke'],
    image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800',
  },
  {
    id: '2',
    name: 'Casa Luna Pampanga',
    location: 'Pampanga',
    price: 5000,
    guests: 20,
    bedrooms: 5,
    description: 'An elegant private villa in the heart of Pampanga, the culinary capital of the Philippines. Ideal for events, staycations, and family getaways with spacious indoor and outdoor living areas.',
    amenities: ['Private Pool', 'WiFi', 'Air Conditioning', 'BBQ', 'Parking', 'Garden', 'Outdoor Dining', 'Karaoke'],
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800',
  },
];
