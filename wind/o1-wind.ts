import { ClubData } from "./club-types"; // Example interface for your club data

interface NonLinearWindInput {
  baseDistance: number;
  windSpeed: number;
  windDirectionDeg: number;
  clubData: ClubData;        // Ball speed, spin rate, launch angle, etc.
  ballSpinFactor: number;    // Additional spin multiplier (e.g., ball model)
  shotHeight?: number;       // Optional override if you have a known apex height
}

interface NonLinearWindResult {
  adjustedDistance: number;
  lateralMovement: number;
}

export function calculateNonLinearShot(input: NonLinearWindInput): NonLinearWindResult {
  const { 
    baseDistance, 
    windSpeed, 
    windDirectionDeg, 
    clubData, 
    ballSpinFactor,
    shotHeight 
  } = input;

  // Calculate a baseline shot height if one isn’t provided
  const finalShotHeight = shotHeight ?? clubData.max_height; 

  // Convert degrees to radians
  const windRad = (windDirectionDeg * Math.PI) / 180;

  // Decompose wind
  const headTailFactor = Math.cos(windRad); // <0 => headwind, >0 => tailwind
  const crossFactor = Math.sin(windRad);

  // Mild exponent for tailwind vs. bigger exponent for headwind
  const exponentHead = 1.2;
  const exponentTail = 1.1;
  const baseHeadScalar = 1.0;   // Headwinds hurt more
  const baseTailScalar = 0.7;   // Tailwinds help less

  // Additional wind multiplier for shot height (simple example)
  const heightMultiplier = finalShotHeight > 35 ? 1.2 : 1.0;

  // Compute head/tail distance change
  let distanceAdjustment = 0;
  if (headTailFactor < 0) {
    // Headwind
    const headwindValue = Math.abs(headTailFactor) * Math.pow(windSpeed, exponentHead);
    distanceAdjustment = -1 * headwindValue * baseHeadScalar * heightMultiplier;
  } else {
    // Tailwind
    const tailwindValue = headTailFactor * Math.pow(windSpeed, exponentTail);
    distanceAdjustment = tailwindValue * baseTailScalar * heightMultiplier;
  }

  // Adjust for club speed (faster ball speed => less wind effect)
  const speedFactorThreshold = 160; 
  const speedAdjustmentFactor = clubData.ball_speed >= speedFactorThreshold ? 0.85 : 1.0;
  distanceAdjustment *= speedAdjustmentFactor;

  // Crosswind calculation (less exponent to avoid over-amplification)
  const exponentCross = 1.05;
  const crossWindVal = Math.pow(windSpeed, exponentCross) * crossFactor;

  // Simple crosswind scalar from advanced references
  const crossBaseScalar = 0.35;
  
  // Factor in spin for lateral movement
  const nominalSpin = clubData.spin_rate * ballSpinFactor;
  // Higher spin => more side deflection
  const spinAdjustment = Math.min(Math.max(nominalSpin / 3000, 0.5), 2.0);

  const lateralMovement = crossWindVal * crossBaseScalar * spinAdjustment * heightMultiplier;

  return {
    adjustedDistance: baseDistance + distanceAdjustment,
    lateralMovement
  };
}


