import { YardageModelEnhanced as YardageModelRevised } from '@/src/models/revised-yardage-model';
import { YardageModelEnhanced as YardageModelLegacy } from '@/src/models/yardage-model';
import { SkillLevel } from '@/src/models/yardage_modelds';
import { normalizeClubName } from '@/src/utils/club-mapping';

// Get inputs from command line arguments
const targetYardage = parseFloat(process.argv[2]);
const windSpeed = parseFloat(process.argv[3]);
const windDirection = parseFloat(process.argv[4]);

if (!targetYardage || !windSpeed || windDirection === undefined) {
  console.log('Usage: npx ts-node scripts/wind-test.ts <target-yardage> <wind-speed> <wind-direction>');
  console.log('Example: npx ts-node scripts/wind-test.ts 150 10 180');
  process.exit(1);
}

// Standard environmental conditions from environmental service
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
  legacy: new YardageModelLegacy()
};

// Exact same calculation function from wind-comparison page
function calculateModelEffect(model: YardageModelRevised | YardageModelLegacy, clubKey: string) {
  try {
    console.log('\nCalculation Debug:');
    console.log('Club Key:', clubKey);
    console.log('Environmental Conditions:', conditions);
    console.log('Target Yardage:', targetYardage);
    console.log('Wind Speed:', windSpeed);
    console.log('Wind Direction:', windDirection);

    model.set_ball_model("tour_premium");
    console.log('Ball Model: tour_premium');

    // First calculate environmental effects without wind
    console.log('\nNo Wind Calculation:');
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
    console.log('Environment Only Result:', envResult);

    // Then calculate with wind added
    console.log('\nWith Wind Calculation:');
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
    console.log('Wind Added Result:', windResult);

    // Calculate effects exactly as in wind-comparison page
    const envEffect = -(envResult.carry_distance - targetYardage);
    const windEffect = -(windResult.carry_distance - envResult.carry_distance);
    const lateralEffect = windResult.lateral_movement;

    console.log('\nFinal Effects:');
    console.log('Environmental Effect:', envEffect);
    console.log('Wind Effect:', windEffect);
    console.log('Lateral Effect:', lateralEffect);
    console.log('Total Distance:', targetYardage + envEffect + windEffect);

    return {
      environmentalEffect: envEffect,
      windEffect: windEffect,
      lateralEffect: lateralEffect,
      totalDistance: targetYardage + envEffect + windEffect,
      clubData: {
        name: recommendedClub.name,
        normalCarry: recommendedClub.normalYardage,
        adjustedCarry: windResult.carry_distance,
        lateral: lateralEffect
      }
    };
  } catch (error) {
    console.error('Error calculating model effect:', error);
    return null;
  }
}

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

// Get recommended club based on yardage (same logic as club-settings-context)
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

// Get recommended club and normalize name
const recommendedClub = getRecommendedClub(targetYardage);
const clubKey = normalizeClubName(recommendedClub.name);
console.log('\nDebug:');
console.log('Original club name:', recommendedClub.name);
console.log('Normalized club key:', clubKey);

// Calculate effects for both models
const results = {
  revised: calculateModelEffect(models.revised, clubKey),
  legacy: calculateModelEffect(models.legacy, clubKey)
};

// Output results in same format as wind-comparison page
console.log('\nWind Effect Results');
console.log('─'.repeat(40));
console.log(`Target Distance: ${targetYardage} yards`);
console.log(`Wind Speed: ${windSpeed} mph`);
console.log(`Wind Direction: ${windDirection}°`);
console.log(`Club: ${recommendedClub.name}`);
console.log('─'.repeat(40));

[
  { name: "Revised Model", result: results.revised },
  { name: "Legacy Model", result: results.legacy }
].forEach(({ name, result }) => {
  if (result) {
    console.log(`\n${name}:`);
    console.log(`${result.windEffect.toFixed(1)} yards`);
    console.log(`${Math.abs(result.lateralEffect).toFixed(1)} yards ${result.lateralEffect > 0 ? 'right' : 'left'}`);
  }
});
