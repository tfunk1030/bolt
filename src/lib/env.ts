// src/lib/env.ts
import * as dotenv from 'dotenv'
dotenv.config()

export const ENV = {
  API_KEY: process.env.API_KEY,
  ENVIRONMENT: process.env.ENVIRONMENT || 'development'
} as const
