import React, { useState } from 'react'
import { WindDirectionCompass } from '../../../../packages/app-components/ui/wind-direction-compass'
import { Button, YStack } from 'tamagui'

export function WindCompassTestScreen() {
  const [wind, setWind] = useState(0)
  const [shot, setShot] = useState(0)

  return (
    <YStack f={1} jc="center" ai="center" space>
      <WindDirectionCompass
        windDirection={wind}
        shotDirection={shot}
        onChange={(type, deg) => {
          type === 'wind' ? setWind(deg) : setShot(deg)
        }}
      />
      <Button onPress={() => {
        setWind(0)
        setShot(0)
      }}>
        Reset Directions
      </Button>
    </YStack>
  )
}