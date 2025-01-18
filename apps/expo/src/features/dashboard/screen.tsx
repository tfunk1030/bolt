import React, { useMemo } from 'react';
import type { ReactNode, ReactElement, Key } from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, XStack, YStack } from '@tamagui/core';
import { Button } from '../../components/ui';
import { useDashboard } from '../../hooks/use-dashboard';
import { Trash, Edit, Plus } from '@tamagui/lucide-icons';

const WIDGET_GAP = 16;
const WIDGET_PADDING = 16;

interface Widget {
  id: string;
  type: 'environmental' | 'wind' | 'round' | 'compass';
  x: number;
  y: number;
  width: number;
  height: number;
}

interface WidgetBaseProps {
  id: string;
  title: string;
  onRemove: () => void;
  children?: ReactNode;
}

interface WidgetComponentProps extends WidgetBaseProps {
  key?: Key;
}

function WidgetComponentBase({ 
  id, 
  title, 
  onRemove, 
  children 
}: WidgetBaseProps): ReactElement | null {
  const { activeLayout } = useDashboard();
  const widget = activeLayout.widgets.find((w: Widget) => w.id === id);

  if (!widget) return null;

  return (
    <View
      style={{
        position: 'absolute',
        left: widget.x,
        top: widget.y,
        width: widget.width,
        height: widget.height,
      }}
    >
      <Button
        leftIcon={Trash}
        onPress={onRemove}
        aria-label={`Remove ${title} widget`}
      />
      {children}
    </View>
  );
}

function WidgetComponent(props: WidgetComponentProps): ReactElement | null {
  const { key, ...baseProps } = props;
  return useMemo(() => <WidgetComponentBase {...baseProps} />, [baseProps]);
}

WidgetComponent.displayName = 'WidgetComponent';

// Placeholder widget components until they're implemented
function EnvironmentalConditionsWidget(): ReactElement {
  return <View />;
}

function WindWidget(): ReactElement {
  return <View />;
}

function RoundTrackerWidget(): ReactElement {
  return <View />;
}

function CompassWidget(): ReactElement {
  return <View />;
}

export function DashboardScreen(): ReactElement {
  const { activeLayout, removeWidget } = useDashboard();

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <YStack flex={1} padding="$4">
        <XStack justifyContent="space-between" alignItems="center" marginBottom="$4">
          <Text fontSize="$6" fontWeight="bold">
            Dashboard
          </Text>
          <XStack gap="$1">
            <Button
              leftIcon={Edit}
              color="$gray11"
              hoverStyle={{ color: '$blue10' }}
              onPress={() => {}}
              aria-label="Edit dashboard layout"
            />
            <Button
              leftIcon={Plus}
              color="$gray11"
              hoverStyle={{ color: '$blue10' }}
              onPress={() => {}}
              aria-label="Add new widget"
            />
          </XStack>
        </XStack>

        <View style={{ flex: 1 }}>
          {activeLayout.widgets.map((widget: Widget) => {
            const commonProps = {
              id: widget.id,
              onRemove: () => removeWidget(widget.id)
            };

            switch (widget.type) {
              case 'environmental':
                return (
                  <WidgetComponent
                    {...commonProps}
                    key={widget.id}
                    title="Environmental Conditions"
                  >
                    <EnvironmentalConditionsWidget />
                  </WidgetComponent>
                );
              case 'wind':
                return (
                  <WidgetComponent
                    {...commonProps}
                    key={widget.id}
                    title="Wind"
                  >
                    <WindWidget />
                  </WidgetComponent>
                );
              case 'round':
                return (
                  <WidgetComponent
                    {...commonProps}
                    key={widget.id}
                    title="Round Tracker"
                  >
                    <RoundTrackerWidget />
                  </WidgetComponent>
                );
              case 'compass':
                return (
                  <WidgetComponent
                    {...commonProps}
                    key={widget.id}
                    title="Compass"
                  >
                    <CompassWidget />
                  </WidgetComponent>
                );
              default:
                return null;
            }
          })}
        </View>
      </YStack>
    </SafeAreaView>
  );
}

DashboardScreen.displayName = 'DashboardScreen';
