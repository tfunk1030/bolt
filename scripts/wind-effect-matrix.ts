import { YardageModelEnhanced as YardageModelRevised } from '@/lib/revised-yardage-model';
import { SkillLevel } from '@/lib/yardage_modelds';
import { normalizeClubName } from '@/lib/utils/club-mapping';

// Test parameters
const YARDAGES = Array.from({ length: 12 }, (_, i) => 80 + i * 20); // 80-300 in 20 yard increments
const WIND_SPEEDS = [5, 10, 15, 20];
const WIND_DIRECTIONS = [
  { name: "Head Wind", degrees: 0 },
  { name: "Tail Wind", degrees: 180 },
  { name: "Cross Wind", degrees: 90 },
  { name: "Quartering Head Wind", degrees: 45 },
  { name: "Quartering Help Wind", degrees: 135 }
];

// Default clubs with their normal yardages
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

// Standard environmental conditions
const conditions = {
  temperature: 70,
  altitude: 0,
  pressure: 1013.25,
  humidity: 60,
  density: 1.193
};

// Initialize model
const yardageModel = new YardageModelRevised();

function getRecommendedClub(targetYardage: number) {
  let closestClub = DEFAULT_CLUBS[0];
  let minDiff = Math.abs(DEFAULT_CLUBS[0].normalYardage - targetYardage);

  for (const club of DEFAULT_CLUBS) {
    const diff = Math.abs(club.normalYardage - targetYardage);
    if (diff < minDiff) {
      minDiff = diff;
      closestClub = club;
    }
  }

  return closestClub;
}

function calculateModelEffect(yardage: number, windSpeed: number, windDirection: number) {
  try {
    const recommendedClub = getRecommendedClub(yardage);
    const clubKey = normalizeClubName(recommendedClub.name);
    
    // Set ball model with enhanced features
    yardageModel.set_ball_model("tour_premium");

    // First calculate environmental effects without wind
    yardageModel.set_conditions(
      conditions.temperature,
      conditions.altitude,
      0,  // No wind
      0,  // No wind direction
      conditions.pressure,
      conditions.humidity
    );

    const envResult = yardageModel.calculate_adjusted_yardage(
      yardage,
      SkillLevel.PROFESSIONAL,
      clubKey
    );

    if (!envResult) {
      console.error('No environmental result from calculation');
      return null;
    }

    // Then calculate with wind added
    yardageModel.set_conditions(
      conditions.temperature,
      conditions.altitude,
      windSpeed,
      windDirection,
      conditions.pressure,
      conditions.humidity
    );

    const windResult = yardageModel.calculate_adjusted_yardage(
      yardage,
      SkillLevel.PROFESSIONAL,
      clubKey
    );

    if (!windResult) {
      console.error('No wind result from calculation');
      return null;
    }

    // Calculate effects matching the app's calculations
    const environmentalEffect = -(envResult.carry_distance - yardage);
    const windEffect = -(windResult.carry_distance - envResult.carry_distance);
    
    return {
      clubKey,
      environmentalEffect,
      windEffect,
      lateralEffect: windResult.lateral_movement,
      totalDistance: windResult.carry_distance
    };
  } catch (error) {
    console.error('Error calculating model effect:', error);
    return null;
  }
}

// Generate the matrix
function generateMatrix() {
  let output = '# Wind Effect Matrix\n\n';

  for (const windDirection of WIND_DIRECTIONS) {
    output += `## ${windDirection.name} (${windDirection.degrees}°)\n\n`;
    
    // Header row with alignment markers
    output += [
      '| Target',
      'Club',
      ...WIND_SPEEDS.map(speed => `${speed} mph (Wind/Lateral)`)
    ].join(' | ') + ' |\n';
    
    // Alignment row
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

      // Format each data column
      const resultStr = results.map(result => {
        if (!result) return 'Error';
        
        // Format wind effect
        const windSign = result.windEffect >= 0 ? '+' : '';
        const windStr = windSign + result.windEffect.toFixed(1).padStart(5);
        const windColor = result.windEffect >= 0 ? '#22c55e' : '#ef4444';
        
        // Format lateral effect
        const lateralStr = result.lateralEffect.toFixed(1).padStart(4) + 'L';
        
        return `**<span style="color: ${windColor}">${windStr}y</span>** / **<span style="color: #3b82f6">${lateralStr}y</span>**`;
      }).join(' | ');

      // Format row
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

// Execute and save output
const output = generateMatrix();
const fs = require('fs');
fs.writeFileSync('wind-effects-output.md', output);  // Changed extension to .md
console.log('Wind effect matrix has been written to wind-effects-output.md');
