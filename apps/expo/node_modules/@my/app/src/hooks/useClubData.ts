import { useMemo } from 'react'
import { getClubData } from '../utils/shot-calculations'

export function useClubData() {
  const clubs = useMemo(() => getClubData(), [])

  return {
    clubs,
  }
} 