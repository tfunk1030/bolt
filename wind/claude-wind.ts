// Add these new helper methods
private _calculate_wind_multiplier(wind_speed: number, is_headwind: boolean): number {
    // Both head and tail winds should be non-linear but with different strengths
    if (is_headwind) {
      return 1 + 0.0025 * Math.pow(wind_speed, 1.2);  // Stronger headwind effect
    }
    return 1 + 0.0018 * Math.pow(wind_speed, 1.1);    // Weaker but still non-linear tailwind
}

private _calculate_turbulence(wind_speed: number): number {
    return 1 - (0.05 * wind_speed / 30);  // Reduces effect at higher speeds
}

// Replace the wind effects section
if (this.wind_speed !== null && this.wind_direction !== null) {
    const wind_rad = this.wind_direction * Math.PI / 180
    const distance_factor = adjusted_yardage / 300
    
    // Ball speed effect (maintained from original)
    const speed_factor = Math.sqrt(171 / (club_data.ball_speed * ball.speed_factor))
    
    // Enhanced wind gradient calculation
    const wind_multiplier = this._calculate_wind_gradient(club_data.max_height * 3)
    const turbulence = this._calculate_turbulence(this.wind_speed)
    const effective_wind = this.wind_speed * wind_multiplier * turbulence
    
    // Non-linear head/tail wind
    const wind_factor = Math.cos(wind_rad)
    const is_headwind = wind_factor > 0
    const wind_multiplier_factor = this._calculate_wind_multiplier(effective_wind, is_headwind)
    
    const head_tail_effect = effective_wind * wind_factor * wind_multiplier_factor * 
                            distance_factor * speed_factor
    
    const height_effect = Math.sqrt(club_data.max_height / 35)
    adjusted_yardage -= head_tail_effect * height_effect
    
    // Reduced crosswind with proper non-linear effect
    const cross_factor = Math.sin(wind_rad)
    const cross_base = 0.25 * (1 + 0.0015 * Math.pow(effective_wind, 1.15))  // Reduced effect
    const cross_wind_effect = effective_wind * cross_factor * cross_base
    
    // Maintain existing spin and loft influences
    const spin_factor = Math.sqrt((club_data.spin_rate * ball.spin_factor) / 2545)
    const loft_factor = Math.sqrt(club_data.launch_angle / 10.4)
    
    lateral_movement = cross_wind_effect * distance_factor * speed_factor * 3.0 * 
                      (1 + (spin_factor + loft_factor - 2) * 0.2)
}