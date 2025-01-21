/*********************************
 *  1. Define Your Measured Data  *
 *********************************/
interface ClubData {
    name: any;
    carry: number;
    ball_speed: number;
    back_spin: number;
    vla: number;           // launch angle (deg)
    descent_angle: number; // measured descent angle (deg)
    peak_height: number;   // measured apex (yards)
  }
  
  // Example subset from your table
  const CLUB_DATA: Record<string, ClubData> = {
    Driver: {
        carry: 295.3,
        ball_speed: 171.8,
        back_spin: 2271.9,
        vla: 10.8,
        descent_angle: 37.8,
        peak_height: 36.0,
        name: "Driver"
    },
    "6-iron": {
      carry: 192.0,
      ball_speed: 129.2,
      back_spin: 4881.1,
      vla: 15.9,
      name: "6-iron",
      descent_angle: 46.2,
      peak_height: 34.5
    },
    "9-iron": {
      carry: 147.8,
      ball_speed: 109.5,
      back_spin: 7407.3,
      vla: 21.6,
      name: "9-iron",
      descent_angle: 49.6,
      peak_height: 32.9
    },
    "pitching-wedge": {
      carry: 134.9,
      ball_speed: 102.9,
      back_spin: 8109.3,
      vla: 24.3,
      name: "pitching-wedge",
      descent_angle: 50.6,
      peak_height: 32.5
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
    "9-iron": 0.11,
    "pitching-wedge": 0.12,
    "gap-wedge": 0.13,
    "sand-wedge": 0.14,
    "lob-wedge": 0.15
  };
  
  // Usage example in simulation
  function getSpinDecayRate(clubName: string): number {
    return CLUB_SPIN_DECAY[clubName.toLowerCase()] ?? 0.08; // default to 8%/s if club not found
  }
  
  /*********************************
   *  2. Physics Constants & Utils *
   *********************************/
  const G = 9.81;                // m/s^2
  const BALL_MASS = 0.04593;     // kg  (standard golf ball ~45.93g)
  const BALL_RADIUS = 0.02135;   // m   (~1.68 in diameter)
  const AIR_DENSITY = 1.225;     // kg/m^3 (sea level)
  const BALL_AREA = Math.PI * BALL_RADIUS * BALL_RADIUS;
  
  function yardsToMeters(yards: number): number {
    return yards * 0.9144;
  }
  
  function metersToYards(m: number): number {
    return m / 0.9144;
  }
  
  function mphToMps(mph: number): number {
    return mph * 0.44704;
  }
  
  /*******************************************
   *  2.1 The Main Time-Stepped Flight Model *
   *******************************************/
  interface SimResult {
    carryDistance: number;  // yards
    apex: number;           // yards
    descentAngle: number;   // degrees
    flightTime: number;     // seconds
  }
  
  interface SimOptions {
    /** Drag coefficient */
    Cd: number;
    /** Lift coefficient (for initial spin). We'll scale it if spin decays. */
    Cl: number;
    /** 
     * Wind speed in mph. 
     * Positive => HEADWIND if ball travels in +x 
     * (We add wind to vxRel) 
     */
    windSpeedMph?: number;
    /**
     * Exponential spin decay rate in 1/sec.
     * e.g., 0.10 => spin decays ~10% per second.
     */
    spinDecayRate?: number;
  }
  
  /**
   * Simulates the flight in 2D (no sidespin).
   * @param ballSpeedMph   - initial ball speed (mph)
   * @param launchAngleDeg - launch angle (degrees)
   * @param initSpinRpm    - initial backspin (rpm)
   * @param options        - aerodynamic & environment parameters
   */
  function simulateFlight2D(
    ballSpeedMph: number,
    launchAngleDeg: number,
    initSpinRpm: number,
    options: SimOptions
  ): SimResult {
    // Destructure with defaults
    const {
      Cd,
      Cl,
      windSpeedMph = 0,
      spinDecayRate = 0,
    } = options;
  
    // 1) Convert units
    const speedMps = mphToMps(ballSpeedMph);
    const windMps  = mphToMps(windSpeedMph);
    const launchAngle = (Math.PI / 180) * launchAngleDeg;
    
    // 2) Initial velocities
    let vx = speedMps * Math.cos(launchAngle);
    let vy = speedMps * Math.sin(launchAngle);
    
    // 3) Spin in rad/s
    let spinRadSec = initSpinRpm * (2 * Math.PI / 60);
    const spinRadSec0 = spinRadSec; // store initial spin for scaling Cl
    
    // 4) Positions
    let x = 0;
    let y = 0;
    
    let apex = 0; 
    let time = 0;
    const dt = 0.005;
  
    while (true) {
      time += dt;
  
      // Exponential Spin Decay
      if (spinDecayRate > 0 && spinRadSec > 0) {
        // spin(t+dt) = spin(t) * e^(-k * dt)
        spinRadSec *= Math.exp(-spinDecayRate * dt);
        if (spinRadSec < 0) spinRadSec = 0; // just a safeguard
      }
  
      // Relative velocity: if wind > 0 => headwind => add to vx
      const vxRel = vx + windMps;
      const vyRel = vy;
      const vRelMag = Math.sqrt(vxRel * vxRel + vyRel * vyRel);
  
      // Scale Cl by fraction of spin left
      const spinFrac = spinRadSec0 > 0 ? (spinRadSec / spinRadSec0) : 1;
      const currentCl = Cl * spinFrac;
  
      // Drag force
      const Fd = 0.5 * AIR_DENSITY * Cd * BALL_AREA * (vRelMag ** 2);
      // direction: opposite to velocity
      const Fdx = -Fd * (vxRel / vRelMag);
      const Fdy = -Fd * (vyRel / vRelMag);
      
      // Lift (Magnus) force
      const Fl = 0.5 * AIR_DENSITY * currentCl * BALL_AREA * (vRelMag ** 2);
      // direction: perpendicular to velocity, "up" in 2D
      const Flx = Fl * (-vyRel / vRelMag);
      const Fly = Fl * ( vxRel / vRelMag);
  
      // Net forces
      const Fx = Fdx + Flx;
      const Fy = Fdy + Fly - (BALL_MASS * G);
  
      // Accelerations
      const ax = Fx / BALL_MASS;
      const ay = Fy / BALL_MASS;
  
      // Update velocity & position
      vx += ax * dt;
      vy += ay * dt;
      x  += vx * dt;
      y  += vy * dt;
  
      if (y > apex) apex = y;
      if (y <= 0) {
        break;
      }
      if (time > 20) {
        // safety cutoff
        break;
      }
    }
  
    // final descent angle
    const finalAngleRad = Math.atan2(Math.abs(vy), Math.abs(vx));
    const descentAngleDeg = (180 / Math.PI) * finalAngleRad;
  
    return {
      carryDistance: metersToYards(x),
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
   * We do a small brute-force search over Cd, Cl to find 
   * the pair that best matches measured carry, apex, and 
   * descent angle for calm air. SpinDecay = 0 in calibration.
   */
  function calibrateClub(measured: ClubData): CalibrationData {
    let bestCd = 0.25;
    let bestCl = 0.1;
    let bestError = Number.MAX_VALUE;
    
    for (let cdTest = 0.15; cdTest <= 0.5; cdTest += 0.001) {
      for (let clTest = 0.05; clTest <= 0.6; clTest += 0.001) {
        const kDecay = CLUB_SPIN_DECAY[measured.name.toLowerCase()] ?? 0.08;
        // run simulation with NO wind, NO spin decay
        const sim = simulateFlight2D(
          measured.ball_speed,
          measured.vla,
          measured.back_spin,
          {
            Cd: cdTest,
            Cl: clTest,
            windSpeedMph: 0,
            spinDecayRate: kDecay, 
          }
        );
  
        // Weighted sum of absolute differences
        const carryErr   = Math.abs(sim.carryDistance - measured.carry);
        const apexErr    = Math.abs(sim.apex - measured.peak_height);
        const descentErr = Math.abs(sim.descentAngle - measured.descent_angle);
        const totalErr = carryErr + apexErr + descentErr;
        
        if (totalErr < bestError) {
          bestError = totalErr;
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
   *  4. Main Routine to Calibrate & Compare  *
   ********************************************/
  function runAllCalibrations() {
    const clubNames = Object.keys(CLUB_DATA);
    
    clubNames.forEach((club) => {
      const measured = CLUB_DATA[club];
      
      // A) Calibrate to find best-fit Cd, Cl (calm air, spinDecay=0)
      const calib = calibrateClub(measured);
  
      console.log(`\n=== ${club} ===`);
      console.log(`Calibrated (Cd, Cl): (${calib.bestCd.toFixed(3)}, ${calib.bestCl.toFixed(3)})`);
      console.log(`Calibration Error Sum: ${calib.error.toFixed(3)}`);
  
      // B) Show results at 0 mph, 10 mph, 20 mph "headwind" 
      //    with an example spinDecay (0.10).
      const winds = [0, 10, 20];
      winds.forEach((w) => {
        const kDecay = CLUB_SPIN_DECAY[measured.name.toLowerCase()] ?? 0.08;
        const sim = simulateFlight2D(
          measured.ball_speed,
          measured.vla,
          measured.back_spin,
          {
            Cd: calib.bestCd,
            Cl: calib.bestCl,
            windSpeedMph: w,
            spinDecayRate: kDecay, // example 10% spin decay
          }
        );
        console.log(
          `${w} mph headwind -> ` +
          `Carry: ${sim.carryDistance.toFixed(1)}yd, ` +
          `Apex: ${sim.apex.toFixed(1)}yd, ` +
          `Descent: ${sim.descentAngle.toFixed(1)}°, ` +
          `Time: ${sim.flightTime.toFixed(2)}s`
        );
      });
    });
  }
  
  // Let's pretend to run it
  runAllCalibrations();
  