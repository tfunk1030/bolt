import { normalizeClubName } from '@/lib/utils/club-mapping';

export enum SkillLevel {
  BEGINNER = "beginner",      
  INTERMEDIATE = "intermediate",  
  ADVANCED = "advanced",      
  PROFESSIONAL = "professional"  
}

export interface ShotResult {
  carry_distance: number;  
  lateral_movement: number;  
}

export interface BallModel {
  name: string;
  compression: number;
  speed_factor: number;
  spin_factor: number;
  temp_sensitivity: number;
  dimple_pattern: string;
}

export interface ClubData {
  name: string;
  ball_speed: number;     
  launch_angle: number;   
  spin_rate: number;      
  max_height: number;     
  land_angle: number;     
  spin_decay: number;     
  wind_sensitivity: number;
}

export class YardageModelEnhanced {
  // Physics constants
  private static readonly GRAVITY: number = 32.174;  // ft/s²
  private static readonly WIND_POWER_SCALE: number = 0.245;  // Refined value
  private static readonly TAILWIND_AMPLIFIER: number = 1.235; // Refined value
  private static readonly LATERAL_BASE_MULTIPLIER: number = 2.53; // Refined value
  private static readonly SPIN_GYRO_THRESHOLD: number = 5500; // RPM
  private static readonly SPIN_TRANSITION_ZONE: number = 300; // RPM width

  // Club database with refined wind sensitivity coefficients
  private static readonly CLUB_DATABASE: Readonly<Record<string, ClubData>> = {
    "driver": { name: "Driver", ball_speed: 172, launch_angle: 10.8, spin_rate: 2345, max_height: 36, land_angle: 39, spin_decay: 0.08, wind_sensitivity: 0.99 },
    "3-wood": { name: "3-Wood", ball_speed: 161, launch_angle: 10.5, spin_rate: 3443, max_height: 35, land_angle: 42, spin_decay: 0.09, wind_sensitivity: 0.99 },
    "3-iron": { name: "3-Iron", ball_speed: 146, launch_angle: 11.2, spin_rate: 3304, max_height: 30, land_angle: 39, spin_decay: 0.10, wind_sensitivity: 0.99 },
    "4-iron": { name: "4-Iron", ball_speed: 138, launch_angle: 12.7, spin_rate: 3992, max_height: 31.5, land_angle: 40, spin_decay: 0.105, wind_sensitivity: 0.99 },
    "5-iron": { name: "5-Iron", ball_speed: 134, launch_angle: 14.3, spin_rate: 4400, max_height: 32.5, land_angle: 42.6, spin_decay: 0.11, wind_sensitivity: 0.99 },
    "6-iron": { name: "6-Iron", ball_speed: 130, launch_angle: 16.0, spin_rate: 5004, max_height: 34.5, land_angle: 46, spin_decay: 0.115, wind_sensitivity: 1.0 },
    "7-iron": { name: "7-Iron", ball_speed: 124, launch_angle: 17.8, spin_rate: 6024, max_height: 34.3, land_angle: 48.2, spin_decay: 0.12, wind_sensitivity: 1.0 },
    "8-iron": { name: "8-Iron", ball_speed: 116, launch_angle: 20.0, spin_rate: 6778, max_height: 33.6, land_angle: 47.3, spin_decay: 0.13, wind_sensitivity: 1.0 },
    "9-iron": { name: "9-Iron", ball_speed: 112, launch_angle: 21.6, spin_rate: 7793, max_height: 33.1, land_angle: 49.6, spin_decay: 0.14, wind_sensitivity: 1.0 },
    "pitching-wedge": { name: "PW", ball_speed: 103, launch_angle: 24.3, spin_rate: 8316, max_height: 32.5, land_angle: 50.6, spin_decay: 0.15, wind_sensitivity: 1.0 },
    "gap-wedge": { name: "GW", ball_speed: 95, launch_angle: 26.5, spin_rate: 9670, max_height: 30.2, land_angle: 51.1, spin_decay: 0.155, wind_sensitivity: 1.0 },
    "sand-wedge": { name: "SW", ball_speed: 89, launch_angle: 28.3, spin_rate: 10800, max_height: 28, land_angle: 51.4, spin_decay: 0.16, wind_sensitivity: 1.0 },
    "lob-wedge": { name: "LW", ball_speed: 77, launch_angle: 33.1, spin_rate: 11000, max_height: 25, land_angle: 52, spin_decay: 0.165, wind_sensitivity: 1.0 }
  };

  // Maintain original altitude effects
  private static readonly ALTITUDE_EFFECTS: Readonly<Record<number, number>> = {
    0: 1.000,
    1000: 1.021,
    2000: 1.043,
    3000: 1.065,
    4000: 1.088,
    5000: 1.112,
    6000: 1.137,
    7000: 1.163,
    8000: 1.190
  };

