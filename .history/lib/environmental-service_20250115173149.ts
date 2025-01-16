'use client'

import { EnvironmentalConditions, EnvironmentalCalculator } from './environmental-calculations'

interface SubscriberCallback {
  (conditions: EnvironmentalConditions): void
}

export class EnvironmentalService {
  private static instance: EnvironmentalService
  private conditions: EnvironmentalConditions
  private subscribers: Set<(conditions: EnvironmentalConditions) => void>
  private updateInterval: NodeJS.Timeout | null
  private baseAltitude: number // Base altitude that stays constant
  private lastUpdate: number // Last update timestamp

  private constructor() {
    // Generate a stable random base altitude using a fixed seed
    this.baseAltitude = 100 + Math.floor(Math.random() * 1000)
    this.conditions = {
      temperature: 70, // °F
      humidity: 60,
      pressure: 1013.25,
      altitude: this.baseAltitude,
      windSpeed: 5,
      windDirection: 0,
      density: 1.225
    }
    this.subscribers = new Set()
    this.updateInterval = null
    this.lastUpdate = Date.now()
  }

  public static getInstance(): EnvironmentalService {
    if (!EnvironmentalService.instance) {
      EnvironmentalService.instance = new EnvironmentalService()
    }
    return EnvironmentalService.instance
  }

  public subscribe(callback: SubscriberCallback): () => void {
    this.subscribers.add(callback)
    callback(this.conditions)
    return () => {
      this.subscribers.delete(callback)
    }
  }

  private notifySubscribers(): void {
    this.subscribers.forEach((callback) => callback(this.conditions))
  }

  private updateConditions(): void {
    const now = Date.now()
    const timeScale = now / (24 * 60 * 60 * 1000) // Scale to one day

    // Update conditions with some natural variation
    this.conditions = {
      ...this.conditions,
      temperature: 70 + Math.sin(timeScale * Math.PI * 2) * 10, // Vary between 60-80°F
      humidity: 60 + Math.sin(timeScale * Math.PI * 2 + 1) * 20, // Vary between 40-80%
      altitude: this.baseAltitude + Math.sin(timeScale * Math.PI * 2 + 2) * 10, // Small variations
      pressure: 1013.25 + Math.sin(timeScale * Math.PI * 2 + 3) * 10, // Vary around standard
      windSpeed: Math.abs(Math.sin(timeScale * Math.PI * 2 + 4) * 15), // Vary between 0-15 mph
      windDirection: (Math.sin(timeScale * Math.PI * 2 + 5) * 180 + 180) % 360, // Vary between 0-360 degrees
      density: 0 // Will be calculated below
    }

    // Calculate air density
    this.conditions.density = EnvironmentalCalculator.calculateAirDensity(this.conditions)

    this.lastUpdate = now
    this.notifySubscribers()
  }

  public startMonitoring(): void {
    if (!this.updateInterval) {
      this.updateInterval = setInterval(() => this.updateConditions(), 1000)
      this.updateConditions() // Initial update
    }
  }

  public stopMonitoring(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval)
      this.updateInterval = null
    }
  }

  public getConditions(): EnvironmentalConditions {
    return { ...this.conditions }
  }

  public calculateWindEffect(
    shotDirection: number
  ): { headwind: number; crosswind: number } {
    return EnvironmentalCalculator.calculateWindEffect(
      this.conditions.windSpeed,
      this.conditions.windDirection,
      shotDirection
    )
  }

  public calculateAltitudeEffect(): number {
    return EnvironmentalCalculator.calculateAltitudeEffect(this.conditions.altitude)
  }

  async getCurrentConditions(): Promise<EnvironmentalConditions> {
    const apiKey = process.env.TOMORROW_API_KEY;
    if (!apiKey) {
      throw new Error('Tomorrow.io API key not configured');
    }

    const url = `https://api.tomorrow.io/v4/timelines?location=42.36,-71.06&fields=temperature,humidity,windSpeed,windDirection,pressure&timesteps=current&units=imperial&apikey=${apiKey}`;

    try {
      const response = await fetch(url);
      const data = await response.json();
      
      const current = data?.data?.timelines[0]?.intervals[0]?.values;
      if (!current) {
        throw new Error('Invalid weather data received');
      }

      return {
        temperature: current.temperature,
        humidity: current.humidity,
        altitude: this.conditions.altitude, // Keep using local altitude
        windSpeed: current.windSpeed,
        windDirection: current.windDirection,
        pressure: current.pressure,
        density: EnvironmentalCalculator.calculateAirDensity({
          temperature: current.temperature,
          humidity: current.humidity,
          pressure: current.pressure,
          altitude: this.conditions.altitude,
          windSpeed: current.windSpeed,
          windDirection: current.windDirection,
          density: 1.225
        })
      };
    } catch (error) {
      console.error('Failed to fetch weather data:', error);
      throw error;
    }
  }
}

export const environmentalService = EnvironmentalService.getInstance()
