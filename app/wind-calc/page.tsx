import { useState } from 'react'
import { YStack, XStack, Input, Paragraph, Button, Spinner, H2 } from 'tamagui'
import { calculateWindEffect } from '../../scripts/wind-effect-matrix'
import { z } from 'zod'
import { useClubStore } from '../../lib/club-settings-context'

const WindFormSchema = z.object({
  windSpeed: z.number().min(0).max(30),
  windDirection: z.number().min(0).max(360),
  selectedClub: z.string().min(1)
})

export function WindCalculator() {
  const [windSpeed, setWindSpeed] = useState('')
  const [windDirection, setWindDirection] = useState('')
  const { selectedClub } = useClubStore()
  const [result, setResult] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleCalculate = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const validated = WindFormSchema.safeParse({
        windSpeed: Number(windSpeed),
        windDirection: Number(windDirection),
        selectedClub
      })

      if (!validated.success) {
        setError('Invalid input values')
        return
      }

      const effect = await calculateWindEffect(
        validated.data.windSpeed,
        validated.data.windDirection,
        validated.data.selectedClub
      )

      setResult(`${effect.adjustment} yards (${effect.clubChange} club change)`)
    } catch (err) {
      setError('Failed to calculate wind effect')
    } finally {
      setLoading(false)
    }
  }

  return (
    <YStack space="$4" padding="$4">
      <H2 color="$blue10">Wind Effect Calculator</H2>

      {error && (
        <Paragraph color="$red10">{error}</Paragraph>
      )}

      <YStack space="$2">
        <Paragraph>Wind Speed (mph)</Paragraph>
        <Input
          placeholder="Enter wind speed"
          keyboardType="numeric"
          value={windSpeed}
          onChangeText={setWindSpeed}
        />
      </YStack>

      <YStack space="$2">
        <Paragraph>Wind Direction (degrees)</Paragraph>
        <Input
          placeholder="Enter wind direction"
          keyboardType="numeric"
          value={windDirection}
          onChangeText={setWindDirection}
        />
      </YStack>

      <XStack space="$2">
        <Button
          flex={1}
          onPress={handleCalculate}
          disabled={loading}
          theme={loading ? 'alt2' : 'active'}
        >
          {loading ? <Spinner /> : 'Calculate'}
        </Button>
      </XStack>

      {result && (
        <YStack padding="$4" backgroundColor="$gray3" borderRadius="$2">
          <Paragraph fontWeight="600">Recommended Adjustment:</Paragraph>
          <Paragraph>{result}</Paragraph>
        </YStack>
      )}
    </YStack>
  )
}

export default WindCalculator
