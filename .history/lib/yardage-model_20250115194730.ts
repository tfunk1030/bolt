import { type } from "os";

export enum SkillLevel {
  BEGINNER = "beginner",      // High HCP (17+)
  INTERMEDIATE = "intermediate",  // Mid HCP (9-16)
  ADVANCED = "advanced",      // Low HCP (0-8)
  PROFESSIONAL = "professional"  // Tour Pro
}

export interface ShotResult {
  carry_distance: number  // Adjusted carry distance in yards
  lateral_movement: number  // Lateral movement in yards (+ is right, - is left)
}

export interface BallModel {
  name: string
  compression: number
  speed_factor: number
  spin_factor: number
  temp_sensitivity: number
}

export interface ClubData {
  name: string
  ball_speed: number     // Ball speed in mph
  launch_angle: number   // Launch angle in degrees
  spin_rate: number      // Spin rate in rpm
  max_height: number     // Max height in yards
  land_angle: number     // Landing angle in degrees
  spin_decay: number     // Spin decay rate in % per second
}

export class YardageModelEnhanced {
  // PGA Tour average club data
  private static CLUB_DATABASE: Record<string, ClubData> = {
    "driver": { name: "Driver", ball_speed: 171, launch_angle: 10.4, spin_rate: 2545, max_height: 35, land_angle: 39, spin_decay: 0.08 },
    "3-wood": { name: "3-Wood", ball_speed: 162, launch_angle: 9.3, spin_rate: 3663, max_height: 32, land_angle: 44, spin_decay: 0.09 },
    "5-iron": { name: "5-Iron", ball_speed: 135, launch_angle: 11.9, spin_rate: 5280, max_height: 33, land_angle: 50, spin_decay: 0.11 },
    "7-iron": { name: "7-Iron", ball_speed: 123, launch_angle: 16.1, spin_rate: 7124, max_height: 34, land_angle: 51, spin_decay: 0.12 },
    "pitching-wedge": { name: "Pitching Wedge", ball_speed: 104, launch_angle: 23.7, spin_rate: 9316, max_height: 32, land_angle: 52, spin_decay: 0.15 }
  }

  // Altitude effects
  private static ALTITUDE_EFFECTS: Record<number, number> = {
    0: 1.000,
    1000: 1.021,
    2000: 1.043,
    3000: 1.065,
    4000: 1.088,
    5000: 1.112,
    6000: 1.137,
    7000: 1.163,
    8000: 1.190
  }

  // Ball Models
  private static BALL_MODELS: Record<string, BallModel> = {
    "tour_premium": {
      name: "Tour Premium",
      compression: 95,
      speed_factor: 1.00,
      spin_factor: 1.05,
      temp_sensitivity: 0.8
    },
    "distance": {
      name: "Distance",
      compression: 85,
      speed_factor: 1.01,
      spin_factor: 0.95,
      temp_sensitivity: 1.0
    },
    "mid_range": {
      name: "Mid Range",
      compression: 90,
      speed_factor: 0.98,
      spin_factor: 1.00,
      temp_sensitivity: 1.0
    },
    "two_piece": {
      name: "Two Piece",
      compression: 80,
      speed_factor: 0.96,
      spin_factor: 0.90,
      temp_sensitivity: 1.2
    }
  }

  // Spin decay rates
  private static SPIN_DECAY_RATES: Record<string, number> = {
    "driver": 0.08,
    "3-wood": 0.09,
    "5-iron": 0.11,
    "7-iron": 0.12,
    "pitching-wedge": 0.15
  }

  private temperature: number | null = null
  private altitude: number | null = null
  private wind_speed: number | null = null
  private wind_direction: number | null = null
  private ball_model: string = "mid_range"
  private pressure: number | null = null
  private humidity: number | null = null

  // Remove the old AIR_DENSITY_TABLE and replace with standard conditions
  private static STANDARD_CONDITIONS = {
    TEMPERATURE: 59, // °F (15°C)
    PRESSURE: 1013.25, // hPa
    DENSITY: 1.225, // kg/m³
    HUMIDITY: 50 // %
  }

  set_conditions(
    temperature: number,
    altitude: number,
    wind_speed: number,
    wind_direction: number,
    pressure?: number,
    humidity?: number
  ): void {
    this.temperature = temperature
    this.altitude = altitude
    this.wind_speed = wind_speed
    this.wind_direction = wind_direction
    this.pressure = pressure ?? null
    this.humidity = humidity ?? null
  }

  set_ball_model(model: string): void {
    if (!(model in YardageModelEnhanced.BALL_MODELS)) {
      throw new Error(`Unknown ball model: ${model}`)
    }
    this.ball_model = model
  }

  private _calculate_wind_gradient(height_ft: number): number {
    if (height_ft <= 10) return 0.75
    if (height_ft <= 50) return 0.85
    if (height_ft <= 100) return 1.0
    if (height_ft <= 150) return 1.15
    return 1.25
  }

  private _calculate_altitude_effect(altitude: number): number {
    const alts = Object.keys(YardageModelEnhanced.ALTITUDE_EFFECTS).map(Number).sort((a, b) => a - b)
    for (let i = 0; i < alts.length - 1; i++) {
      if (alts[i] <= altitude && altitude <= alts[i + 1]) {
        const alt1 = alts[i], alt2 = alts[i + 1]
        const effect1 = YardageModelEnhanced.ALTITUDE_EFFECTS[alt1]
        const effect2 = YardageModelEnhanced.ALTITUDE_EFFECTS[alt2]
        const ratio = (altitude - alt1) / (alt2 - alt1)
        return effect1 + (effect2 - effect1) * ratio
      }
    }
    return 1.0
  }

