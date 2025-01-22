import { YardageModelEnhanced } from '@/lib/latetso1model';
import { SkillLevel } from '@/lib/yardage_modelds';
import { normalizeClubName } from '@/lib/utils/club-mapping';

// Test parameters remain unchanged
const YARDAGES = Array.from({ length: 12 }, (_, i) => 80 + i * 20);
const WIND_SPEEDS = [5, 10, 15, 20];
const WIND_DIRECTIONS = [
  { name: "Head Wind", degrees: 0 },
  { name: "Tail Wind", degrees: 180 },
  { name: "Cross Wind", degrees: 90 },
  { name: "Quartering Head Wind", degrees: 45 },
  { name: "Quartering Help Wind", degrees: 135 }
];

// Club data remains unchanged
const DEFAULT_CLUBS = [
  { name: "Driver", normalYardage: 295 },
  { name: "3-Wood", normalYardage: 258 },
  { name: "3-Iron", normalYardage: 233 },
  { name: "4-Iron", normalYardage: 215 },
  { name: "5-Iron", normalYardage: 203 },
  { name: "6-Iron", normalYardage: 192 },
  { name: "7-Iron", normalYardage: 176 },
  { name: "8-Iron", normalYardage: 164 },
  { name: "9-Iron", normalYardage: 152 },
  { name: "PW", normalYardage: 136 },
  { name: "GW", normalYardage: 122 },
  { name: "SW", normalYardage: 110 },
  { name: "LW", normalYardage: 90 }
];

// Use the model's standard conditions
const CONDITIONS = {
  temperature: 70,
  altitude: 0,
  pressure: 1013.25,
  humidity: 60,
  density: 1.193
};

// Single instance of the model
const yardageModel = new YardageModelEnhanced();

interface ModelEffect {
  clubKey: string;
  environmentalEffect: number;
  windEffect: number;
  lateralEffect: number;
  totalDistance: number;
}

function getRecommendedClub(targetYardage: number) {
  return DEFAULT_CLUBS.reduce((closest, club) => {
    const currentDiff = Math.abs(club.normalYardage - targetYardage);
    const closestDiff = Math.abs(closest.normalYardage - targetYardage);
    return currentDiff < closestDiff ? club : closest;
  }, DEFAULT_CLUBS[0]);
}

function calculateModelEffect(
  yardage: number,
  windSpeed: number,
  windDirection: number
): ModelEffect | null {
  try {
    // Let the model handle all validation
    const recommendedClub = getRecommendedClub(yardage);
    const clubKey = normalizeClubName(recommendedClub.name);
    
    // Use tour premium ball for consistency
    yardageModel.set_ball_model("tour_premium");

    // Calculate baseline using model's no-wind scenario
    yardageModel.set_conditions(
      CONDITIONS.temperature,
      CONDITIONS.altitude,
      0,
      0,
      CONDITIONS.pressure,
      CONDITIONS.humidity
    );

    const envResult = yardageModel.calculate_adjusted_yardage(
      yardage,
      SkillLevel.PROFESSIONAL,
      clubKey
    );

    // Calculate with wind using model's internal physics
    yardageModel.set_conditions(
      CONDITIONS.temperature,
      CONDITIONS.altitude,
      windSpeed,
      windDirection,
      CONDITIONS.pressure,
      CONDITIONS.humidity
    );

    const windResult = yardageModel.calculate_adjusted_yardage(
      yardage,
      SkillLevel.PROFESSIONAL,
      clubKey
    );

    // Calculate effects using the model's results
    return {
      clubKey,
      environmentalEffect: Number((-(envResult.carry_distance - yardage)).toFixed(1)),
      windEffect: Number((-(windResult.carry_distance - envResult.carry_distance)).toFixed(1)),
      lateralEffect: Number(windResult.lateral_movement.toFixed(1)),
      totalDistance: Number(windResult.carry_distance.toFixed(1))
    };
  } catch (error) {
    console.error('Error calculating model effect:', error);
    return null;
  }
}

function generateMatrix(): string {
  let output = '# Wind Effect Matrix\n\n';
  
  for (const windDirection of WIND_DIRECTIONS) {
    output += `## ${windDirection.name} (${windDirection.degrees}°)\n\n`;
    
    output += [
      '| Target',
      'Club',
      ...WIND_SPEEDS.map(speed => `${speed} mph (Wind/Lateral)`)
    ].join(' | ') + ' |\n';
    
    output += [
      '| ---:',
      ':---',
      ...WIND_SPEEDS.map(() => ':---:')
    ].join(' | ') + ' |\n';

    for (const yardage of YARDAGES) {
      const results = WIND_SPEEDS.map(speed => 
        calculateModelEffect(yardage, speed, windDirection.degrees)
      );

      if (!results[0]) continue;

      const resultStr = results.map(result => {
        if (!result) return 'Error';
        
        const windSign = result.windEffect >= 0 ? '+' : '';
        const windStr = windSign + result.windEffect.toFixed(1).padStart(5);
        const windColor = result.windEffect >= 0 ? '#22c55e' : '#ef4444';
        
        const lateralStr = Math.abs(result.lateralEffect).toFixed(1).padStart(4) + 
                         (result.lateralEffect < 0 ? 'R' : 'L');
        
        return `**<span style="color: ${windColor}">${windStr}y</span>** / ` +
               `**<span style="color: #3b82f6">${lateralStr}y</span>**`;
      }).join(' | ');

      output += [
        `| **${yardage}**`,
        `${results[0].clubKey.toLowerCase()}`,
        resultStr
      ].join(' | ') + ' |\n';
    }
    output += '\n\n';
  }

  return output;
}

try {
  const output = generateMatrix();
  const fs = require('fs');
  fs.writeFileSync('wind-effects-output.md', output);
  console.log('Wind effect matrix generated successfully');
} catch (error) {
  console.error('Error generating wind effect matrix:', error);
  process.exit(1);
}