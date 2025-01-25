import { Platform } from 'react-native'
import { useAnimatedStyle, withSpring } from 'react-native-reanimated'
import { Circle, G, Line, Path, Svg } from 'react-native-svg'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import { XStack, YStack, styled } from 'tamagui'

const CompassContainer = styled(YStack, {
  position: 'relative',
  alignItems: 'center',
  justifyContent: 'center',
})

interface WindDirectionCompassProps {
  windDirection: number
  shotDirection: number
  size?: number
  onChange?: (type: 'wind' | 'shot', degrees: number) => void
  lockShot?: boolean
}

export function WindDirectionCompass({
  windDirection,
  shotDirection,
  size = 280,
  onChange,
  lockShot = false
}: WindDirectionCompassProps) {
  const center = size / 2
  const radius = size * 0.4

  // Gesture handling for wind direction
  const windGesture = Gesture.Pan()
    .onUpdate((e) => {
      if (!onChange || lockShot) return
      const angle = calculateAngle(e.x, e.y, center, center)
      onChange('wind', angle)
    })

  // Gesture handling for shot direction  
  const shotGesture = Gesture.Pan()
    .onUpdate((e) => {
      if (!onChange) return
      const angle = calculateAngle(e.x, e.y, center, center)
      onChange('shot', angle)
    })

  const calculateAngle = (x: number, y: number, centerX: number, centerY: number) => {
    const dx = x - centerX
    const dy = y - centerY
    let angle = Math.atan2(dy, dx) * 180 / Math.PI + 90
    return (angle + 360) % 360
  }

  // Animated styles
  const windStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${windDirection}deg` }]
  }))

  const shotStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${shotDirection}deg` }]
  }))

  return (
    <CompassContainer width={size} height={size}>
      <Svg width="100%" height="100%" viewBox={`0 0 ${size} ${size}`}>
        {/* Compass Base */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          fill="rgba(31, 41, 55, 0.4)"
          stroke="#4B5563"
          strokeWidth="2"
        />

        {/* Shot Direction */}
        <G transform={`rotate(${shotDirection} ${center} ${center})`}>
          <Line
            x1={center}
            y1={center}
            x2={center}
            y2={center - radius}
            stroke="#10B981"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <Path
            d={`M ${center} ${center - radius + 20} L ${center - 10} ${center - radius} L ${center + 10} ${center - radius} Z`}
            fill="#10B981"
          />
        </G>

        {/* Wind Direction */}
        <G transform={`rotate(${windDirection} ${center} ${center})`}>
          <Line
            x1={center}
            y1={center}
            x2={center}
            y2={center + radius}
            stroke="#3B82F6"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <Path
            d={`M ${center - 15} ${center + radius} L ${center} ${center + radius - 20} L ${center + 15} ${center + radius} Z`}
            fill="#3B82F6"
          />
        </G>
      </Svg>

      <GestureDetector gesture={windGesture}>
        <XStack position="absolute" width="100%" height="50%" bottom={0} />
      </GestureDetector>

      {!lockShot && (
        <GestureDetector gesture={shotGesture}>
          <XStack position="absolute" width="100%" height="50%" />
        </GestureDetector>
      )}
    </CompassContainer>
  )
}