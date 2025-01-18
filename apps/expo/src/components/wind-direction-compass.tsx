import React from 'react';
import type { ViewStyle } from 'react-native';
import { View } from 'react-native';
import { Canvas, Path, Circle, LinearGradient, vec, Group, RadialGradient } from '@shopify/react-native-skia';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

interface WindDirectionCompassProps {
  windDirection: number;
  shotDirection: number;
  size?: number;
  onChange?: (type: 'wind' | 'shot', degrees: number) => void;
  lockShot?: boolean;
}

const containerStyle = (size: number): ViewStyle => ({
  position: 'relative',
  width: size,
  height: size,
});

const canvasStyle: ViewStyle = {
  flex: 1,
};

function WindDirectionCompass({
  windDirection,
  shotDirection,
  size = 280,
  onChange,
  lockShot = false,
}: WindDirectionCompassProps) {
  const center = size / 2;
  const radius = (size / 2) * 0.8;

  // Convert degrees to radians with 90-degree offset (like web version)
  const windRad = ((windDirection - 90) * Math.PI) / 180;
  const shotRad = ((shotDirection - 90) * Math.PI) / 180;

  // Handle touch gestures
  const gesture = Gesture.Pan()
    .onUpdate((e) => {
      if (!onChange) return;

      const dx = e.x - center;
      const dy = e.y - center;
      let angle = Math.atan2(dy, dx) * 180 / Math.PI + 90;
      if (angle < 0) angle += 360;

      onChange('wind', Math.round(angle % 360));
    });

  const canvasContent = (
    <>
      {/* Outer glow */}
      <Circle cx={center} cy={center} r={radius * 1.05}>
        <RadialGradient
          c={vec(center, center)}
          r={radius * 1.05}
          colors={['rgba(75, 85, 99, 0.4)', 'rgba(75, 85, 99, 0)']}
        />
      </Circle>

      {/* Main circle with gradient */}
      <Circle cx={center} cy={center} r={radius} style="fill">
        <RadialGradient
          c={vec(center, center)}
          r={radius}
          colors={['rgba(31, 41, 55, 0.4)', 'rgba(17, 24, 39, 0.4)']}
        />
      </Circle>

      {/* Circle border */}
      <Circle
        cx={center}
        cy={center}
        r={radius}
        style="stroke"
        strokeWidth={2}
        color="rgba(75, 85, 99, 1)"
      />

      {/* Concentric rings */}
      {[0.25, 0.5, 0.75].map((scale, i) => (
        <Circle
          key={i}
          cx={center}
          cy={center}
          r={radius * scale}
          style="stroke"
          strokeWidth={1}
          color="rgba(75, 85, 99, 0.3)"
        />
      ))}

      {/* Shot direction */}
      <Group>
        {/* Shot direction glow */}
        <Path
          path={`M ${center} ${center} L ${center + Math.cos(shotRad) * radius} ${
            center + Math.sin(shotRad) * radius
          }`}
          style="stroke"
          strokeWidth={8}
          color="rgba(16, 185, 129, 0.3)"
        />

        {/* Shot direction line */}
        <Path
          path={`M ${center} ${center} L ${center + Math.cos(shotRad) * radius} ${
            center + Math.sin(shotRad) * radius
          }`}
          style="stroke"
          strokeWidth={3}
        >
          <LinearGradient
            start={vec(center, center)}
            end={vec(
              center + Math.cos(shotRad) * radius,
              center + Math.sin(shotRad) * radius
            )}
            colors={['#065f46', '#10B981']}
          />
        </Path>

        {/* Shot arrow head */}
        <Path
          path={`M ${center + Math.cos(shotRad) * radius - Math.cos(shotRad - Math.PI/6) * 15} ${
            center + Math.sin(shotRad) * radius - Math.sin(shotRad - Math.PI/6) * 15
          } L ${center + Math.cos(shotRad) * radius} ${
            center + Math.sin(shotRad) * radius
          } L ${center + Math.cos(shotRad) * radius - Math.cos(shotRad + Math.PI/6) * 15} ${
            center + Math.sin(shotRad) * radius - Math.sin(shotRad + Math.PI/6) * 15
          }`}
          color="#10B981"
          style="fill"
        />
      </Group>

      {/* Wind direction */}
      <Group>
        {/* Wind particles */}
        {Array.from({ length: 12 }).map((_, i) => {
          const distance = (i * radius) / 12;
          const x = center + Math.cos(windRad) * radius - Math.cos(windRad) * distance;
          const y = center + Math.sin(windRad) * radius - Math.sin(windRad) * distance;
          const particleSize = 3 + (i / 12) * 6;

          return (
            <Circle
              key={i}
              cx={x}
              cy={y}
              r={particleSize}
              color={`rgba(59, 130, 246, ${0.2 + (i / 12) * 0.8})`}
            />
          );
        })}

        {/* Wind line glow */}
        <Path
          path={`M ${center + Math.cos(windRad) * radius} ${
            center + Math.sin(windRad) * radius
          } L ${center} ${center}`}
          style="stroke"
          strokeWidth={12}
          color="rgba(59, 130, 246, 0.3)"
        />

        {/* Wind line */}
        <Path
          path={`M ${center + Math.cos(windRad) * radius} ${
            center + Math.sin(windRad) * radius
          } L ${center} ${center}`}
          style="stroke"
          strokeWidth={4}
        >
          <LinearGradient
            start={vec(center + Math.cos(windRad) * radius, center + Math.sin(windRad) * radius)}
            end={vec(center, center)}
            colors={['#3B82F6', '#1e40af']}
          />
        </Path>

        {/* Wind arrows */}
        {Array.from({ length: 5 }).map((_, i) => {
          const angleOffset = ((i - 2) * Math.PI) / 8;
          const arrowBaseX = center + Math.cos(windRad) * radius + Math.cos(windRad + angleOffset) * 15;
          const arrowBaseY = center + Math.sin(windRad) * radius + Math.sin(windRad + angleOffset) * 15;

          return (
            <Path
              key={i}
              path={`
                M ${arrowBaseX - Math.cos(windRad) * 25} ${arrowBaseY - Math.sin(windRad) * 25}
                L ${arrowBaseX + Math.cos(windRad + Math.PI/2) * 12} ${arrowBaseY + Math.sin(windRad + Math.PI/2) * 12}
                L ${arrowBaseX + Math.cos(windRad - Math.PI/2) * 12} ${arrowBaseY + Math.sin(windRad - Math.PI/2) * 12}
                Z
              `}
            >
              <LinearGradient
                start={vec(arrowBaseX, arrowBaseY)}
                end={vec(arrowBaseX - Math.cos(windRad) * 25, arrowBaseY - Math.sin(windRad) * 25)}
                colors={['#3B82F6', '#1e40af']}
              />
            </Path>
          );
        })}
      </Group>
    </>
  );

  return React.createElement(
    View,
    { style: containerStyle(size) },
    React.createElement(
      GestureDetector,
      { gesture },
      React.createElement(
        Canvas,
        { style: canvasStyle },
        canvasContent
      )
    )
  );
}

export default WindDirectionCompass;
