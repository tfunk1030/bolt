/*********************************
 *  1. Define Your Measured Data  *
 *********************************/
interface ClubData {
  name: string;
  carry: number;          // yards
  ball_speed: number;     // mph
  back_spin: number;      // rpm
  vla: number;            // Launch Angle (deg)
  descent_angle: number;  // Measured Descent Angle (deg)
  peak_height: number;    // Measured Apex (yards)
}

// Club data with calm air measurements (windSpeedMph: 0)
const CLUB_DATA: Record<string, ClubData> = {
  Driver: {
    name: "Driver",
    carry: 295.3,
    ball_speed: 171.8,
    back_spin: 2271.9,
    vla: 10.8,
    descent_angle: 37.8,
    peak_height: 36.0,
  },
  "6-iron": {
    name: "6-iron",
    carry: 192.0,
    ball_speed: 129.2,
    back_spin: 4881.1,
    vla: 15.9,
    descent_angle: 46.2,
    peak_height: 33.5,
  },
  "9-iron": {
    name: "9-iron",
    carry: 147.8,
    ball_speed: 109.5,
    back_spin: 8407.3,
    vla: 21.6,
    descent_angle: 49.6,
    peak_height: 31.5,
  },
  "pitching-wedge": {
    name: "pitching-wedge",
    carry: 134.9,
    ball_speed: 102.9,
    back_spin: 9109.3,
    vla: 24.3,
    descent_angle: 50.6,
    peak_height: 30.5,
  },
};

// Spin decay rates per club (fraction per second)
const CLUB_SPIN_DECAY: Record<string, number> = {
  "driver": 0.06,
  "3-wood": 0.07,
  "5-wood": 0.075,
  "4-iron": 0.08,
  "5-iron": 0.085,
  "6-iron": 0.09,
  "7-iron": 0.095,
  "8-iron": 0.10,
  "9-iron": 0.105,             // Increased from 0.10
  "pitching-wedge": 0.11,     // Increased from 0.10
  "gap-wedge": 0.13,
  "sand-wedge": 0.14,
  "lob-wedge": 0.15
};

// Utility function to get spin decay rate
function getSpinDecayRate(clubName: string): number {
  return CLUB_SPIN_DECAY[clubName.toLowerCase()] ?? 0.08; // Default to 8%/s if club not found
}

/*********************************
 *  2. Physics Constants & Utils *
 *********************************/
const G = 9.81;                // Acceleration due to gravity (m/s^2)
const BALL_MASS = 0.04593;     // Mass of golf ball (kg)
const BALL_RADIUS = 0.02135;   // Radius of golf ball (m) (~1.68 in diameter)
const AIR_DENSITY = 1.225;     // Air density at sea level (kg/m^3)
const BALL_AREA = Math.PI * BALL_RADIUS ** 2; // Cross-sectional area of golf ball (m^2)

/**
 * Converts yards to meters.
 * @param yards - Distance in yards
 * @returns Distance in meters
 */
function yardsToMeters(yards: number): number {
  return yards * 0.9144;
}

/**
 * Converts meters to yards.
 * @param m - Distance in meters
 * @returns Distance in yards
 */
function metersToYards(m: number): number {
  return m / 0.9144;
}

/**
 * Converts miles per hour to meters per second.
 * @param mph - Speed in mph
 * @returns Speed in m/s
 */
function mphToMps(mph: number): number {
  return mph * 0.44704;
}

/**
 * Converts RPM to radians per second.
 * @param rpm - Rotations per minute
 * @returns Radians per second
 */
function rpmToRadSec(rpm: number): number {
  return rpm * (2 * Math.PI) / 60;
}

/*******************************************
 *  2.1 The Main Time-Stepped Flight Model *
 *******************************************/
interface SimResult {
  carryDistance: number;  // yards (forward)
  sideDrift: number;      // yards (lateral)
  apex: number;           // yards
  descentAngle: number;   // degrees
  flightTime: number;     // seconds
}