  private _calculate_air_density(temperature: number, pressure: number, humidity: number): number {
    // Convert temperature to Celsius
    const tempC = (temperature - 32) * 5/9;
    
    // Calculate vapor pressure using Magnus formula
    const a = 6.1121; // mb
    const b = 17.368;
    const c = 238.88; // °C
    const satVaporPressure = a * Math.exp((b * tempC) / (c + tempC));
    const vaporPressure = (humidity / 100) * satVaporPressure;
    
    // Convert pressure to Pascals and calculate dry air pressure
    const pressurePa = pressure * 100;
    const dryPressure = pressurePa - (vaporPressure * 100);
    
    // Gas constants
    const Rd = 287.05; // J/(kg·K) - Dry air
    const Rv = 461.495; // J/(kg·K) - Water vapor
    
    // Calculate air density using the ideal gas law with humidity correction
    const density = (dryPressure / (Rd * (tempC + 273.15))) + 
                   (vaporPressure * 100 / (Rv * (tempC + 273.15)));
    
    return density;
  }

  private _calculate_spin_decay(club: string, initial_spin: number, flight_time: number): number {
    const decay_rate = YardageModelEnhanced.SPIN_DECAY_RATES[club]
    return initial_spin * (1 - decay_rate * flight_time/2)
  }

  calculate_adjusted_yardage(target_yardage: number, skill_level: SkillLevel, club: string): ShotResult {
    const club_lower = club.toLowerCase()
    if (!(club_lower in YardageModelEnhanced.CLUB_DATABASE)) {
      throw new Error(`Unknown club: ${club}`)
    }

    const club_data = YardageModelEnhanced.CLUB_DATABASE[club_lower]
    const ball = YardageModelEnhanced.BALL_MODELS[this.ball_model]
    
    let adjusted_yardage = target_yardage
    
    // Apply ball speed effect
    adjusted_yardage *= ball.speed_factor
    
    // Calculate flight time
    const gravity = 32.2
    const initial_velocity_fps = club_data.ball_speed * 1.467 * ball.speed_factor
    const launch_rad = club_data.launch_angle * Math.PI / 180
    const flight_time = (2 * initial_velocity_fps * Math.sin(launch_rad)) / gravity
    
    // Temperature and density effects
    if (this.temperature !== null) {
      const currentDensity = this._calculate_air_density(
        this.temperature,
        this.pressure || YardageModelEnhanced.STANDARD_CONDITIONS.PRESSURE,
        this.humidity || YardageModelEnhanced.STANDARD_CONDITIONS.HUMIDITY
      );
      
      const densityRatio = currentDensity / YardageModelEnhanced.STANDARD_CONDITIONS.DENSITY;
      
      // Density effect on distance (approximately -1% per 1% increase in density)
      const densityEffect = (1 - densityRatio);
      
      // Temperature effect on ball compression
      const tempEffect = (this.temperature - YardageModelEnhanced.STANDARD_CONDITIONS.TEMPERATURE) * 0.0008;
      
      // Combined effect (weighted average)
      const combinedEffect = (2 * densityEffect + tempEffect) / 3;
      
      adjusted_yardage *= (1 + combinedEffect);
    }
    
    // Altitude effects
    if (this.altitude !== null) {
      const altitude_effect = this._calculate_altitude_effect(this.altitude)
      const initial_spin = club_data.spin_rate * ball.spin_factor
      const average_spin = this._calculate_spin_decay(club_lower, initial_spin, flight_time)
      adjusted_yardage *= altitude_effect
    }
    
    // Wind effects
    let lateral_movement = 0
    if (this.wind_speed !== null && this.wind_direction !== null) {
      const wind_rad = this.wind_direction * Math.PI / 180
      const distance_factor = adjusted_yardage / 300
      
      const speed_factor = Math.sqrt(171 / (club_data.ball_speed * ball.speed_factor))
      const height_factor = club_data.max_height / 35
      
      const wind_multiplier = this._calculate_wind_gradient(club_data.max_height * 3)
      const effective_wind = this.wind_speed * wind_multiplier
      
      // Head/tail wind
      let wind_factor = Math.cos(wind_rad)
      if (wind_factor > 0) wind_factor *= 1.5
      
      const head_tail_effect = effective_wind * wind_factor * distance_factor * speed_factor * 1.2
      const height_effect = Math.sqrt(club_data.max_height / 35)
      adjusted_yardage -= head_tail_effect * height_effect
      
      // Crosswind
      const cross_factor = Math.sin(wind_rad)
      const cross_wind_effect = effective_wind * cross_factor * 0.35
      const lateral_base = cross_wind_effect * distance_factor * speed_factor * 3.0
      
      const spin_factor = Math.sqrt((club_data.spin_rate * ball.spin_factor) / 2545)
      const loft_factor = Math.sqrt(club_data.launch_angle / 10.4)
      
      lateral_movement = lateral_base * (1 + (spin_factor + loft_factor - 2) * 0.2)
    }

    return {
      carry_distance: Math.round(adjusted_yardage * 10) / 10,
      lateral_movement: Math.round(lateral_movement * 10) / 10
    }
  }
}