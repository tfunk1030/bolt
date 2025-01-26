import { Platform } from 'react-native';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { EnvironmentalConditions } from './environmental-calculations';

export class EnvironmentalService {
  private static instance: EnvironmentalService;
  private conditions: EnvironmentalConditions;
  private subscribers: Set<(conditions: EnvironmentalConditions) => void>;
  private updateInterval: NodeJS.Timeout | null;

  private constructor() {
    this.conditions = {
      temperature: 75,
      humidity: 70,
      pressure: 1013.25,
      altitude: 0,
      windSpeed: 5,
      windDirection: 0,
      density: 1.225
    };
    this.subscribers = new Set();
    this.updateInterval = null;
  }

  public static getInstance(): EnvironmentalService {
    if (!EnvironmentalService.instance) {
      EnvironmentalService.instance = new EnvironmentalService();
    }
    return EnvironmentalService.instance;
  }

  public subscribe(callback: (conditions: EnvironmentalConditions) => void): () => void {
    this.subscribers.add(callback);
    callback(this.conditions);
    return () => this.subscribers.delete(callback);
  }

  public async startMonitoring() {
    if (!this.updateInterval) {
      this.updateInterval = setInterval(() => this.updateConditions(), 300000);
      await this.updateConditions();
    }
  }

  public stopMonitoring() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }

  private async updateConditions() {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') throw new Error('Permission denied');
      
      const location = await Location.getCurrentPositionAsync({});
      const conditions = await this.fetchWeatherConditions(
        location.coords.latitude,
        location.coords.longitude
      );
      
      this.conditions = conditions;
      this.notifySubscribers();
      await AsyncStorage.setItem('last-known-conditions', JSON.stringify(conditions));
    } catch (error) {
      console.error('Failed to update conditions:', error);
      const lastConditions = await AsyncStorage.getItem('last-known-conditions');
      if (lastConditions) this.conditions = JSON.parse(lastConditions);
    }
  }

  private async fetchWeatherConditions(lat: number, lon: number): Promise<EnvironmentalConditions> {
    // Implement your weather API fetching logic here
    return this.conditions; // Return mock data for example
  }

  private notifySubscribers() {
    this.subscribers.forEach(callback => callback({ ...this.conditions }));
  }
}

export const environmentalService = EnvironmentalService.getInstance();
