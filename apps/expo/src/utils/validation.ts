import { z } from 'zod';

// Basic validation schemas
export const emailSchema = z
  .string()
  .email('Invalid email address')
  .min(1, 'Email is required');

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

// Wind-related validation schemas
export const windDataSchema = z.object({
  speed: z.number().min(0, 'Wind speed must be positive'),
  direction: z.number().min(0).max(360, 'Direction must be between 0 and 360 degrees'),
  gusts: z.number().min(0).optional(),
  timestamp: z.date().optional(),
  location: z.object({
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
  }).optional(),
});

// Shot-related validation schemas
export const shotDataSchema = z.object({
  distance: z.number().min(0, 'Distance must be positive'),
  club: z.string().min(1, 'Club selection is required'),
  windSpeed: z.number().min(0),
  windDirection: z.number().min(0).max(360),
  elevation: z.number().optional(),
  temperature: z.number().optional(),
  humidity: z.number().min(0).max(100).optional(),
  notes: z.string().optional(),
});

// User preferences validation schema
export const userPreferencesSchema = z.object({
  useDarkMode: z.boolean(),
  useMetricUnits: z.boolean(),
  showWindAlerts: z.boolean(),
  windAlertThreshold: z.number().min(0),
  defaultClub: z.string().optional(),
  language: z.string().default('en'),
});

// Helper function to validate data against a schema
export function validateData<T>(schema: any, data: unknown): { success: true; data: T } | { success: false; error: Error } {
  try {
    const validData = schema.parse(data);
    return { success: true, data: validData as T };
  } catch (error) {
    return { success: false, error: error as Error };
  }
}

// Helper function to get formatted error messages
export function getValidationErrors(error: Error & { errors?: any[] }): Record<string, string> {
  const errors: Record<string, string> = {};
  if ('errors' in error && Array.isArray(error.errors)) {
    error.errors.forEach((err) => {
      const path = Array.isArray(err.path) ? err.path.join('.') : 'unknown';
      errors[path] = err.message;
    });
  }
  return errors;
}

// Helper function to validate email
export function validateEmail(email: string): { valid: boolean; error?: string } {
  try {
    emailSchema.parse(email);
    return { valid: true };
  } catch (error) {
    const err = error as Error & { errors?: any[] };
    return {
      valid: false,
      error: err.errors?.[0]?.message || 'Invalid email',
    };
  }
}

// Helper function to validate password
export function validatePassword(password: string): { valid: boolean; error?: string } {
  try {
    passwordSchema.parse(password);
    return { valid: true };
  } catch (error) {
    const err = error as Error & { errors?: any[] };
    return {
      valid: false,
      error: err.errors?.[0]?.message || 'Invalid password',
    };
  }
}

// Export types
export interface WindData {
  speed: number;
  direction: number;
  gusts?: number;
  timestamp?: Date;
  location?: {
    latitude: number;
    longitude: number;
  };
}

export interface ShotData {
  distance: number;
  club: string;
  windSpeed: number;
  windDirection: number;
  elevation?: number;
  temperature?: number;
  humidity?: number;
  notes?: string;
}

export interface UserPreferences {
  useDarkMode: boolean;
  useMetricUnits: boolean;
  showWindAlerts: boolean;
  windAlertThreshold: number;
  defaultClub?: string;
  language: string;
}
