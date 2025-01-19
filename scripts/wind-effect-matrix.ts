import { YardageModelEnhanced as YardageModelRevised } from '@/lib/revised-yardage-model';
import { YardageModelEnhanced as YardageModelLegacy } from '@/lib/yardage-model';
import { SkillLevel } from '@/lib/yardage_modelds';
import { normalizeClubName } from '@/lib/utils/club-mapping';

// Test parameters
const YARDAGES = Array.from({ length: 12 }, (_, i) => 80 + i * 20); // 80-300 in 20 yard increments
const WIND_SPEEDS = [5, 10, 15, 20];
const WIND_DIRECTIONS = [
  { name: "Head Wind", degrees: 180 },
  { name: "Tail Wind", degrees: 0 },
  { name: "Cross Wind", degrees: 90 },
  { name: "Quartering Head Wind", degrees: 135 },
  { name: "Quartering Help Wind", degrees: 45 }
];

// Standard environmental conditions
const conditions = {
  temperature: 70,
  altitude: 0,
  pressure: 1013.25,
  humidity: 60,
  density: 1.225
};

// Initialize models
const models = {
  revised: new YardageModelRevised(),
};

// Default clubs from club-settings-context
const DEFAULT_CLUBS = [
  { name: "Driver", normalYardage: 282, loft: 9.5 },
  { name: "3-Wood", normalYardage: 249, loft: 15 },
  { name: "5-Wood", normalYardage: 236, loft: 18 },
  { name: "Hybrid", normalYardage: 231, loft: 20 },
  { name: "3-Iron", normalYardage: 218, loft: 21 },
  { name: "4-Iron", normalYardage: 209, loft: 24 },
  { name: "5-Iron", normalYardage: 199, loft: 27 },
  { name: "6-Iron", normalYardage: 188, loft: 30 },
  { name: "7-Iron", normalYardage: 176, loft: 34 },
  { name: "8-Iron", normalYardage: 164, loft: 38 },
  { name: "9-Iron", normalYardage: 152, loft: 42 },
  { name: "PW", normalYardage: 142, loft: 46 },
  { name: "GW", normalYardage: 130, loft: 50 },
  { name: "SW", normalYardage: 118, loft: 54 },
  { name: "LW", normalYardage: 106, loft: 58 }
];

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

function calculateModelEffect(
  model: YardageModelRevised | YardageModelLegacy,
  clubKey: string,
  targetYardage: number,
  windSpeed: number,
  windDirection: number
) {
  try {
    model.set_ball_model("tour_premium");

    // First calculate environmental effects without wind
    model.set_conditions(
      conditions.temperature,
      conditions.altitude,
      0,  // No wind
      0,  // No wind direction
      conditions.pressure,
      conditions.humidity
    );

    const envResult = model.calculate_adjusted_yardage(
      targetYardage,
      SkillLevel.PROFESSIONAL,
      clubKey
    );

    // Then calculate with wind added
    model.set_conditions(
      conditions.temperature,
      conditions.altitude,
      windSpeed,
      windDirection,
      conditions.pressure,
      conditions.humidity
    );

    const windResult = model.calculate_adjusted_yardage(
      targetYardage,
      SkillLevel.PROFESSIONAL,
      clubKey
    );

    const windEffect = -(windResult.carry_distance - envResult.carry_distance);
    const lateralEffect = windResult.lateral_movement;

    return { windEffect, lateralEffect };
  } catch (error) {
    console.error('Error calculating model effect:', error);
    return null;
  }
}

// Create output string
let output = 'Wind Effect Matrix\n\n';

for (const windDirection of WIND_DIRECTIONS) {
  output += `${windDirection.name} (${windDirection.degrees}°)\n`;
  output += '─'.repeat(120) + '\n';
  
  // Header row
  output += 'Target | Club  | Model  | ' + WIND_SPEEDS.map(speed => 
    `${speed} mph (Wind/Lateral)`.padEnd(25)
  ).join(' | ') + '\n';
  output += '─'.repeat(120) + '\n';

  for (const yardage of YARDAGES) {
    const recommendedClub = getRecommendedClub(yardage);
    const clubKey = normalizeClubName(recommendedClub.name);

    // Calculate for both models
    for (const [modelName, model] of Object.entries(models)) {
      const results = WIND_SPEEDS.map(speed => 
        calculateModelEffect(model, clubKey, yardage, speed, windDirection.degrees)
      );

      // Format the results
      const resultStr = results.map(result => {
        if (!result) return 'Error'.padEnd(25);
        const windStr = result.windEffect.toFixed(1).padStart(6);
        const lateralStr = (Math.abs(result.lateralEffect).toFixed(1) + (result.lateralEffect > 0 ? 'R' : 'L')).padStart(6);
        return `${windStr}y / ${lateralStr}y`.padEnd(25);
      }).join(' | ');

      output += `${yardage.toString().padStart(6)} | ${recommendedClub.name.padEnd(6)} | ${modelName.padEnd(6)} | ${resultStr}\n`;
    }
    output += '─'.repeat(120) + '\n';
  }
  output += '\n\n';
}

// Write to file
const fs = require('fs');
fs.writeFileSync('wind-effects-output.txt', output);
console.log('Wind effect matrix has been written to wind-effects-output.txt');
