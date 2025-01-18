export enum SkillLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
  PROFESSIONAL = 'professional',
}

interface ClubData {
  name: string;
  loft: number;
  normalYardage: number;
}

interface ShotResult {
  carry_distance: number;
  total_distance: number;
  launch_angle: number;
  spin_rate: number;
}

export class YardageModelEnhanced {
  private clubData: { [key: string]: ClubData } = {};
  private ballModel: string = 'tour_premium';
  private conditions = {
    temperature: 70, // °F
    altitude: 0,    // feet
    wind_speed: 0,  // mph
    wind_direction: 0, // degrees
    pressure: 29.92, // inHg
    humidity: 50,   // %
  };

  constructor() {
    this.initializeClubData();
  }

  private initializeClubData() {
    // Initialize with some default club data
    const defaultClubs = [
      { name: 'driver', loft: 10.5, normalYardage: 280 },
      { name: 'threewood', loft: 15, normalYardage: 240 },
      { name: 'fivewood', loft: 18, normalYardage: 220 },
      { name: 'threeiron', loft: 21, normalYardage: 200 },
      { name: 'fouriron', loft: 24, normalYardage: 190 },
      { name: 'fiveiron', loft: 27, normalYardage: 180 },
      { name: 'sixiron', loft: 30, normalYardage: 170 },
      { name: 'seveniron', loft: 34, normalYardage: 160 },
      { name: 'eightiron', loft: 38, normalYardage: 150 },
      { name: 'nineiron', loft: 42, normalYardage: 140 },
      { name: 'pitchingwedge', loft: 46, normalYardage: 130 },
      { name: 'gapwedge', loft: 50, normalYardage: 120 },
      { name: 'sandwedge', loft: 54, normalYardage: 110 },
      { name: 'lobwedge', loft: 58, normalYardage: 100 },
    ];

    defaultClubs.forEach(club => {
      this.clubData[club.name] = club;
    });
  }

  public getClubData(clubName: string): ClubData | null {
    return this.clubData[clubName] || null;
  }

  public set_ball_model(model: string) {
    this.ballModel = model;
  }

  public set_conditions(
    temperature: number,
    altitude: number,
    wind_speed: number,
    wind_direction: number,
    pressure: number,
    humidity: number
  ) {
    this.conditions = {
      temperature,
      altitude,
      wind_speed,
      wind_direction,
      pressure,
      humidity,
    };
  }

  public calculate_adjusted_yardage(
    targetYardage: number,
    skillLevel: SkillLevel,
    clubName: string
  ): ShotResult | null {
    const clubData = this.getClubData(clubName);
    if (!clubData) return null;

    // Calculate air density factor
    const airDensityFactor = this.calculateAirDensityFactor();
    
    // Calculate altitude adjustment
    const altitudeAdjustment = this.conditions.altitude / 1000 * 0.02;
    
    // Calculate temperature adjustment
    const tempAdjustment = (this.conditions.temperature - 70) * 0.001;
    
    // Calculate total adjustment
    const totalAdjustment = 1 + airDensityFactor + altitudeAdjustment + tempAdjustment;
    
    // Calculate carry distance
    const carryDistance = targetYardage * totalAdjustment;
    
    // Calculate other shot parameters based on club and conditions
    const launchAngle = this.calculateLaunchAngle(clubData.loft, skillLevel);
    const spinRate = this.calculateSpinRate(clubData.loft, skillLevel);
    
    return {
      carry_distance: carryDistance,
      total_distance: carryDistance * 1.05, // Assuming 5% roll
      launch_angle: launchAngle,
      spin_rate: spinRate,
    };
  }

  private calculateAirDensityFactor(): number {
    const standardPressure = 29.92; // inHg
    const standardTemp = 70; // °F
    
    const pressureFactor = (this.conditions.pressure - standardPressure) / standardPressure;
    const tempFactor = (this.conditions.temperature - standardTemp) / standardTemp;
    const humidityFactor = (this.conditions.humidity - 50) / 100 * 0.005;
    
    return -(pressureFactor - tempFactor + humidityFactor);
  }

  private calculateLaunchAngle(loft: number, skillLevel: SkillLevel): number {
    // Base launch angle is typically a few degrees less than the club's loft
    let baseAngle = loft * 0.85;
    
    // Adjust based on skill level
    switch (skillLevel) {
      case SkillLevel.BEGINNER:
        baseAngle *= 0.9;
        break;
      case SkillLevel.INTERMEDIATE:
        baseAngle *= 0.95;
        break;
      case SkillLevel.ADVANCED:
        baseAngle *= 1.0;
        break;
      case SkillLevel.PROFESSIONAL:
        baseAngle *= 1.05;
        break;
    }
    
    return baseAngle;
  }

  private calculateSpinRate(loft: number, skillLevel: SkillLevel): number {
    // Base spin rate increases with loft
    let baseSpinRate = 2000 + (loft * 50);
    
    // Adjust based on skill level
    switch (skillLevel) {
      case SkillLevel.BEGINNER:
        baseSpinRate *= 0.9;
        break;
      case SkillLevel.INTERMEDIATE:
        baseSpinRate *= 0.95;
        break;
      case SkillLevel.ADVANCED:
        baseSpinRate *= 1.0;
        break;
      case SkillLevel.PROFESSIONAL:
        baseSpinRate *= 1.05;
        break;
    }
    
    return baseSpinRate;
  }
}
