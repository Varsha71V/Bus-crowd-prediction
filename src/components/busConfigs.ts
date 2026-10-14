import type { BusConfig } from './BusTracker';

export const BUS_290_CONFIG: BusConfig = {
  busNumber: '290EN',
  busType: 'Electric',
  source: 'Yelahanka',
  destination: 'Nagawara Junction',
  departureTime: '8:00 AM',
  totalSeats: 42,
  centerLat: 13.075,
  centerLng: 77.595,
  stops: [
    { id: 's1', name: 'Yelahanka', lat: 13.1006, lng: 77.5963 },
    { id: 's2', name: 'Maruthi Nagar', lat: 13.0955, lng: 77.5910 },
    { id: 's3', name: 'Kogilu', lat: 13.0880, lng: 77.5870 },
    { id: 's4', name: 'Jelli Machine', lat: 13.0810, lng: 77.5850 },
    { id: 's5', name: 'Thirumenahalli Cross', lat: 13.0735, lng: 77.5835 },
    { id: 's6', name: 'R K Hegde Nagar', lat: 13.0660, lng: 77.5860 },
    { id: 's7', name: 'Thanisandra', lat: 13.0580, lng: 77.5900 },
    { id: 's8', name: 'Nagawara Junction', lat: 13.0480, lng: 77.5950 },
  ],
};

export const BUS_300_CONFIG: BusConfig = {
  busNumber: '300E',
  busType: 'Electric',
  source: 'Shivajinagar Bus Station',
  destination: 'K R Puram',
  departureTime: '6:05 AM',
  totalSeats: 42,
  centerLat: 13.005,
  centerLng: 77.640,
  stops: [
    { id: 's1', name: 'Shivajinagar Bus Station', lat: 12.9750, lng: 77.6100 },
    { id: 's2', name: 'Cunningham Road', lat: 12.9850, lng: 77.5950 },
    { id: 's3', name: 'Coles Park', lat: 12.9930, lng: 77.6200 },
    { id: 's4', name: 'ITC Factory', lat: 13.0000, lng: 77.6300 },
    { id: 's5', name: 'Maruthi Seva Nagar', lat: 13.0050, lng: 77.6400 },
    { id: 's6', name: 'Subbaiahna Palya', lat: 13.0100, lng: 77.6480 },
    { id: 's7', name: 'Banasawadi', lat: 13.0150, lng: 77.6550 },
    { id: 's8', name: 'Jn. of Ring Road', lat: 13.0200, lng: 77.6600 },
    { id: 's9', name: 'Ramamurthy Nagar', lat: 13.0250, lng: 77.6650 },
    { id: 's10', name: 'K R Puram', lat: 13.0300, lng: 77.6700 },
  ],
};

export const BUS_290EY_CONFIG: BusConfig = {
  busNumber: '290EY',
  busType: 'Electric',
  source: 'Kempegowda Bus Station',
  destination: 'Yelahanka',
  departureTime: '5:30 AM',
  totalSeats: 42,
  centerLat: 13.030,
  centerLng: 77.590,
  stops: [
    { id: 's1', name: 'Kempegowda Bus Station', lat: 12.9780, lng: 77.5680 },
    { id: 's2', name: 'Maharani College', lat: 12.9830, lng: 77.5730 },
    { id: 's3', name: 'Indian Express', lat: 12.9880, lng: 77.5780 },
    { id: 's4', name: 'Cunningham Road', lat: 12.9930, lng: 77.5830 },
    { id: 's5', name: 'Coles Park', lat: 12.9980, lng: 77.5880 },
    { id: 's6', name: 'Periyar Nagara Circle', lat: 13.0200, lng: 77.5890 },
    { id: 's7', name: 'K G Halli Police Station', lat: 13.0450, lng: 77.5900 },
    { id: 's8', name: 'Nagavara', lat: 13.0700, lng: 77.5920 },
    { id: 's9', name: 'Yelahanka', lat: 13.1006, lng: 77.5963 },
  ],
};
