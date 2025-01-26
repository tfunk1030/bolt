'use client'

  

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'

import { ClubData } from '@/lib/types'

  

interface ClubSettingsContextType {

  clubs: ClubData[]

  addClub: (club: ClubData) => void

  updateClub: (index: number, club: ClubData) => void

  removeClub: (index: number) => void

  getRecommendedClub: (targetYardage: number) => ClubData | null

}

  

const DEFAULT_CLUBS: ClubData[] = [

  { name: "Driver", normalYardage: 282, loft: 9.5 },

  { name: "3-Wood", normalYardage: 249, loft: 15 },

  { name: "5-Wood", normalYardage: 236, loft: 18 },

  { name: "Hybrid", normalYardage: 231, loft: 20 },

  { name: "3-Iron", normalYardage: 218, loft: 21 },

  { name: "4-Iron", normalYardage: 209, loft: 24 },

  { name: "5-Iron", normalYardage: 199, loft: 27 },

  { name: "6-Iron", normalYardage: 188, loft: 30 },

  { name: "7-Iron", normalYardage: 176, loft: 34 },

  { name: "8-Iron", normalYardage: 164, loft: 38 },

  { name: "9-Iron", normalYardage: 152, loft: 42 },

  { name: "PW", normalYardage: 142, loft: 46 },

  { name: "GW", normalYardage: 130, loft: 50 },

  { name: "SW", normalYardage: 118, loft: 54 },

  { name: "LW", normalYardage: 106, loft: 58 }

]

  

export const ClubSettingsContext = createContext<ClubSettingsContextType | null>(null);

  

export function ClubSettingsProvider({ children }: { children: React.ReactNode }) {

  const [clubs, setClubs] = useState<ClubData[]>(() => {

    if (typeof window !== 'undefined') {

      const saved = localStorage.getItem('clubSettings')

      if (saved) {

        try {

          const parsedClubs = JSON.parse(saved)

          // Ensure all clubs have loft property

          return parsedClubs.map((club: Partial<ClubData>) => ({

            name: club.name || '',

            normalYardage: club.normalYardage || 0,

            loft: club.loft || getDefaultLoft(club.name || '') || 0

          }))

        } catch (e) {

          console.error('Error parsing saved club settings:', e)

          return DEFAULT_CLUBS

        }

      }

    }

    return DEFAULT_CLUBS

  })

  

  // Helper function to get default loft based on club name

  function getDefaultLoft(clubName: string): number {

    const defaultClub = DEFAULT_CLUBS.find(club => club.name === clubName)

    return defaultClub?.loft || 0

  }

  

  const sortClubs = (clubs: ClubData[]): ClubData[] => {

    return [...clubs].sort((a, b) => b.normalYardage - a.normalYardage)

  }

  

  const addClub = useCallback((club: ClubData) => {

    setClubs(prev => {

      const newClubs = sortClubs([...prev, club])

      localStorage.setItem('clubSettings', JSON.stringify(newClubs))

      return newClubs

    })

  }, [])

  

  const updateClub = useCallback((index: number, club: ClubData) => {

    setClubs(prev => {

      const newClubs = [...prev]

      newClubs[index] = club

      const sortedClubs = sortClubs(newClubs)

      localStorage.setItem('clubSettings', JSON.stringify(sortedClubs))

      return sortedClubs

    })

  }, [])

  

  const removeClub = useCallback((index: number) => {

    setClubs(prev => {

      const newClubs = prev.filter((_, i) => i !== index)

      localStorage.setItem('clubSettings', JSON.stringify(newClubs))

      return newClubs

    })

  }, [])

  

  const getRecommendedClub = useCallback((targetYardage: number): ClubData | null => {

    if (!clubs.length) return null

  

    let closestClub = clubs[0]

    let minDiff = Math.abs(clubs[0].normalYardage - targetYardage)

  

    for (const club of clubs) {

      const diff = Math.abs(club.normalYardage - targetYardage)

      if (diff < minDiff) {

        minDiff = diff

        closestClub = club

      }

    }

  

    return {

      name: closestClub.name,

      normalYardage: closestClub.normalYardage,

      loft: closestClub.loft

    }

  }, [clubs])

  

  const value: ClubSettingsContextType = {

    clubs,

    addClub,

    updateClub,

    removeClub,

    getRecommendedClub

  }

  

  return (

    <ClubSettingsContext.Provider value={value}>

      {children}

    </ClubSettingsContext.Provider>

  )

}

  

export function useClubSettings() {

  const context = useContext(ClubSettingsContext)

  if (!context) {

    throw new Error('useClubSettings must be used within a ClubSettingsProvider')

  }

  return context

}