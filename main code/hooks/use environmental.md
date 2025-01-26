'use client'

  

import { useState, useEffect, useCallback } from 'react'

import { environmentalService } from '../environmental-service'

import { EnvironmentalConditions } from '../environmental-calculations'

  

interface Adjustments {

  distanceAdjustment: number

  trajectoryShift: number

  spinAdjustment: number

  launchAngleAdjustment: number

}

  

interface WindEffect {

  headwind: number

  crosswind: number

}

  

function calculateAltitudeEffect(altitude: number): number {

  return (altitude / 1000) * 2

}

  

function calculateWindEffect(speed: number, direction: number): WindEffect {

  const windAngle = (direction * Math.PI) / 180

  return {

    headwind: speed * Math.cos(windAngle),

    crosswind: speed * Math.sin(windAngle)

  }

}

  

export function useEnvironmental(shotDirection: number = 0) {

  const [conditions, setConditions] = useState<EnvironmentalConditions | null>(null)

  const [adjustments, setAdjustments] = useState<Adjustments | null>(null)

  

  useEffect(() => {

    const unsubscribe = environmentalService.subscribe((newConditions) => {

      setConditions(newConditions)

    })

  

    environmentalService.startMonitoring()

  

    return () => {

      unsubscribe()

      environmentalService.stopMonitoring()

    }

  }, [])

  

  const calculateAdjustments = useCallback(() => {

    if (!conditions) return null;

  

    const density = conditions.density ?? 1.225;

    const altitudeEffect = calculateAltitudeEffect(conditions.altitude)

    const windEffect = calculateWindEffect(conditions.windSpeed, conditions.windDirection)

  

    return {

      distanceAdjustment: altitudeEffect + (windEffect.headwind * -1.5),

      trajectoryShift: windEffect.crosswind * 2,

      spinAdjustment: ((density / 1.225) - 1) * -50,

      launchAngleAdjustment: windEffect.headwind * 0.1

    }

  }, [conditions])

  

  useEffect(() => {

    if (conditions) {

      const windEffect = environmentalService.calculateWindEffect(shotDirection)

      const altitudeEffect = environmentalService.calculateAltitudeEffect()

      const density = conditions.density ?? 1.225;

  

      setAdjustments({

        distanceAdjustment: altitudeEffect + (windEffect.headwind * -1.5),

        trajectoryShift: windEffect.crosswind * 2,

        spinAdjustment: ((density / 1.225) - 1) * -50,

        launchAngleAdjustment: windEffect.headwind * 0.1

      })

    }

  }, [conditions, shotDirection])

  

  return {

    conditions,

    adjustments,

    isLoading: !conditions

  }

}