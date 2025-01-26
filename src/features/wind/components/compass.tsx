import React, { useRef, useEffect } from 'react';
import { View, PanResponder, StyleSheet } from 'react-native';
import Svg, { Circle, Line, G, Path, Text } from 'react-native-svg';

interface WindDirectionCompassProps {
  windDirection: number;
  shotDirection: number;
  size?: number;
  onChange?: (type: 'wind' | 'shot', degrees: number) => void;
  lockShot?: boolean;
}

export default function WindDirectionCompass({
  windDirection,
  shotDirection,
  size = 280,
  onChange,
  lockShot = true
}: WindDirectionCompassProps) {
  const viewRef = useRef<View>(null);
  
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (evt) => {
        if (!onChange || lockShot) return;
        const { locationX, locationY } = evt.nativeEvent;
        const center = size / 2;
        const dx = locationX - center;
        const dy = locationY - center;
        let angle = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
        if (angle < 0) angle += 360;
        onChange('wind', Math.round(angle % 360));
      }
    })
  ).current;

  return (
    <View 
      ref={viewRef}
      style={[styles.container, { width: size, height: size }]}
      {...panResponder.panHandlers}
    >
      <Svg width={size} height={size}>
        {/* Background Circle */}
        <Circle cx={size/2} cy={size/2} r={size/2 - 10} fill="#111827" stroke="#374151" strokeWidth="2" />

        {/* Shot Direction Arrow */}
        <G transform={`rotate(${shotDirection - 90} ${size/2} ${size/2})`}>
          <Line
            x1={size/2} y1={size/2}
            x2={size/2} y2={20}
            stroke="#10B981"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <Path
            d={`M ${size/2 - 10} 30 L ${size/2} 15 L ${size/2 + 10} 30 Z`}
            fill="#10B981"
          />
        </G>

        {/* Wind Direction Arrow */}
        <G transform={`rotate(${windDirection - 90} ${size/2} ${size/2})`}>
          <Line
            x1={size/2} y1={size/2}
            x2={size/2} y2={20}
            stroke="#3B82F6"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <Path
            d={`M ${size/2 - 10} 30 L ${size/2} 15 L ${size/2 + 10} 30 Z`}
            fill="#3B82F6"
          />
        </G>

        {/* Degree Markings */}
        {[...Array(12)].map((_, i) => {
          const angle = i * 30;
          return (
            <G key={i} transform={`rotate(${angle} ${size/2} ${size/2})`}>
              <Line
                x1={size/2} y1="20"
                x2={size/2} y2={i % 3 === 0 ? "40" : "30"}
                stroke="#4B5563"
                strokeWidth={i % 3 === 0 ? 2 : 1}
              />
              {i % 3 === 0 && (
                <Text
                  x={size/2}
                  y="60"
                  fill="#9CA3AF"
                  fontSize="14"
                  textAnchor="middle"
                  transform={`rotate(${-angle} ${size/2} ${size/2})`}
                >
                  {angle}
                </Text>
              )}
            </G>
          );
        })}

        {/* Wind Direction Label */}
        <Text
          x={size/2}
          y={size - 30}
          fill="#3B82F6"
          fontSize="16"
          fontWeight="bold"
          textAnchor="middle"
        >
          {Math.round(windDirection)}°
        </Text>
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center'
  }
});
