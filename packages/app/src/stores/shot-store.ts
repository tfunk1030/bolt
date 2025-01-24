import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { z } from 'zod'
import { mmkv } from '../utils/mmkv'

const ShotConditionsSchema = z.object({
  temperature: z.number(),
  humidity: z.number(),
  altitude: z.number(),
  windSpeed: z.number(),
  windDirection: z.number(),
  slope: z.number(),
})

const ShotDataSchema = z.object({
  club: z.string(),
  distance: z.number(),
  conditions: ShotConditionsSchema,
  spin: z.number().optional(),
  launchAngle: z.number().optional(),
  ballSpeed: z.number().optional(),
  smashFactor: z.number().optional(),
})

interface ShotState {
  currentShot: z.infer<typeof ShotDataSchema> | null
  shotHistory: z.infer<typeof ShotDataSchema>[]
  setCurrentShot: (shot: z.infer<typeof ShotDataSchema>) => void
  addToHistory: (shot: z.infer<typeof ShotDataSchema>) => void
  clearHistory: () => void
}

export const useShotStore = create<ShotState>()(
  persist(
    (set) => ({
      currentShot: null,
      shotHistory: [],
      setCurrentShot: (shot) => set({ currentShot: shot }),
      addToHistory: (shot) =>
        set((state) => ({
          shotHistory: [...state.shotHistory, shot],
        })),
      clearHistory: () => set({ shotHistory: [] }),
    }),
    {
      name: 'shot-store',
      storage: createJSONStorage(() => mmkv),
    }
  )
) 