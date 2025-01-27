'use client'

import React, { createContext, useContext, useState } from 'react'
import { YardageModelEnhanced, SkillLevel, ShotResult } from './yardage-model'

interface ShotCalcData {
  targetYardage: number | null
  adjustedDistance: number | null
  lateralMovement: number | null
  elevation: number | null
  temperature: number | null
  humidity: number | null
  pressure: number | null
}

interface ShotCalcContextType {
  shotCalcData: ShotCalcData
  setShotCalcData: (data: Partial<ShotCalcData>) => void
  calculateShot: (params: {
    targetYardage: number,
    club: string,
    skillLevel?: SkillLevel
  }) => ShotResult
}

const yardageModel = new YardageModelEnhanced()

const ShotCalcContext = createContext<ShotCalcContextType>({
  shotCalcData: {
    targetYardage: 150,
    adjustedDistance: 157,
    lateralMovement: 0,
    elevation: 1000,
    temperature: 85,
    humidity: 60,
    pressure: 29.5
  },
  setShotCalcData: () => {},
  calculateShot: () => ({ carry_distance: 0, lateral_movement: 0 })
})

export function ShotCalcProvider({ children }: { children: React.ReactNode }) {
  const [shotCalcData, setShotCalcDataState] = useState<ShotCalcData>({
    targetYardage: 150,
    adjustedDistance: 157,
    lateralMovement: 0,
    elevation: 1000,
    temperature: 85,
    humidity: 60,
    pressure: 29.5
  })

  const setShotCalcData = (data: Partial<ShotCalcData>) => {
    setShotCalcDataState(prev => {
      const newData = { ...prev, ...data }
      
      // Update yardage model conditions when environmental factors change
      yardageModel.set_conditions(
        newData.temperature || 70,
        newData.elevation || 0,
        10, // Default wind speed if not provided
        0   // Default wind direction if not provided
      )
      
      return newData
    })
  }

  const calculateShot = (params: {
    targetYardage: number,
    club: string,
    skillLevel?: SkillLevel
  }): ShotResult => {
    return yardageModel.calculate_adjusted_yardage(
      params.targetYardage,
      params.skillLevel || SkillLevel.PROFESSIONAL,
      params.club
    )
  }

  return (
    <ShotCalcContext.Provider value={{ 
      shotCalcData, 
      setShotCalcData,
      calculateShot 
    }}>
      {children}
    </ShotCalcContext.Provider>
  )
}

export function useShotCalc() {
  const context = useContext(ShotCalcContext)
  if (!context) {
    throw new Error('useShotCalc must be used within a ShotCalcProvider')
  }
  return context
}