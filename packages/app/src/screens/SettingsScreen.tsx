import { ScrollView, YStack, Text, Button } from 'tamagui'
import { useShotStore } from '../stores/shot-store'
import { useTranslation } from '../hooks/useTranslation'

export function SettingsScreen() {
  const { t } = useTranslation()
  const { clearHistory } = useShotStore()

  return (
    <ScrollView flex={1} padding="$4" backgroundColor="$background">
      <YStack space="$4">
        <Text fontSize="$6" fontWeight="bold">
          {t('nav.settings')}
        </Text>

        <Button
          backgroundColor="$red10"
          color="white"
          onPress={clearHistory}
          pressStyle={{ opacity: 0.8 }}
        >
          {t('settings.clearHistory')}
        </Button>
      </YStack>
    </ScrollView>
  )
} 