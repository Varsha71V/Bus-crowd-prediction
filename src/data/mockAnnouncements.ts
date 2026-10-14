export interface Announcement {
  id: string;
  title: string;
  category: 'Service Alert' | 'Route Change' | 'Metro Feeder' | 'Passenger Info';
  date: string;
  badgeColor: string;
  content: string;
  affectedRoutes?: string[];
  priority: 'low' | 'medium' | 'high';
}

export const MOCK_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'ann-1',
    title: 'Metro Feeder Frequency Augmented on Silk Board - KR Puram Corridor',
    category: 'Metro Feeder',
    date: '14 Oct 2026',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
    content: 'To support Yellow Line and Blue Line construction transitions, 15 additional electric feeder buses are deployed between Central Silk Board, HSR Layout, and KR Puram railway station during peak hours (8 AM - 11 AM & 5 PM - 9 PM).',
    affectedRoutes: ['500-D', '305'],
    priority: 'high',
  },
  {
    id: 'ann-2',
    title: 'Temporary Diversion near Thanisandra Main Road for Pipeline Works',
    category: 'Route Change',
    date: '13 Oct 2026',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
    content: 'Buses operating on route 290EN will take a slight detour via Kogilu Cross and Jelli Machine. Commuters boarding at Thanisandra Main Road are requested to use the temporary shelter 200m ahead.',
    affectedRoutes: ['290EN'],
    priority: 'medium',
  },
  {
    id: 'ann-3',
    title: '100% Zero-Emission Electric Buses on Outer Ring Road',
    category: 'Passenger Info',
    date: '11 Oct 2026',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    content: 'BMTC has successfully converted all 500-series routes to non-polluting Smart Electric buses with regenerative braking, panic buttons, and real-time passenger crowd telemetry.',
    affectedRoutes: ['500-D', '300E'],
    priority: 'low',
  },
  {
    id: 'ann-4',
    title: 'Special Night Services for Kempegowda International Airport & Majestic',
    category: 'Service Alert',
    date: '09 Oct 2026',
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
    content: 'Vayu Vajra AC services will operate with an enhanced 20-minute frequency round the clock from Kempegowda Bus Station (Majestic) and Electronic City.',
    affectedRoutes: ['335-E', '290EY'],
    priority: 'medium',
  },
];
