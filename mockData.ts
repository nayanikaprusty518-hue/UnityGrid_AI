export const mockNeeds = [
  {
    id: 'n1',
    category: 'Medical',
    urgency: 'High',
    location: { lat: 14.5995, lng: 120.9842 }, // Manila
    description: 'Emergency trauma kits needed at the central evacuation center.',
    requesterName: 'Juan Dela Cruz',
    requesterPhone: '0912345678',
    status: 'Open'
  },
  {
    id: 'n2',
    category: 'Food',
    urgency: 'Medium',
    location: { lat: 14.6095, lng: 120.9742 },
    description: 'Clean water and ready-to-eat meals for 50 families.',
    requesterName: 'Maria Santos',
    requesterPhone: '0922334455',
    status: 'Open'
  },
  {
    id: 'n3',
    category: 'Shelter',
    urgency: 'Low',
    location: { lat: 14.5895, lng: 120.9942 },
    description: 'Temporary roofing materials for damaged houses.',
    requesterName: 'Pedro Penduko',
    requesterPhone: '0933445566',
    status: 'Open'
  },
  {
    id: 'n4',
    category: 'Medical',
    urgency: 'High',
    location: { lat: 14.6195, lng: 121.0042 },
    description: 'Insulin refrigeration failure. Immediate transport needed.',
    requesterName: 'Elena Richards',
    requesterPhone: '0944556677',
    status: 'Open'
  },
  {
    id: 'n5',
    category: 'Sanitation',
    urgency: 'Medium',
    location: { lat: 14.5795, lng: 120.9642 },
    description: 'Hygiene kits and portable toilets needed for campsite.',
    requesterName: 'Carlos Garcia',
    requesterPhone: '0955667788',
    status: 'Open'
  }
];

export const mockVolunteers = [
  {
    id: 'v1',
    name: 'Dr. Sarah Lim',
    skills: ['Medical', 'Surgery', 'Emergency Response'],
    contact: '0911222333',
    available: true
  },
  {
    id: 'v2',
    name: 'Mike Evans',
    skills: ['Logistics', 'Driving', 'Heavy Lifting'],
    contact: '0922333444',
    available: true
  },
  {
    id: 'v3',
    name: 'Anna Reyes',
    skills: ['Nursing', 'First Aid', 'Nutrition'],
    contact: '0933444555',
    available: true
  },
  {
    id: 'v4',
    name: 'James Bondoc',
    skills: ['Search and Rescue', 'Firefighting'],
    contact: '0944555666',
    available: true
  },
  {
    id: 'v5',
    name: 'MBBS Student - Kevin',
    skills: ['Medical', 'Basic Life Support'],
    contact: '0955666777',
    available: true
  }
];
