// Add new helper methods
private _calculate_wind_multiplier(wind_speed: number, is_headwind: boolean): number {
    // Both use quadratic scaling but with different coefficients
    if (is_headwind) {
      return 1 + 0.0025 * Math.pow(wind_speed, 2);  // Stronger headwind coefficient
    }
    return 1 + 0.0018 * Math.pow(wind_speed, 2);    // Slightly weaker tailwind coefficient
}
  
private _calculate_crosswind_multiplier(wind_speed: number): number {
    // Also quadratic but with reduced coefficient
    return 0.25 * (1 + 0.0015 * Math.pow(wind_speed, 2));
}
  
private _calculate_turbulence_factor(wind_speed: number): number {
    return 1 - (0.05 * wind_speed / 30);
}

private _calculate_wind_gradient(height_ft: number): number {
    if (height_ft <= 10) return 0.70;
    if (height_ft <= 50) return 0.85;
    if (height_ft <= 100) return 1.0;
    if (height_ft <= 150) return 1.15;
    return 1.25;
}
  
// Modify wind effect calculation
if (this.wind_speed !== null && this.wind_direction !== null) {
    const wind_rad = this.wind_direction * Math.PI / 180;
    const distance_factor = adjusted_yardage / 300;
    
    // Ball speed effect (faster balls are less affected by wind)
    const speed_factor = Math.sqrt(171 / (club_data.ball_speed * ball.speed_factor));
    const height_factor = club_data.max_height / 35;
    
    // Enhanced wind gradient calculation
    const wind_multiplier = this._calculate_wind_gradient(club_data.max_height * 3);
    const effective_wind = this.wind_speed * wind_multiplier * 
      this._calculate_turbulence_factor(this.wind_speed);
    
    // Head/tail wind with quadratic multiplier
    const is_headwind = Math.cos(wind_rad) > 0;
    const head_tail_mult = this._calculate_wind_multiplier(effective_wind, is_headwind);
    const head_tail_effect = effective_wind * Math.cos(wind_rad) * 
      distance_factor * speed_factor * head_tail_mult;
    
    // Crosswind with quadratic multiplier
    const cross_mult = this._calculate_crosswind_multiplier(effective_wind);
    const cross_wind_effect = effective_wind * Math.sin(wind_rad) * 
      distance_factor * speed_factor * cross_mult;
    
    // Enhanced spin factor calculation (more spin = more wind effect)
    const spin_factor = Math.pow((club_data.spin_rate * ball.spin_factor) / 2545, 1.2);
    const loft_factor = Math.sqrt(club_data.launch_angle / 10.4);
    
    // Apply effects
    adjusted_yardage -= head_tail_effect * height_factor;
    lateral_movement = cross_wind_effect * (1 + (spin_factor + loft_factor - 2) * 0.2);
}