interface SimOptions {
  /** Drag coefficient */
  Cd: number;
  /** Lift coefficient (for initial spin). Will be scaled if spin decays. */
  Cl: number;
  /** 
   * Wind speed in mph. 
   * Positive => Wind blowing in the +x direction (0° = headwind)
   */
  windSpeedMph?: number;
  /**
   * Wind direction in degrees.
   * 0° = Headwind, 90° = Crosswind from right, 180° = Tailwind, 270° = Crosswind from left
   */
  windDirectionDeg?: number;
  /**
   * Exponential spin decay rate in 1/sec.
   * e.g., 0.10 => spin decays ~10% per second.
   */
  spinDecayRate?: number;
  /**
   * Reference velocity (m/s) for scaling spin decay rate.
   */
  refVelocity?: number;
  /**
   * Maximum lift coefficient to prevent excessive lift.
   */
  maxCl?: number;
}

/**
 * Simulates the flight in 2D (including crosswinds and tailwinds).
 * @param ballSpeedMph   - Initial ball speed (mph)
 * @param launchAngleDeg - Launch angle (degrees)
 * @param initSpinRpm    - Initial backspin (rpm)
 * @param options        - Aerodynamic & environment parameters
 * @returns Simulation results including carry distance, side drift, apex, descent angle, and flight time
 */
function simulateFlight2D(
  ballSpeedMph: number,
  launchAngleDeg: number,
  initSpinRpm: number,
  options: SimOptions
): SimResult {
  const {
    Cd,
    Cl,
    windSpeedMph = 0,
    windDirectionDeg = 0,
    spinDecayRate = 0,
    refVelocity = 50,    // Reference velocity for scaling spin decay rate (m/s)
    maxCl = 0.35,        // Maximum lift coefficient
  } = options;

  // Convert units
  const speedMps = mphToMps(ballSpeedMph);
  const windMps = mphToMps(windSpeedMph);
  const launchAngleRad = (Math.PI / 180) * launchAngleDeg;
  const windDirectionRad = (Math.PI / 180) * windDirectionDeg;

  // Wind velocity components
  const windVx = windMps * Math.cos(windDirectionRad);
  const windVy = windMps * Math.sin(windDirectionRad);

  // Initial velocities
  let vx = speedMps * Math.cos(launchAngleRad);
  let vy = speedMps * Math.sin(launchAngleRad);

  // Initial spin in rad/s
  let spinRadSec = rpmToRadSec(initSpinRpm);
  const initialSpinRadSec = spinRadSec;

  // Initial positions
  let x = 0;
  let y = 0;
  let sideX = 0; // Lateral position (left/right)

  let apex = 0;
  let time = 0;
  const dt = 0.001; // Time step (seconds) - Reduced for higher precision

  // Initialize lateral velocity
  let sideVx = 0;

  while (true) {
    time += dt;

    // Relative velocity components
    const vxRel = vx - windVx; // Forward relative velocity
    const vyRel = vy;          // Vertical velocity relative to wind (assuming wind only affects lateral)
    const sideV_rel = sideVx - windVy; // Lateral relative velocity
    const vRelMag = Math.sqrt(vxRel ** 2 + vyRel ** 2 + sideV_rel ** 2);

    // Avoid division by zero
    if (vRelMag === 0) {
      break;
    }

    // Spin decay
    const scaledSpinDecayRate = (vRelMag / refVelocity) * spinDecayRate * 3; // 3x scaling factor
    spinRadSec *= Math.exp(-scaledSpinDecayRate * dt);
    if (spinRadSec < 0) spinRadSec = 0; // Safeguard

    // Scale Cl based on remaining spin
    const spinFraction = initialSpinRadSec > 0 ? (spinRadSec / initialSpinRadSec) : 1;
    let currentCl = Cl * spinFraction;
    currentCl = Math.min(currentCl, maxCl); // Cap Cl to prevent excessive lift

    // Drag force calculations
    const Fd_forward = 0.5 * AIR_DENSITY * Cd * BALL_AREA * (vxRel ** 2);
    const Fd_vertical = 0.5 * AIR_DENSITY * Cd * BALL_AREA * (vyRel ** 2);
    const Fd_lateral = 0.5 * AIR_DENSITY * Cd * BALL_AREA * (sideV_rel ** 2);

    // Drag acceleration components
    const a_drag_forward = -Fd_forward * (vxRel / vRelMag) / BALL_MASS;
    const a_drag_vertical = -Fd_vertical * (vyRel / vRelMag) / BALL_MASS;
    const a_drag_lateral = -Fd_lateral * (sideV_rel / vRelMag) / BALL_MASS;

    // Lift (Magnus) force calculation (purely vertical)
    const Fl = currentCl * 0.5 * AIR_DENSITY * BALL_AREA * (vRelMag ** 2);
    const a_lift = Fl / BALL_MASS; // m/s^2

    // Total accelerations
    const ax = a_drag_forward;
    const ay = a_drag_vertical + a_lift - G;
    const a_side = a_drag_lateral;

    // Update velocities
    vx += ax * dt;
    vy += ay * dt;
    sideVx += a_side * dt;

    // Update positions
    x += vx * dt;
    y += vy * dt;
    sideX += sideVx * dt;

    // Track apex
    if (y > apex) {
      apex = y;
    }

    // Terminate if the ball hits the ground
    if (y <= 0) {
      break;
    }

    // Safety cutoff to prevent infinite loops
    if (time > 20) {
      console.warn("Simulation terminated due to excessive flight time.");
      break;
    }
  }

  // Calculate final descent angle
  const finalAngleRad = Math.atan2(Math.abs(vy), Math.abs(vx));
  const descentAngleDeg = (180 / Math.PI) * finalAngleRad;

  return {
    carryDistance: metersToYards(x),
    sideDrift: metersToYards(sideX),
    apex: metersToYards(apex),
    descentAngle: descentAngleDeg,
    flightTime: time,
  };
}

