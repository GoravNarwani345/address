export interface Property {
  id: number;
  title: string;
  price: string;
  image: string;
  location: string;
  description: string;
  type: string;
}

export const mockProperties: Property[] = [
  {
    id: 1,
    title: 'Modern Downtown Apartment',
    price: 'RS:21,200',
    image: 'https://images.pexels.com/photos/373965/pexels-photo-373965.jpeg?auto=compress&cs=tinysrgb&w=1200',
    location: 'Downtown, Cityville',
    description: 'A beautiful modern apartment in the city center with nearby transit and nightlife.',
    type: 'apartment'
  },
  {
    id: 2,
    title: 'Spacious Family House',
    price: 'RS:1650,000',
    image: 'https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=1200',
    location: 'Greenwood Suburb',
    description: 'Four bedroom family home with a large backyard and excellent schools nearby.',
    type: 'house'
  },
  {
    id: 3,
    title: 'Luxury Condo with Sea View',
    price: 'RS:51,850,000',
    image: 'https://images.pexels.com/photos/1450359/pexels-photo-1450359.jpeg?auto=compress&cs=tinysrgb&w=1200',
    location: 'Seaside Boulevard',
    description: 'High-floor condo featuring panoramic ocean views, concierge services, and modern finishes.',
    type: 'condo'
  },

  {
    id: 5,
    title: 'Townhouse near Park',
    price: 'RS:1,420,000',
    image: 'https://images.pexels.com/photos/259962/pexels-photo-259962.jpeg?auto=compress&cs=tinysrgb&w=1200',
    location: 'Riverside Park',
    description: 'Three-level townhouse with modern kitchen, rooftop terrace, and park access.',
    type: 'townhouse'
  },
  {
    id: 6,
    title: 'Country Cottage',
    price: 'RS:1,295,000',
    image: 'https://images.pexels.com/photos/210617/pexels-photo-210617.jpeg?auto=compress&cs=tinysrgb&w=1200',
    location: 'Willow Creek',
    description: 'Charming cottage on a quiet lane, perfect for weekend escapes and gardening enthusiasts.',
    type: 'house'
  },
  {
    id: 7,
    title: 'Urban Penthouse',
    price: 'RS:1,23,000',
    image: 'https://images.pexels.com/photos/280229/pexels-photo-280229.jpeg?auto=compress&cs=tinysrgb&w=1200',
    location: 'Central Business District',
    description: 'Exclusive penthouse with private elevator, expansive terraces, and skyline views.',
    type: 'condo'
  },
  {
    id: 8,
    title: 'Affordable Suburban Home',
    price: 'RS:2,180,000',
    image: 'https://images.pexels.com/photos/259588/pexels-photo-259588.jpeg?auto=compress&cs=tinysrgb&w=1200',
    location: 'Maple Heights',
    description: 'Well-maintained three bedroom home in a friendly neighborhood with low HOA fees.',
    type: 'house'
  },
  {
    id: 9,
    title: 'Modern Apartment in Hyderabad',
    price: 'PKR:2,500,000',
    image: 'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=1200',
    location: 'Gulshan-e-Iqbal, Hyderabad, Pakistan',
    description: 'Contemporary apartment with modern amenities, close to shopping centers and restaurants.',
    type: 'apartment'
  },
  {
    id: 10,
    title: 'Luxury Villa in Hyderabad',
    price: 'PKR:15,000,000',
    image: 'https://images.pexels.com/photos/1396132/pexels-photo-1396132.jpeg?auto=compress&cs=tinysrgb&w=1200',
    location: 'Latifabad, Hyderabad, Pakistan',
    description: 'Spacious villa with swimming pool, garden, and premium finishes in a secure neighborhood.',
    type: 'house'
  },
  {
    id: 11,
    title: 'Commercial Space in Hyderabad',
    price: 'PKR:8,500,000',
    image: 'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=1200',
    location: 'Saddar, Hyderabad, Pakistan',
    description: 'Prime commercial location perfect for retail or office space with high foot traffic.',
    type: 'condo'
  },
  {
    id: 12,
    title: 'Cozy Townhouse in Hyderabad',
    price: 'PKR:4,200,000',
    image: 'https://images.pexels.com/photos/259962/pexels-photo-259962.jpeg?auto=compress&cs=tinysrgb&w=1200',
    location: 'Qasimabad, Hyderabad, Pakistan',
    description: 'Modern townhouse with attached garage and community amenities.',
    type: 'townhouse'
  }
];
