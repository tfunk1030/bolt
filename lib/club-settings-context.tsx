'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'

interface ClubData {
  name: string
  normalYardage: number
}

interface ClubSettingsContextType {
  clubs: ClubData[]
  addClub: (club: ClubData) => void
  updateClub: (index: number, club: ClubData) => void
  removeClub: (index: number) => void
  getRecommendedClub: (targetYardage: number) => RecommendedClub | null
}

interface RecommendedClub {
  name: string
  normalYardage: number
}

const defaultClubs: ClubData[] = [
  { name: 'Driver', normalYardage: 295 },
  { name: '3W', normalYardage: 260 },
  { name: '5W', normalYardage: 240 },
  { name: '4i', normalYardage: 220 },
  { name: '5i', normalYardage: 205 },
  { name: '6i', normalYardage: 190 },
  { name: '7i', normalYardage: 178 },
  { name: '8i', normalYardage: 165 },
  { name: '9i', normalYardage: 152 },
  { name: 'PW', normalYardage: 138 },
  { name: 'GW', normalYardage: 126 },
  { name: 'SW', normalYardage: 114 },
  { name: 'LW', normalYardage: 95 },
]

export const ClubSettingsContext = createContext<ClubSettingsContextType | null>(null);

export function ClubSettingsProvider({ children }: { children: React.ReactNode }) {
  const [clubs, setClubs] = useState<ClubData[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('clubSettings')
      if (saved) {
        try {
          return JSON.parse(saved)
        } catch (e) {
          console.error('Error parsing saved club settings:', e)
          return defaultClubs
        }
      }
    }
    return defaultClubs
  })

  const addClub = useCallback((club: ClubData) => {
    setClubs(prev => {
      const newClubs = [...prev, club]
      localStorage.setItem('clubSettings', JSON.stringify(newClubs))
      return newClubs
    })
  }, [])

  const updateClub = useCallback((index: number, club: ClubData) => {
    setClubs(prev => {
      const newClubs = [...prev]
      newClubs[index] = club
      localStorage.setItem('clubSettings', JSON.stringify(newClubs))
      return newClubs
    })
  }, [])

  const removeClub = useCallback((index: number) => {
    setClubs(prev => {
      const newClubs = prev.filter((_, i) => i !== index)
      localStorage.setItem('clubSettings', JSON.stringify(newClubs))
      return newClubs
    })
  }, [])

  const getRecommendedClub = useCallback((targetYardage: number): RecommendedClub | null => {
    console.log('Finding club for yardage:', targetYardage)
    console.log('Available clubs:', clubs)

    // Create ranges based on user's configured clubs
    const clubRanges = clubs
      .filter(club => club.normalYardage > 0)
      .map(club => ({
        name: club.name,
        normalYardage: club.normalYardage,
        range: [
          Math.round(club.normalYardage * 0.9),
          Math.round(club.normalYardage * 1.1)
        ] as [number, number]
      }))
      .sort((a, b) => b.normalYardage - a.normalYardage)

    console.log('Club ranges:', clubRanges)

    // Find the first club where the target is within its range
    const recommendedClub = clubRanges.find(club => 
      targetYardage >= club.range[0] && targetYardage <= club.range[1]
    )

    if (recommendedClub) {
      console.log('Found club in range:', recommendedClub)
      return {
        name: recommendedClub.name,
        normalYardage: recommendedClub.normalYardage
      }
    }

    // If no exact match, find the closest club
    const closestClub = clubRanges.reduce((closest, club) => {
      const currentDiff = Math.abs(targetYardage - club.normalYardage)
      const closestDiff = closest ? Math.abs(targetYardage - closest.normalYardage) : Infinity
      return currentDiff < closestDiff ? club : closest
    }, null as typeof clubRanges[0] | null)

    if (closestClub) {
      console.log('Found closest club:', closestClub)
      return {
        name: closestClub.name,
        normalYardage: closestClub.normalYardage
      }
    }

    console.log('No suitable club found')
    return null
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