/*******************************************************
 *  3. Calibrate (Cd, Cl) using measured calm-air data  *
 *******************************************************/
interface CalibrationData {
  bestCd: number;
  bestCl: number;
  error: number;
}

/**
 * Calibrates (C_D, C_L) for a given club to match measured calm-air data.
 * Implements a two-phase search (coarse and fine) with penalization for high C_L.
 * @param measured - The measured data for calibration
 * @param baseSpinDecayRate - The base spin decay rate for the club
 * @param refVelocity - Reference velocity for spin decay scaling (m/s)
 * @param maxCl - Maximum allowable lift coefficient
 * @returns The best-fit C_D and C_L along with the calibration error
 */
function calibrateClub(
  measured: ClubData,
  baseSpinDecayRate: number,
  refVelocity: number = 50,
  maxCl: number = 0.35
): CalibrationData {
  let bestCd = 0.25;
  let bestCl = 0.15; // Start with a reasonable Cl
  let bestError = Number.MAX_VALUE;
  
  // Phase 1: Coarse Search
  for (let cdTest = 0.15; cdTest <= 0.35; cdTest += 0.01) { // Coarse step
    for (let clTest = 0.10; clTest <= maxCl; clTest += 0.01) { // Coarse step
      const sim = simulateFlight2D(
        measured.ball_speed,
        measured.vla,
        measured.back_spin,
        {
          Cd: cdTest,
          Cl: clTest,
          windSpeedMph: 0, // Calm air
          windDirectionDeg: 0, // No wind direction
          spinDecayRate: baseSpinDecayRate,
          refVelocity: refVelocity,
          maxCl: maxCl,
        }
      );

      // Calculate total calibration error using absolute differences
      const carryErr   = Math.abs(sim.carryDistance - measured.carry);
      const apexErr    = Math.abs(sim.apex - measured.peak_height);
      const descentErr = Math.abs(sim.descentAngle - measured.descent_angle);
      const totalErr = carryErr + apexErr + descentErr;
      
      // Penalize Cl exceeding maxCl
      const clPenalty = clTest > maxCl ? (clTest - maxCl) * 10 : 0;
      const adjustedErr = totalErr + clPenalty;
      
      if (adjustedErr < bestError) {
        bestError = adjustedErr;
        bestCd = cdTest;
        bestCl = clTest;
      }
    }
  }

  // Phase 2: Fine Search around the best Cd and Cl found in coarse search
  const fineStep = 0.001;
  const searchRange = 0.005; // +/-0.005 around bestCd and bestCl

  for (let cdTest = bestCd - searchRange; cdTest <= bestCd + searchRange; cdTest += fineStep) {
    for (let clTest = bestCl - searchRange; clTest <= bestCl + searchRange; clTest += fineStep) {
      if (cdTest < 0.15 || cdTest > 0.35 || clTest < 0.10 || clTest > maxCl) continue; // Boundary Check
      
      const sim = simulateFlight2D(
        measured.ball_speed,
        measured.vla,
        measured.back_spin,
        {
          Cd: cdTest,
          Cl: clTest,
          windSpeedMph: 0, // Calm air
          windDirectionDeg: 0, // No wind direction
          spinDecayRate: baseSpinDecayRate,
          refVelocity: refVelocity,
          maxCl: maxCl,
        }
      );

      // Calculate total calibration error using absolute differences
      const carryErr   = Math.abs(sim.carryDistance - measured.carry);
      const apexErr    = Math.abs(sim.apex - measured.peak_height);
      const descentErr = Math.abs(sim.descentAngle - measured.descent_angle);
      const totalErr = carryErr + apexErr + descentErr;
      
      // Penalize Cl exceeding maxCl
      const clPenalty = clTest > maxCl ? (clTest - maxCl) * 10 : 0;
      const adjustedErr = totalErr + clPenalty;
      
      if (adjustedErr < bestError) {
        bestError = adjustedErr;
        bestCd = cdTest;
        bestCl = clTest;
      }
    }
  }

  return {
    bestCd,
    bestCl,
    error: bestError,
  };
}

