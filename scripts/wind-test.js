const { YardageModelEnhanced: YardageModelRevised } = require('../lib/revised-yardage-model');
const { YardageModelEnhanced: YardageModelLegacy } = require('../lib/yardage-model');
const { SkillLevel } = require('../lib/yardage_modelds');

// Get inputs from command line arguments
const targetYardage = parseFloat(process.argv[2]);
const windSpeed = parseFloat(process.argv[3]);
const windDirection = parseFloat(process.argv[4]);

if (!targetYardage || !windSpeed || windDirection === undefined) {
  console.log('Usage: node scripts/wind-test.js <target-yardage> <wind-speed> <wind-direction>');
  console.log('Example: node scripts/wind-test.js 150 10 180');
  process.exit(1);
}

const models = {
  revised: new YardageModelRevised(),
  legacy: new YardageModelLegacy()
};

function calculateModelEffect(model, clubKey) {
  try {
    model.set_ball_model("tour_premium");

    // First calculate environmental effects without wind
    model.set_conditions(
      70,  // temperature
      0,   // altitude
      0,   // No wind
      0,   // No wind direction
      1013.25, // pressure
      50   // humidity
    );

    const envResult = model.calculate_adjusted_yardage(
      targetYardage,
      SkillLevel.PROFESSIONAL,
      clubKey
    );

    // Then calculate with wind added
    model.set_conditions(
      70,  // temperature
      0,   // altitude
      windSpeed,
      windDirection,
      1013.25, // pressure
      50   // humidity
    );

    const windResult = model.calculate_adjusted_yardage(
      targetYardage,
      SkillLevel.PROFESSIONAL,
      clubKey
    );

    // Calculate wind effect exactly as in wind-comparison page
    const windEffect = -(windResult.carry_distance - envResult.carry_distance);

    return {
      windEffect,
      lateralEffect: windResult.lateral_movement
    };
  } catch (error) {
    console.error('Error calculating model effect:', error);
    return null;
  }
}

// Calculate for both models
const results = {
  revised: calculateModelEffect(models.revised, 'driver'),
  legacy: calculateModelEffect(models.legacy, 'driver')
};

// Output results
console.log('\nWind Effect Results');
console.log('─'.repeat(40));
console.log(`Target Distance: ${targetYardage} yards`);
console.log(`Wind Speed: ${windSpeed} mph`);
console.log(`Wind Direction: ${windDirection}°`);
console.log('─'.repeat(40));

[
  { name: "Revised Model", result: results.revised },
  { name: "Legacy Model", result: results.legacy }
].forEach(({ name, result }) => {
  if (result) {
    console.log(`\n${name}:`);
    console.log(`Wind Effect: ${result.windEffect.toFixed(1)} yards`);
    console.log(`Lateral Movement: ${Math.abs(result.lateralEffect).toFixed(1)} yards ${result.lateralEffect > 0 ? 'right' : 'left'}`);
  }
});
