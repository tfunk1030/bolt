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
  // Enhanced physics constants with O1 model refinements
  private static readonly GRAVITY: number = 32.174;  // ft/s²
  private static readonly WIND_POWER_SCALE: number = 0.245;  // O1 model refined value
  private static readonly TAILWIND_AMPLIFIER: number = 1.235; // O1 model refined value
  private static readonly LATERAL_BASE_MULTIPLIER: number = 2.53; // Refined value
  private static readonly SPIN_GYRO_THRESHOLD: number = 6000; // RPM threshold
  private static readonly SPIN_TRANSITION_ZONE: number = 300; // RPM transition width
  private static readonly AIR_DENSITY_SEA_LEVEL: number = 1.225; // kg/m³
  private static readonly REFERENCE_VELOCITY: number = 50; // m/s for spin decay

  // Club database with refined wind sensitivity coefficients
  private static readonly CLUB_DATABASE: Readonly<Record<string, ClubData>> = {
    "driver": { 
      name: "Driver", 
      ball_speed: 172, 
      launch_angle: 10.8, 
      spin_rate: 2345, 
      max_height: 40, 
      land_angle: 39, 
      spin_decay: 0.08, 
      wind_sensitivity: 1.0 
    },
    "3-wood": { 
      name: "3-Wood", 
      ball_speed: 161, 
      launch_angle: 10.5, 
      spin_rate: 3443, 
      max_height: 39.5, 
      land_angle: 42, 
      spin_decay: 0.09, 
      wind_sensitivity: 1.0 
    },
    "3-iron": { 
      name: "3-Iron", 
      ball_speed: 146, 
      launch_angle: 11.2, 
      spin_rate: 3704, 
      max_height: 35, 
      land_angle: 37, 
      spin_decay: 0.10, 
      wind_sensitivity: 1.0 
    },
    "4-iron": { 
      name: "4-Iron", 
      ball_speed: 138, 
      launch_angle: 12.7, 
      spin_rate: 3992, 
      max_height: 37, 
      land_angle: 40, 
      spin_decay: 0.105, 
      wind_sensitivity: 1.0 
    },
    "5-iron": { 
      name: "5-Iron", 
      ball_speed: 134, 
      launch_angle: 14.3, 
      spin_rate: 4400, 
      max_height: 38, 
      land_angle: 42.6, 
      spin_decay: 0.11, 
      wind_sensitivity: 1.0
    },
    "6-iron": { 
      name: "6-Iron", 
      ball_speed: 130, 
      launch_angle: 16.0, 
      spin_rate: 5004, 
      max_height: 36.5, 
      land_angle: 46, 
      spin_decay: 0.115, 
      wind_sensitivity: 1.0 
    },
    "7-iron": { 
      name: "7-Iron", 
      ball_speed: 124, 
      launch_angle: 17.8, 
      spin_rate: 6024, 
      max_height: 35, 
      land_angle: 48.2, 
      spin_decay: 0.12, 
      wind_sensitivity: 1.0 
    },
    "8-iron": { 
      name: "8-Iron", 
      ball_speed: 116, 
      launch_angle: 20.0, 
      spin_rate: 6778, 
      max_height: 33.5, 
      land_angle: 47.3, 
      spin_decay: 0.13, 
      wind_sensitivity: 1.0 
    },
    "9-iron": { 
      name: "9-Iron", 
      ball_speed: 112, 
      launch_angle: 21.6, 
      spin_rate: 7793, 
      max_height: 32.5, 
      land_angle: 49.6, 
      spin_decay: 0.14, 
      wind_sensitivity: 1.0 
    },
    "pitching-wedge": { 
      name: "PW", 
      ball_speed: 103, 
      launch_angle: 24.3, 
      spin_rate: 8316, 
      max_height: 31.5, 
      land_angle: 50.6, 
      spin_decay: 0.15, 
      wind_sensitivity: 1.0 
    },
    "gap-wedge": { 
      name: "GW", 
      ball_speed: 95, 
      launch_angle: 26.5, 
      spin_rate: 9670, 
      max_height: 29.5, 
      land_angle: 51.1, 
      spin_decay: 0.155, 
      wind_sensitivity: 1.0 
    },
    "sand-wedge": { 
      name: "SW", 
      ball_speed: 89, 
      launch_angle: 25.3, 
      spin_rate: 10800, 
      max_height: 28, 
      land_angle: 51.4, 
      spin_decay: 0.16, 
      wind_sensitivity: 1.0 
    },
    "lob-wedge": { 
      name: "LW", 
      ball_speed: 77, 
      launch_angle: 33.1, 
      spin_rate: 11000, 
      max_height: 22, 
      land_angle: 52, 
      spin_decay: 0.165, 
      wind_sensitivity: 1.0 
    }
  };

  // Enhanced altitude effects based on O1 model calculations
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

  // Ball models remain unchanged
  private static readonly BALL_MODELS: Readonly<Record<string, BallModel>> = {
    "tour_premium": {
      name: "Tour Premium",
      compression: 95,
      speed_factor: 1.00,
      spin_factor: 1.05,
      temp_sensitivity: 0.8,
      dimple_pattern: "hexagonal"
    },
    // ... [Previous ball models remain unchanged]
  };

  // Instance variables
  private temperature: number | null = null;
  private altitude: number | null = null;
  private wind_speed: number | null = null;
  private wind_direction: number | null = null;
  private ball_model: string = "mid_range";
  private pressure: number | null = null;
  private humidity: number | null = null;

  // Enhanced wind gradient calculation with O1 model's logarithmic profile
  private _calculate_wind_gradient(height_ft: number): number {
    if (height_ft < 0) {
      throw new Error('Height cannot be negative');
    }
    
    const base_gradient = 1.1;
    const scale_factor = 0.14;
    const reference_height = 32;
    
    return base_gradient + (scale_factor * Math.log10(
      Math.max(height_ft, reference_height) / reference_height
    ));
  }

  // Enhanced wind effects calculation incorporating O1 model physics
  private _calculate_wind_effects(
    yardage: number,
    club_data: ClubData,
    ball: BallModel,
    effective_wind: number,
    wind_rad: number,
    flight_time: number
  ): { distance_effect: number; lateral_movement: number } {
    // Enhanced distance factor with yardage-dependent scaling
    const distance_factor = Math.pow(
      yardage / 200,
      0.7 * (1 - Math.max(0, yardage - 400) / 1000)
    );
    
    // Improved height consideration
    const height_factor = Math.pow(club_data.max_height / 40, 3);
    
    // Ball speed normalization
    const speed_factor = Math.sqrt(123 / (club_data.ball_speed * ball.speed_factor));

    // Spin-based stability calculation for both head/tail and crosswind
    const gyro_stability = Math.min(1, club_data.spin_rate / YardageModelEnhanced.SPIN_GYRO_THRESHOLD);
    // Higher spin = more wind effect (0.85 to 1.2)
    const stability_factor = 0.7 + (0.42 * gyro_stability);

    // This means:
    // Driver (~2345 RPM):
    // gyro_stability = 2345/7000 = 0.335
    // stability_factor = 0.85 + (0.35 * 0.335) = 0.967 (about 97% wind effect)
    
    // 7-iron (~6024 RPM):
    // gyro_stability = 6024/7000 = 0.86
    // stability_factor = 0.85 + (0.35 * 0.86) = 1.151 (about 115% wind effect)
    
    // Lob wedge (~11000 RPM):
    // gyro_stability = 1.0 (capped)
    // stability_factor = 0.85 + (0.35 * 1.0) = 1.2 (120% wind effect)

    // Head/tail wind calculations with advanced factors
    const HEADTAIL_CALIBRATION = 0.15;
    let wind_factor = Math.cos(wind_rad);
    const wind_normalized = effective_wind / 1;

    if (wind_factor > 0) {
      // Tailwind: Less affected by spin
      const spin_lift_factor = 1.0 + (gyro_stability * 0.4);
      wind_factor *= YardageModelEnhanced.TAILWIND_AMPLIFIER *
        Math.pow(Math.abs(wind_normalized), YardageModelEnhanced.WIND_POWER_SCALE + 0.2) *
        Math.pow(flight_time / 2.0, 0.37) *
        spin_lift_factor * //
        HEADTAIL_CALIBRATION * 1.33;
    } else {
      // Headwind: More affected by spin due to increased lift
      const spin_lift_factor = 1.0 + (gyro_stability * 0.4); // Additional lift effect
      wind_factor *= Math.pow(Math.abs(wind_normalized), YardageModelEnhanced.WIND_POWER_SCALE) *
        Math.pow(flight_time / 2.0, 0.25) *
        spin_lift_factor * // Apply extra lift from spin
        HEADTAIL_CALIBRATION;
    }

    // Apply stability_factor to final head/tail effect
    const head_tail_effect = effective_wind *
      wind_factor *
      distance_factor *
      speed_factor *
      club_data.wind_sensitivity *
      height_factor *
      stability_factor; // Apply base stability factor here

    // Crosswind calculations (existing logic)
    const CROSSWIND_CALIBRATION = 0.08;
    const cross_factor = Math.sin(wind_rad);
    
    const lateral_movement = cross_factor *
      effective_wind *
      flight_time *
      distance_factor *
      speed_factor *
      club_data.wind_sensitivity *
      height_factor *
      stability_factor *
      CROSSWIND_CALIBRATION *
      Math.pow(Math.abs(wind_normalized), 0.15) *
      (1 + ball.spin_factor * 0.05) *
      YardageModelEnhanced.LATERAL_BASE_MULTIPLIER;

    return {
      distance_effect: head_tail_effect,
      lateral_movement,
    };
  }

  // Enhanced air density calculation with humidity consideration
  private _calculate_air_density(temp_f: number, pressure_mb: number, humidity: number): number {
    const temp_c = (temp_f - 32) * 5/9;
    const pressure_pa = pressure_mb * 100;
    
    // Calculate saturation vapor pressure using Magnus formula
    const a = 6.1121;
    const b = 17.502;
    const c = 240.97;
    const sat_vapor_pressure = a * Math.exp((b * temp_c) / (c + temp_c));
    
    const vapor_pressure = (humidity / 100) * sat_vapor_pressure;
    const dry_pressure = pressure_pa - vapor_pressure;
    
    // Gas constants
    const R_d = 287.058;
    const R_v = 461.495;
    
    const temp_k = temp_c + 273.15;
    return (dry_pressure / (R_d * temp_k)) + (vapor_pressure / (R_v * temp_k));
  }

  // Enhanced altitude effect calculation
  private _calculate_altitude_effect(altitude_ft: number): number {
    const altitude_keys = Object.keys(YardageModelEnhanced.ALTITUDE_EFFECTS)
      .map(Number)
      .sort((a, b) => a - b);
    
    let lower_alt = altitude_keys[0];
    let upper_alt = altitude_keys[altitude_keys.length - 1];
    
    for (let i = 0; i < altitude_keys.length - 1; i++) {
      if (altitude_ft >= altitude_keys[i] && altitude_ft < altitude_keys[i + 1]) {
        lower_alt = altitude_keys[i];
        upper_alt = altitude_keys[i + 1];
        break;
      }
    }
    
    const lower_effect = YardageModelEnhanced.ALTITUDE_EFFECTS[lower_alt];
    const upper_effect = YardageModelEnhanced.ALTITUDE_EFFECTS[upper_alt];
    const alt_ratio = (altitude_ft - lower_alt) / (upper_alt - lower_alt);
    
    return lower_effect + (upper_effect - lower_effect) * alt_ratio;
  }

  // Enhanced spin decay calculation with velocity consideration
  private _calculate_spin_decay(spin_rate: number, flight_time: number, ball_speed: number): number {
    const decay_rate = 0.12;
    const speed_factor = ball_speed / 123;
    return spin_rate * Math.exp(-decay_rate * flight_time * speed_factor);
  }

  // Input validation for wind parameters
  private _validate_wind_inputs(wind_speed: number | null, wind_direction: number | null): void {
    if (wind_speed !== null) {
      if (wind_speed < 0) {
        throw new Error('Wind speed cannot be negative');
      }
      if (wind_speed > 50) {
        throw new Error('Wind speed exceeds maximum supported value (50 mph)');
      }
    }
    if (wind_direction !== null) {
      if (wind_direction < 0 || wind_direction >= 360) {
        throw new Error('Wind direction must be between 0 and 359 degrees');
      }
    }
  }

  // Main calculation method - maintains existing API
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
      const densityRatio = currentDensity / YardageModelEnhanced.AIR_DENSITY_SEA_LEVEL;
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

    // Calculate wind effects with enhanced model
    let lateral_movement = 0;
    if (this.wind_speed !== null && this.wind_direction !== null) {
      this._validate_wind_inputs(this.wind_speed, this.wind_direction);
      
      const wind_rad = this.wind_direction * Math.PI / 180;
      const wind_gradient = this._calculate_wind_gradient(club_data.max_height * 3);
      const effective_wind = this.wind_speed * wind_gradient;

      const wind_effects = this._calculate_wind_effects(
        adjusted_yardage,
        club_data,
        ball,
        effective_wind,
        wind_rad,
        flight_time
      );

      adjusted_yardage -= wind_effects.distance_effect;
      lateral_movement = wind_effects.lateral_movement;
    }

    return {
      carry_distance: Math.round(adjusted_yardage * 10) / 10,
      lateral_movement: Math.round(lateral_movement * 10) / 10,
    };
  }

  // Existing setter methods remain unchanged
  set_ball_model(model: string): void {
    if (!(model in YardageModelEnhanced.BALL_MODELS)) {
      throw new Error(`Unknown ball model: ${model}`);
    }
    this.ball_model = model;
  }

  set_conditions(
    temperature: number,
    altitude: number,
    wind_speed: number,
    wind_direction: number,
    pressure: number,
    humidity: number
  ): void {
    this._validate_wind_inputs(wind_speed, wind_direction);
    
    this.temperature = temperature;
    this.altitude = altitude;
    this.wind_speed = wind_speed;
    this.wind_direction = wind_direction;
    this.pressure = pressure;
    this.humidity = humidity;
  }
}