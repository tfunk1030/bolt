import React from 'react';
import { Pressable } from 'react-native';
import { YStack, XStack, ScrollView, Text } from 'tamagui';

interface Conditions {
  temperature: string;
  humidity: string;
  pressure: string;
  altitude: string;
  wind: {
    speed: string;
    direction: string;
  };
}

interface FlightPath {
  apex: string;
  landingAngle: string;
  carry: string;
  total: string;
}

interface ShotData {
  intendedYardage: number;
  adjustedYardage: number;
  actualYardage: number;
  suggestedClub: string;
  alternateClub: string;
  flightPath: FlightPath;
}

interface ShotAnalysisData {
  conditions: Conditions;
  shot: ShotData;
}

const ShotAnalysisScreen = () => {
  const shotData: ShotAnalysisData = {
    conditions: {
      temperature: "72°F",
      humidity: "45%",
      pressure: "29.92 inHg",
      altitude: "850 ft",
      wind: {
        speed: "12 mph",
        direction: "NNE"
      }
    },
    shot: {
      intendedYardage: 150,
      adjustedYardage: 156,
      actualYardage: 153,
      suggestedClub: "7 Iron",
      alternateClub: "6 Iron",
      flightPath: {
        apex: "82 ft",
        landingAngle: "45°",
        carry: "148 yards",
        total: "153 yards"
      }
    }
  };

  return (
    <ScrollView>
      <YStack p="$4" space="$4" maw={600} als="center">
        {/* Header Section */}
        <YStack pb="$4" borderBottomWidth={1} borderColor="$border">
          <Text fontSize="$9" fontWeight="800" color="$green9">
            Shot Analysis
          </Text>
        </YStack>

        {/* Conditions Card */}
        <Pressable
          onPress={() => console.log('Weather details')}
          accessibilityLabel="Weather conditions"
        >
          <YStack p="$4" bg="$background" borderRadius="$4" space="$2">
            <Text fontSize="$5" color="$color12" mb="$2">
              Current Conditions
            </Text>
            <XStack fw="wrap" gap="$4">
              <ConditionPill
                icon="thermometer"
                value={shotData.conditions.temperature}
              />
              <ConditionPill
                icon="humidity"
                value={shotData.conditions.humidity}
              />
              <ConditionPill
                icon="wind"
                value={`${shotData.conditions.wind.speed} ${shotData.conditions.wind.direction}`}
              />
              <ConditionPill
                icon="mountain"
                value={shotData.conditions.altitude}
              />
            </XStack>
          </YStack>
        </Pressable>

        {/* Yardage Cards */}
        <XStack space="$4" jc="space-between">
          <YardageCard
            label="Target"
            value={shotData.shot.intendedYardage}
            variant="primary"
          />
          <YardageCard
            label="Adjusted"
            value={shotData.shot.adjustedYardage}
            variant="secondary"
          />
        </XStack>

        {/* Club Recommendations */}
        <YStack space="$3">
          <Text fontSize="$6" color="$color12">
            Club Recommendations
          </Text>
          <XStack space="$4">
            <ClubButton
              club={shotData.shot.suggestedClub}
              isPrimary
            />
            <ClubButton
              club={shotData.shot.alternateClub}
            />
          </XStack>
        </YStack>

        {/* Flight Metrics */}
        <YStack space="$3">
          <Text fontSize="$6" color="$color12">
            Shot Performance
          </Text>
          <XStack fw="wrap" gap="$3">
            <MetricTile
              label="Carry"
              value={shotData.shot.flightPath.carry}
              icon="arrow-up"
            />
            <MetricTile
              label="Total"
              value={shotData.shot.flightPath.total}
              icon="target"
            />
            <MetricTile
              label="Apex"
              value={shotData.shot.flightPath.apex}
              icon="maximize"
            />
            <MetricTile
              label="Landing"
              value={shotData.shot.flightPath.landingAngle}
              icon="angle"
            />
          </XStack>
        </YStack>
      </YStack>
    </ScrollView>
  );
};

export default ShotAnalysisScreen;