/********************************************
 *  4. Gradient Descent Calibration Method  *
 ********************************************/
function gradientDescentCalibration(
  measured: ClubData,
  baseSpinDecayRate: number,
  refVelocity: number = 50,
  maxCl: number = 0.35,
  learningRate: number = 0.00005, // Reduced learning rate for stability
  iterations: number = 20000     // Increased iterations for better convergence
): CalibrationData {
  let Cd = 0.25;
  let Cl = 0.15; // Start with a reasonable Cl
  let bestError = Number.MAX_VALUE;

  for (let i = 0; i < iterations; i++) {
    // Use calm air data
    const windConditions = [{
      windSpeedMph: 0,
      windDirectionDeg: 0,
      carry: measured.carry,
      apex: measured.peak_height,
      descent_angle: measured.descent_angle,
    }];

    let totalErr = 0;

    windConditions.forEach((wind) => {
      const sim = simulateFlight2D(
        measured.ball_speed,
        measured.vla,
        measured.back_spin,
        {
          Cd: Cd,
          Cl: Cl,
          windSpeedMph: wind.windSpeedMph,
          windDirectionDeg: wind.windDirectionDeg,
          spinDecayRate: baseSpinDecayRate,
          refVelocity: refVelocity,
          maxCl: maxCl,
        }
      );

      // Calculate errors for each wind condition using absolute differences
      const carryErr   = Math.abs(sim.carryDistance - wind.carry);
      const apexErr    = Math.abs(sim.apex - wind.apex);
      const descentErr = Math.abs(sim.descentAngle - wind.descent_angle);
      const totalErrPerWind = carryErr + apexErr + descentErr;

      totalErr += totalErrPerWind;
    });

    if (Math.abs(totalErr) < Math.abs(bestError)) {
      bestError = totalErr;
    }

    // Numerical gradients using finite differences
    const delta = 0.0001;

    // Partial derivative w.r.t Cd
    let simCdPlusTotalErr = 0;
    windConditions.forEach((wind) => {
      const simCdPlus = simulateFlight2D(
        measured.ball_speed,
        measured.vla,
        measured.back_spin,
        {
          Cd: Cd + delta,
          Cl: Cl,
          windSpeedMph: wind.windSpeedMph,
          windDirectionDeg: wind.windDirectionDeg,
          spinDecayRate: baseSpinDecayRate,
          refVelocity: refVelocity,
          maxCl: maxCl,
        }
      );
      const carryErr   = Math.abs(simCdPlus.carryDistance - wind.carry);
      const apexErr    = Math.abs(simCdPlus.apex - wind.apex);
      const descentErr = Math.abs(simCdPlus.descentAngle - wind.descent_angle);
      simCdPlusTotalErr += carryErr + apexErr + descentErr;
    });
    const dCd = (simCdPlusTotalErr - totalErr) / delta;

    // Partial derivative w.r.t Cl
    let simClPlusTotalErr = 0;
    windConditions.forEach((wind) => {
      const simClPlus = simulateFlight2D(
        measured.ball_speed,
        measured.vla,
        measured.back_spin,
        {
          Cd: Cd,
          Cl: Cl + delta,
          windSpeedMph: wind.windSpeedMph,
          windDirectionDeg: wind.windDirectionDeg,
          spinDecayRate: baseSpinDecayRate,
          refVelocity: refVelocity,
          maxCl: maxCl,
        }
      );
      const carryErr   = Math.abs(simClPlus.carryDistance - wind.carry);
      const apexErr    = Math.abs(simClPlus.apex - wind.apex);
      const descentErr = Math.abs(simClPlus.descentAngle - wind.descent_angle);
      simClPlusTotalErr += carryErr + apexErr + descentErr;
    });
    const dCl = (simClPlusTotalErr - totalErr) / delta;

    // Update parameters using gradient descent
    Cd -= learningRate * dCd;
    Cl -= learningRate * dCl;

    // Clamp Cd and Cl within realistic bounds
    Cd = Math.max(0.15, Math.min(0.35, Cd));
    Cl = Math.max(0.10, Math.min(maxCl, Cl));

    // Early stopping if error is sufficiently low
    if (Math.abs(bestError) < 0.001) {
      break;
    }

    // Optional: Log progress every 1000 iterations
    if (i % 1000 === 0) {
      console.log(`Iteration ${i}: Cd=${Cd.toFixed(3)}, Cl=${Cl.toFixed(3)}, Error=${bestError.toFixed(3)}`);
    }
  }

  return {
    bestCd: Cd,
    bestCl: Cl,
    error: bestError,
  };
}

