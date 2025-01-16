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

const defaultClubs: ClubData[] = [
  { name: "Driver", normalYardage: 300, loft: 10 },
  { name: "3-Wood", normalYardage: 260, loft: 15 },
  { name: "5-Wood", normalYardage: 240, loft: 18 },
  { name: "2-Iron", normalYardage: 245, loft: 17 },
  { name: "3-Iron", normalYardage: 235, loft: 19 },
  { name: "4-Iron", normalYardage: 220, loft: 22 },
  { name: "5-Iron", normalYardage: 205, loft: 26 },
  { name: "6-Iron", normalYardage: 190, loft: 30 },
  { name: "7-Iron", normalYardage: 180, loft: 34 },
  { name: "8-Iron", normalYardage: 165, loft: 38 },
  { name: "9-Iron", normalYardage: 150, loft: 42 },
  { name: "PW", normalYardage: 138, loft: 46 },
  { name: "GW", normalYardage: 124, loft: 50 },
  { name: "SW", normalYardage: 112, loft: 54 },
  { name: "LW", normalYardage: 95, loft: 60 }
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
          return defaultClubs
        }
      }
    }
    return defaultClubs
  })

  // Helper function to get default loft based on club name
  function getDefaultLoft(clubName: string): number {
    const defaultClub = defaultClubs.find(club => club.name === clubName)
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
