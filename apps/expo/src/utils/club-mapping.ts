export type ClubType = 'driver' | 'wood' | 'hybrid' | 'iron' | 'wedge' | 'putter';

export interface Club {
  name: string;
  type: ClubType;
  normalYardage: number;
  loft: number;
  launchAngle: number;
  spinRate: number;
}

export const defaultClubs: Club[] = [
  {
    name: 'Driver',
    type: 'driver',
    normalYardage: 260,
    loft: 10.5,
    launchAngle: 12,
    spinRate: 2500,
  },
  {
    name: '3 Wood',
    type: 'wood',
    normalYardage: 235,
    loft: 15,
    launchAngle: 14,
    spinRate: 3000,
  },
  {
    name: '5 Wood',
    type: 'wood',
    normalYardage: 215,
    loft: 18,
    launchAngle: 15,
    spinRate: 3200,
  },
  {
    name: '4 Iron',
    type: 'iron',
    normalYardage: 190,
    loft: 21,
    launchAngle: 16,
    spinRate: 4000,
  },
  {
    name: '5 Iron',
    type: 'iron',
    normalYardage: 180,
    loft: 24,
    launchAngle: 17,
    spinRate: 4500,
  },
  {
    name: '6 Iron',
    type: 'iron',
    normalYardage: 170,
    loft: 27,
    launchAngle: 18,
    spinRate: 5000,
  },
  {
    name: '7 Iron',
    type: 'iron',
    normalYardage: 160,
    loft: 31,
    launchAngle: 19,
    spinRate: 5500,
  },
  {
    name: '8 Iron',
    type: 'iron',
    normalYardage: 150,
    loft: 35,
    launchAngle: 20,
    spinRate: 6000,
  },
  {
    name: '9 Iron',
    type: 'iron',
    normalYardage: 140,
    loft: 39,
    launchAngle: 21,
    spinRate: 6500,
  },
  {
    name: 'PW',
    type: 'wedge',
    normalYardage: 130,
    loft: 45,
    launchAngle: 22,
    spinRate: 7000,
  },
  {
    name: 'GW',
    type: 'wedge',
    normalYardage: 120,
    loft: 50,
    launchAngle: 23,
    spinRate: 7500,
  },
  {
    name: 'SW',
    type: 'wedge',
    normalYardage: 110,
    loft: 56,
    launchAngle: 24,
    spinRate: 8000,
  },
  {
    name: 'LW',
    type: 'wedge',
    normalYardage: 90,
    loft: 60,
    launchAngle: 25,
    spinRate: 8500,
  },
];