/********************************************
 *  5. Main Routine to Calibrate & Simulate *
 ********************************************/
function runAllCalibrations() {
  const clubNames = Object.keys(CLUB_DATA);
  
  clubNames.forEach((club) => {
    const measured = CLUB_DATA[club];
    
    // Determine calibration method based on club's backspin
    // High-spin clubs use Gradient Descent, others use Two-Phase Calibration
    const isHighSpin = measured.back_spin > 7000; // Threshold can be adjusted
    const baseDecay = getSpinDecayRate(measured.name);
    let calib: CalibrationData;
    
    if (isHighSpin) {
      // Use Gradient Descent Calibration for high-spin clubs
      calib = gradientDescentCalibration(measured, baseDecay);
    } else {
      // Use Two-Phase Calibration for other clubs
      calib = calibrateClub(measured, baseDecay);
    }

    console.log(`\n=== ${club} ===`);
    console.log(`Calibrated (Cd, Cl): (${calib.bestCd.toFixed(3)}, ${calib.bestCl.toFixed(3)})`);
    console.log(`Calibration Error Sum: ${calib.error.toFixed(3)}`);
  
    // Simulate flight under various wind conditions
    const winds = [
      { speed: 0, direction: 0 },    // Calm air
      { speed: 10, direction: 0 },   // 10 mph headwind
      { speed: 10, direction: 90 },  // 10 mph crosswind from right
      { speed: 10, direction: 180 }, // 10 mph tailwind
      { speed: 10, direction: 270 }, // 10 mph crosswind from left
      { speed: 20, direction: 0 },   // 20 mph headwind
      { speed: 20, direction: 90 },  // 20 mph crosswind from right
      { speed: 20, direction: 180 }, // 20 mph tailwind
      { speed: 20, direction: 270 }, // 20 mph crosswind from left
      // Add more wind conditions as needed
    ];
    
    winds.forEach((w) => {
      const sim = simulateFlight2D(
        measured.ball_speed,
        measured.vla,
        measured.back_spin,
        {
          Cd: calib.bestCd,
          Cl: calib.bestCl,
          windSpeedMph: w.speed,
          windDirectionDeg: w.direction,
          spinDecayRate: baseDecay,
          refVelocity: 50,
          maxCl: 0.35,
        }
      );
      console.log(
        `${w.speed} mph wind @ ${w.direction}° -> ` +
        `Carry: ${sim.carryDistance.toFixed(1)}yd, ` +
        `Side Drift: ${sim.sideDrift.toFixed(1)}yd, ` +
        `Apex: ${sim.apex.toFixed(1)}yd, ` +
        `Descent: ${sim.descentAngle.toFixed(1)}°, ` +
        `Time: ${sim.flightTime.toFixed(2)}s,` +
        ` Spin Decay Rate: ${baseDecay.toFixed(3)}`
      );
    });
  });
}

// Execute the calibration and simulation
runAllCalibrations();
