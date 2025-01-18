import { useState } from 'react'
import { View, ScrollView } from 'react-native'
import { Text, YStack, XStack, Button, Input, Card } from 'tamagui'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Feather } from '@expo/vector-icons'
import { useClubSettings, usePremium, useSettings } from '../../providers'
import { ClubData } from '../../types/index'

const ICON_SIZE = 20
const ICON_COLOR = '#000'

export function SettingsScreen() {
  const { clubs, addClub, updateClub, removeClub } = useClubSettings()
  const { isPremium, setShowUpgradeModal } = usePremium()
  const { settings, updateSettings, convertDistance } = useSettings()
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [newClub, setNewClub] = useState<ClubData>({
    name: '',
    normalYardage: 0,
    loft: 0
  })

  const handleSave = (index: number | null) => {
    if (index === null) {
      const normalYardage = settings.distanceUnit === 'meters' 
        ? convertDistance(newClub.normalYardage, 'yards')
        : newClub.normalYardage

      addClub({ ...newClub, normalYardage })
      setNewClub({ name: '', normalYardage: 0, loft: 0 })
    } else {
      const normalYardage = settings.distanceUnit === 'meters'
        ? convertDistance(newClub.normalYardage, 'yards')
        : newClub.normalYardage

      updateClub(index, { ...newClub, normalYardage })
      setEditingIndex(null)
    }
  }

  const handleEdit = (index: number) => {
    const club = clubs[index]
    const normalYardage = settings.distanceUnit === 'meters'
      ? convertDistance(club.normalYardage, 'meters')
      : club.normalYardage

    setNewClub({ 
      ...club, 
      normalYardage,
      loft: club.loft || 0
    })
    setEditingIndex(index)
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView>
        <YStack flex={1} padding="$4" space="$4">
          <Text fontSize="$8" fontWeight="bold">Settings</Text>

          {/* Unit Preferences */}
          <Card>
            <YStack space="$4">
              <Text fontSize="$6" fontWeight="bold">Unit Preferences</Text>

              {/* Distance Unit */}
              <YStack space="$2">
                <XStack alignItems="center" space="$2">
                  <Feather name="ruler" size={ICON_SIZE} />
                  <Text>Distance Unit</Text>
                </XStack>
                <XStack space="$2">
                  <Button
                    flex={1}
                    theme={settings.distanceUnit === 'yards' ? 'active' : undefined}
                    onPress={() => updateSettings({ distanceUnit: 'yards' })}
                  >
                    Yards
                  </Button>
                  <Button
                    flex={1}
                    theme={settings.distanceUnit === 'meters' ? 'active' : undefined}
                    onPress={() => updateSettings({ distanceUnit: 'meters' })}
                  >
                    Meters
                  </Button>
                </XStack>
              </YStack>

              {/* Temperature Unit */}
              <YStack space="$2">
                <XStack alignItems="center" space="$2">
                  <Feather name="thermometer" size={ICON_SIZE} />
                  <Text>Temperature Unit</Text>
                </XStack>
                <XStack space="$2">
                  <Button
                    flex={1}
                    theme={settings.temperatureUnit === 'celsius' ? 'active' : undefined}
                    onPress={() => updateSettings({ temperatureUnit: 'celsius' })}
                  >
                    Celsius
                  </Button>
                  <Button
                    flex={1}
                    theme={settings.temperatureUnit === 'fahrenheit' ? 'active' : undefined}
                    onPress={() => updateSettings({ temperatureUnit: 'fahrenheit' })}
                  >
                    Fahrenheit
                  </Button>
                </XStack>
              </YStack>

              {/* Altitude Unit */}
              <YStack space="$2">
                <XStack alignItems="center" space="$2">
                  <Feather name="mountain" size={ICON_SIZE} />
                  <Text>Altitude Unit</Text>
                </XStack>
                <XStack space="$2">
                  <Button
                    flex={1}
                    theme={settings.altitudeUnit === 'meters' ? 'active' : undefined}
                    onPress={() => updateSettings({ altitudeUnit: 'meters' })}
                  >
                    Meters
                  </Button>
                  <Button
                    flex={1}
                    theme={settings.altitudeUnit === 'feet' ? 'active' : undefined}
                    onPress={() => updateSettings({ altitudeUnit: 'feet' })}
                  >
                    Feet
                  </Button>
                </XStack>
              </YStack>
            </YStack>
          </Card>

          {/* Club Management */}
          <Card>
            <YStack space="$4">
              <Text fontSize="$6" fontWeight="bold">Club Management</Text>

              {/* Add/Edit Club Form */}
              <YStack space="$2">
                <Input
                  placeholder="Club Name"
                  value={newClub.name}
                  onChangeText={(text) => setNewClub({ ...newClub, name: text })}
                />
                <Input
                  placeholder={`Normal Distance (${settings.distanceUnit})`}
                  value={newClub.normalYardage.toString()}
                  onChangeText={(text) => setNewClub({ ...newClub, normalYardage: parseInt(text) || 0 })}
                  keyboardType="numeric"
                />
                <Input
                  placeholder="Loft (degrees)"
                  value={newClub.loft.toString()}
                  onChangeText={(text) => setNewClub({ ...newClub, loft: parseInt(text) || 0 })}
                  keyboardType="numeric"
                />
                <Button onPress={() => handleSave(editingIndex)}>
                  {editingIndex !== null ? 'Update Club' : 'Add Club'}
                </Button>
                {editingIndex !== null && (
                  <Button onPress={() => setEditingIndex(null)}>
                    Cancel
                  </Button>
                )}
              </YStack>

              {/* Club List */}
              <YStack space="$2">
                {clubs.map((club, index) => {
                  const displayDistance = settings.distanceUnit === 'meters'
                    ? convertDistance(club.normalYardage, 'meters')
                    : club.normalYardage

                  return (
                    <Card key={index}>
                      <XStack justifyContent="space-between" alignItems="center">
                        <YStack>
                          <Text>{club.name}</Text>
                          <Text theme="alt2">
                            {Math.round(displayDistance)} {settings.distanceUnit} • {club.loft}°
                          </Text>
                        </YStack>
                        <XStack space="$2">
                          <Button 
                            icon={<Feather name="edit" size={ICON_SIZE} />} 
                            onPress={() => handleEdit(index)} 
                          />
                          <Button 
                            icon={<Feather name="trash-2" size={ICON_SIZE} />} 
                            onPress={() => removeClub(index)} 
                          />
                        </XStack>
                      </XStack>
                    </Card>
                  )
                })}
              </YStack>
            </YStack>
          </Card>

          {/* Premium Features */}
          {!isPremium && (
            <Card>
              <YStack space="$4">
                <XStack justifyContent="space-between" alignItems="center">
                  <Text fontSize="$6" fontWeight="bold">Premium Features</Text>
                  <Feather name="lock" size={ICON_SIZE} />
                </XStack>
                <Text theme="alt2">
                  Upgrade to access advanced club insights, performance tracking, and more.
                </Text>
                <Button onPress={() => setShowUpgradeModal(true)}>
                  Upgrade to Premium
                </Button>
              </YStack>
            </Card>
          )}
        </YStack>
      </ScrollView>
    </SafeAreaView>
  )
}