  // Maintain original ball models
  private static readonly BALL_MODELS: Readonly<Record<string, BallModel>> = {
    "tour_premium": {
      name: "Tour Premium",
      compression: 95,
      speed_factor: 1.00,
      spin_factor: 1.05,
      temp_sensitivity: 0.8,
      dimple_pattern: "hexagonal"
    },
    "distance": {
      name: "Distance",
      compression: 85,
      speed_factor: 1.01,
      spin_factor: 0.95,
      temp_sensitivity: 1.0,
      dimple_pattern: "circular"
    },
    "mid_range": {
      name: "Mid Range",
      compression: 90,
      speed_factor: 0.98,
      spin_factor: 1.00,
      temp_sensitivity: 1.0,
      dimple_pattern: "circular"
    },
    "two_piece": {
      name: "Two Piece",
      compression: 80,
      speed_factor: 0.96,
      spin_factor: 0.90,
      temp_sensitivity: 1.2,
      dimple_pattern: "hexagonal"
    }
  };

  // Instance variables
  private temperature: number | null = null;
  private altitude: number | null = null;
  private wind_speed: number | null = null;
  private wind_direction: number | null = null;
  private ball_model: string = "mid_range";
  private pressure: number | null = null;
  private humidity: number | null = null;

  // Calculate air density based on temperature, pressure, and humidity
  private _calculate_air_density(temp_f: number, pressure_mb: number, humidity: number): number {
    const temp_c = (temp_f - 32) * 5/9;
    const pressure_pa = pressure_mb * 100;
    
    // Calculate saturation vapor pressure using Magnus formula
    const a = 6.1121;
    const b = 17.502;
    const c = 240.97;
    const sat_vapor_pressure = a * Math.exp((b * temp_c) / (c + temp_c));
    
    // Calculate actual vapor pressure
    const vapor_pressure = (humidity / 100) * sat_vapor_pressure;
    
    // Calculate dry air pressure (subtract vapor pressure)
    const dry_pressure = pressure_pa - vapor_pressure;
    
    // Gas constants
    const R_d = 287.058; // Specific gas constant for dry air
    const R_v = 461.495; // Specific gas constant for water vapor
    
    // Calculate air density using the combined gas law
    const temp_k = temp_c + 273.15;
    const density = (dry_pressure / (R_d * temp_k)) + (vapor_pressure / (R_v * temp_k));
    
    return density;
  }

  // Calculate altitude effect based on elevation
  private _calculate_altitude_effect(altitude_ft: number): number {
    const altitude_keys = Object.keys(YardageModelEnhanced.ALTITUDE_EFFECTS)
      .map(Number)
      .sort((a, b) => a - b);
    
    // Find the bracketing altitudes
    let lower_alt = altitude_keys[0];
    let upper_alt = altitude_keys[altitude_keys.length - 1];
    
    for (let i = 0; i < altitude_keys.length - 1; i++) {
      if (altitude_ft >= altitude_keys[i] && altitude_ft < altitude_keys[i + 1]) {
        lower_alt = altitude_keys[i];
        upper_alt = altitude_keys[i + 1];
        break;
      }
    }
    
    // Linear interpolation between altitude effects
    const lower_effect = YardageModelEnhanced.ALTITUDE_EFFECTS[lower_alt];
    const upper_effect = YardageModelEnhanced.ALTITUDE_EFFECTS[upper_alt];
    const alt_ratio = (altitude_ft - lower_alt) / (upper_alt - lower_alt);
    
    return lower_effect + (upper_effect - lower_effect) * alt_ratio;
  }

  // Enhanced wind gradient calculation using logarithmic profile
  private _calculate_wind_gradient(height_ft: number): number {
    const base_gradient = 0.70;
    const scale_factor = 0.22;
    const reference_height = 1;
    
    return base_gradient + (scale_factor * Math.log10(Math.max(height_ft, reference_height) / reference_height));
  }

  // Enhanced spin decay calculation with Magnus effect consideration
  private _calculate_spin_decay(spin_rate: number, flight_time: number, ball_speed: number): number {
    const decay_rate = 0.12; // Base decay rate
    const speed_factor = ball_speed / 123; // Normalized to typical driver speed
    
    return spin_rate * Math.exp(-decay_rate * flight_time * speed_factor);
  }

