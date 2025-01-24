import { ScrollView, YStack, Text, XStack } from 'tamagui'
import { useShotStore } from '../stores/shot-store'
import { useTranslation } from '../hooks/useTranslation'

export function ShotAnalysisScreen() {
  const { t } = useTranslation()
  const { shotHistory } = useShotStore()

  return (
    <ScrollView flex={1} padding="$4" backgroundColor="$background">
      <YStack space="$4">
        <Text fontSize="$6" fontWeight="bold">
          {t('shot.analysis')}
        </Text>

        {shotHistory.length === 0 ? (
          <Text color="$gray10">{t('shot.noHistory')}</Text>
        ) : (
          <YStack space="$3">
            {shotHistory.map((shot, index) => (
              <YStack
                key={index}
                backgroundColor="$blue2"
                padding="$4"
                borderRadius="$4"
                space="$2"
              >
                <Text fontSize="$5" fontWeight="600">
                  {shot.club}
                </Text>
                <Text>
                  {t('shot.distance')}: {shot.distance.toFixed(1)} yards
                </Text>
                <XStack flexWrap="wrap" gap="$2">
                  <Text>
                    {t('shot.temperature')}: {shot.conditions.temperature}°F
                  </Text>
                  <Text>
                    {t('shot.humidity')}: {shot.conditions.humidity}%
                  </Text>
                  <Text>
                    {t('shot.windSpeed')}: {shot.conditions.windSpeed} mph
                  </Text>
                  <Text>
                    {t('shot.windDirection')}: {shot.conditions.windDirection}°
                  </Text>
                  <Text>
                    {t('shot.altitude')}: {shot.conditions.altitude} ft
                  </Text>
                  <Text>
                    {t('shot.slope')}: {shot.conditions.slope}°
                  </Text>
                </XStack>
              </YStack>
            ))}
          </YStack>
        )}
      </YStack>
    </ScrollView>
  )
} 