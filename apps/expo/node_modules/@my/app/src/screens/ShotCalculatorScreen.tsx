import { useState } from 'react'
import { YStack, XStack, Text, Input, Button, ScrollView, Select } from 'tamagui'
import { useShotStore } from '../stores/shot-store'
import { calculateShotDistance } from '../utils/shot-calculations'
import { useClubData } from '../hooks/useClubData'
import { Keyboard, Platform } from 'react-native'
import { useTranslation } from '../hooks/useTranslation'

export function ShotCalculatorScreen() {
  const { t } = useTranslation()
  const { currentShot, setCurrentShot, addToHistory } = useShotStore()
  const { clubs } = useClubData()
  const [selectedClub, setSelectedClub] = useState('')
  const [conditions, setConditions] = useState({
    temperature: 70,
    humidity: 50,
    altitude: 0,
    windSpeed: 0,
    windDirection: 0,
    slope: 0,
  })

  const handleCalculate = () => {
    if (!selectedClub) return
    
    Keyboard.dismiss()
    
    const shot = {
      club: selectedClub,
      distance: calculateShotDistance(selectedClub, conditions),
      conditions,
    }
    
    setCurrentShot(shot)
    addToHistory(shot)
  }

  return (
    <ScrollView
      flex={1}
      padding="$4"
      backgroundColor="$background"
      keyboardShouldPersistTaps="handled"
    >
      <YStack space="$4">
        <Text fontSize="$6" fontWeight="bold">
          {t('shot.calculator')}
        </Text>

        <Select
          value={selectedClub}
          onValueChange={setSelectedClub}
          items={clubs.map((club) => ({
            value: club.name,
            label: club.name,
          }))}
        >
          <Select.Trigger width="100%" height="$4">
            <Select.Value placeholder={t('shot.selectClub')} />
          </Select.Trigger>
          <Select.Content>
            <Select.ScrollUpButton />
            <Select.Viewport>
              <Select.Group>
                {clubs.map((club) => (
                  <Select.Item
                    key={club.name}
                    value={club.name}
                    label={club.name}
                  >
                    <Select.ItemText>{club.name}</Select.ItemText>
                  </Select.Item>
                ))}
              </Select.Group>
            </Select.Viewport>
            <Select.ScrollDownButton />
          </Select.Content>
        </Select>

        <YStack space="$3">
          <Text fontSize="$5" fontWeight="600">
            {t('shot.conditions')}
          </Text>

          <XStack space="$2" flexWrap="wrap">
            <Input
              flex={1}
              keyboardType="numeric"
              placeholder={t('shot.temperature')}
              value={conditions.temperature.toString()}
              onChangeText={(val) =>
                setConditions((prev) => ({
                  ...prev,
                  temperature: Number(val) || 0,
                }))
              }
            />
            <Input
              flex={1}
              keyboardType="numeric"
              placeholder={t('shot.humidity')}
              value={conditions.humidity.toString()}
              onChangeText={(val) =>
                setConditions((prev) => ({
                  ...prev,
                  humidity: Number(val) || 0,
                }))
              }
            />
          </XStack>

          <XStack space="$2" flexWrap="wrap">
            <Input
              flex={1}
              keyboardType="numeric"
              placeholder={t('shot.windSpeed')}
              value={conditions.windSpeed.toString()}
              onChangeText={(val) =>
                setConditions((prev) => ({
                  ...prev,
                  windSpeed: Number(val) || 0,
                }))
              }
            />
            <Input
              flex={1}
              keyboardType="numeric"
              placeholder={t('shot.windDirection')}
              value={conditions.windDirection.toString()}
              onChangeText={(val) =>
                setConditions((prev) => ({
                  ...prev,
                  windDirection: Number(val) || 0,
                }))
              }
            />
          </XStack>

          <XStack space="$2" flexWrap="wrap">
            <Input
              flex={1}
              keyboardType="numeric"
              placeholder={t('shot.altitude')}
              value={conditions.altitude.toString()}
              onChangeText={(val) =>
                setConditions((prev) => ({
                  ...prev,
                  altitude: Number(val) || 0,
                }))
              }
            />
            <Input
              flex={1}
              keyboardType="numeric"
              placeholder={t('shot.slope')}
              value={conditions.slope.toString()}
              onChangeText={(val) =>
                setConditions((prev) => ({
                  ...prev,
                  slope: Number(val) || 0,
                }))
              }
            />
          </XStack>
        </YStack>

        <Button
          backgroundColor="$blue10"
          color="white"
          onPress={handleCalculate}
          disabled={!selectedClub}
          pressStyle={{ opacity: 0.8 }}
        >
          {t('shot.calculate')}
        </Button>

        {currentShot && (
          <YStack
            backgroundColor="$blue2"
            padding="$4"
            borderRadius="$4"
            space="$2"
          >
            <Text fontSize="$5" fontWeight="600">
              {t('shot.result')}
            </Text>
            <Text>
              {t('shot.distance')}: {currentShot.distance.toFixed(1)} yards
            </Text>
            <Text>
              {t('shot.club')}: {currentShot.club}
            </Text>
          </YStack>
        )}
      </YStack>
    </ScrollView>
  )
} 