  // Advanced wind effects calculation
  private _calculate_wind_effects(
    yardage: number,
    club_data: ClubData,
    ball: BallModel,
    effective_wind: number,
    wind_rad: number
  ): { distance_effect: number; lateral_movement: number } {
    const distance_factor = Math.pow(yardage / 180, 0.7 * (1 - Math.max(0, yardage - 400) / 1000));
    const height_factor = Math.pow(club_data.max_height / 35, 3);
    const speed_factor = Math.sqrt(123 / (club_data.ball_speed * ball.speed_factor));

    // Head/tail wind component
    let wind_factor = Math.cos(wind_rad);
    const wind_normalized = effective_wind / 10;

    if (wind_factor > 0) {
      wind_factor *= YardageModelEnhanced.TAILWIND_AMPLIFIER * 
                     Math.pow(wind_normalized, YardageModelEnhanced.WIND_POWER_SCALE);
    } else {
      wind_factor *= Math.pow(Math.abs(wind_normalized), YardageModelEnhanced.WIND_POWER_SCALE);
    }

    const head_tail_effect = effective_wind * wind_factor * distance_factor * 
                            speed_factor * club_data.wind_sensitivity * height_factor;

    // Crosswind calculation with gyroscopic stability
    const cross_factor = Math.sin(wind_rad);
    const gyro_stability = Math.min(1, club_data.spin_rate / YardageModelEnhanced.SPIN_GYRO_THRESHOLD);
    const stability_factor = 0.7 + (0.3 * gyro_stability);

    // Modified lateral movement calculation with reduced coefficients
    const lateral_movement = cross_factor * effective_wind * distance_factor * 
                           speed_factor * club_data.wind_sensitivity * height_factor *
                           stability_factor * Math.pow(wind_normalized, 0.2) * 
                           (1 + ball.spin_factor * 5) * 0.1; // Reduced from 1.1 to 0.55

    return {
      distance_effect: head_tail_effect,
      lateral_movement: lateral_movement
    };
  }

  // Main calculation method
  calculate_adjusted_yardage(target_yardage: number, skill_level: SkillLevel, club: string): ShotResult {
    const normalizedClub = club.toLowerCase();
    const club_key = normalizeClubName(normalizedClub) || normalizedClub;

    if (!(club_key in YardageModelEnhanced.CLUB_DATABASE)) {
      throw new Error(`Unknown club: ${club}`);
    }

    const club_data = YardageModelEnhanced.CLUB_DATABASE[club_key];
    const ball = YardageModelEnhanced.BALL_MODELS[this.ball_model];
    
    let adjusted_yardage = target_yardage * ball.speed_factor;

    // Calculate flight parameters
    const initial_velocity_fps = club_data.ball_speed * 1.467 * ball.speed_factor;
    const launch_rad = club_data.launch_angle * Math.PI / 180;
    const flight_time = (2 * initial_velocity_fps * Math.sin(launch_rad)) / YardageModelEnhanced.GRAVITY;

    // Apply environmental effects
    if (this.temperature !== null) {
      const currentDensity = this._calculate_air_density(
        this.temperature,
        this.pressure ?? 1013.25,
        this.humidity ?? 50
      );
      const densityRatio = currentDensity / 1.193;
      const densityEffect = -(densityRatio - 1);
      const tempEffect = (this.temperature - 70) * 0.0015 * ball.temp_sensitivity;
      
      adjusted_yardage *= (1 + tempEffect) * (1 + densityEffect);
    }

    // Apply altitude effects
    if (this.altitude !== null) {
      const altitude_effect = this._calculate_altitude_effect(this.altitude);
      const initial_spin = club_data.spin_rate * ball.spin_factor;
      this._calculate_spin_decay(initial_spin, flight_time, club_data.ball_speed);
      adjusted_yardage *= altitude_effect;
    }

    // Calculate wind effects
    let lateral_movement = 0;
    if (this.wind_speed !== null && this.wind_direction !== null) {
      const wind_rad = this.wind_direction * Math.PI / 180;
      const wind_gradient = this._calculate_wind_gradient(club_data.max_height * 3);
      const effective_wind = this.wind_speed * wind_gradient;

      const wind_effects = this._calculate_wind_effects(
        adjusted_yardage,
        club_data,
        ball,
        effective_wind,
        wind_rad
      );

      adjusted_yardage -= wind_effects.distance_effect;
      lateral_movement = wind_effects.lateral_movement;
    }

    return {
      carry_distance: Math.round(adjusted_yardage * 10) / 10,
      lateral_movement: Math.round(lateral_movement * 10) / 10,
    };
  }

  // Set ball model
  set_ball_model(model: string): void {
    if (!(model in YardageModelEnhanced.BALL_MODELS)) {
      throw new Error(`Unknown ball model: ${model}`);
    }
    this.ball_model = model;
  }

  // Set environmental conditions
  set_conditions(
    temperature: number,
    altitude: number,
    wind_speed: number,
    wind_direction: number,
    pressure: number,
    humidity: number
  ): void {
    this.temperature = temperature;
    this.altitude = altitude;
    this.wind_speed = wind_speed;
    this.wind_direction = wind_direction;
    this.pressure = pressure;
    this.humidity = humidity;
  }
}
