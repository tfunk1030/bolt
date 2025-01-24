interface ClubData {
  name: string
  baseDistance: number
  loft: number
  spinRate: number
}

interface Conditions {
  temperature: number
  humidity: number
  altitude: number
  windSpeed: number
  windDirection: number
  slope: number
}

const CLUBS: Record<string, ClubData> = {
  'Driver': { name: 'Driver', baseDistance: 230, loft: 10.5, spinRate: 2500 },
  '3-Wood': { name: '3-Wood', baseDistance: 215, loft: 15, spinRate: 3000 },
  '5-Wood': { name: '5-Wood', baseDistance: 200, loft: 18, spinRate: 3200 },
  '4-Iron': { name: '4-Iron', baseDistance: 180, loft: 21, spinRate: 3500 },
  '5-Iron': { name: '5-Iron', baseDistance: 170, loft: 24, spinRate: 4000 },
  '6-Iron': { name: '6-Iron', baseDistance: 160, loft: 27, spinRate: 4500 },
  '7-Iron': { name: '7-Iron', baseDistance: 150, loft: 31, spinRate: 5000 },
  '8-Iron': { name: '8-Iron', baseDistance: 140, loft: 35, spinRate: 5500 },
  '9-Iron': { name: '9-Iron', baseDistance: 130, loft: 39, spinRate: 6000 },
  'PW': { name: 'PW', baseDistance: 120, loft: 45, spinRate: 6500 },
  'GW': { name: 'GW', baseDistance: 110, loft: 50, spinRate: 7000 },
  'SW': { name: 'SW', baseDistance: 100, loft: 56, spinRate: 7500 },
  'LW': { name: 'LW', baseDistance: 90, loft: 60, spinRate: 8000 },
}

export function calculateShotDistance(clubName: string, conditions: Conditions): number {
  const club = CLUBS[clubName]
  if (!club) return 0

  // Base distance adjusted for altitude (2% increase per 1000ft)
  const altitudeEffect = 1 + (conditions.altitude / 1000) * 0.02

  // Temperature effect (1% increase per 10°F above 70°F)
  const tempEffect = 1 + ((conditions.temperature - 70) / 10) * 0.01

  // Humidity effect (minimal impact, -0.1% per 10% above 50%)
  const humidityEffect = 1 - ((conditions.humidity - 50) / 10) * 0.001

  // Wind effect (headwind/tailwind component)
  const windAngleRad = (conditions.windDirection * Math.PI) / 180
  const windEffect = 1 + (Math.cos(windAngleRad) * conditions.windSpeed * 0.01)

  // Slope effect (uphill/downhill)
  const slopeRad = (conditions.slope * Math.PI) / 180
  const slopeEffect = Math.cos(slopeRad)

  // Calculate final distance with all effects
  const adjustedDistance = club.baseDistance * 
    altitudeEffect * 
    tempEffect * 
    humidityEffect * 
    windEffect * 
    slopeEffect

  return Math.round(adjustedDistance * 10) / 10 // Round to 1 decimal place
}

export function getClubData() {
  return Object.values(CLUBS)
}

export function getClubByName(name: string): ClubData | undefined {
  return CLUBS[name]
} 