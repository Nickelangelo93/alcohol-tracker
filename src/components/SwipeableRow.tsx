import React, { useRef } from 'react';
import { View, Text, StyleSheet, Animated, Platform } from 'react-native';
import { RectButton } from 'react-native-gesture-handler';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { borderRadius, fontSize } from '../constants/theme';

interface SwipeableRowProps {
  children: React.ReactNode;
  onDelete: () => void;
  deleteText?: string;
}

export function SwipeableRow({ children, onDelete, deleteText = 'Delete' }: SwipeableRowProps) {
  const swipeableRef = useRef<Swipeable>(null);

  const renderRightActions = (
    progress: Animated.AnimatedInterpolation<number>,
    dragX: Animated.AnimatedInterpolation<number>,
  ) => {
    const translateX = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [80, 0],
    });

    return (
      <View style={styles.rightActionContainer}>
        <Animated.View style={[styles.rightAction, { transform: [{ translateX }] }]}>
          <RectButton
            style={styles.deleteButton}
            onPress={() => {
              swipeableRef.current?.close();
              onDelete();
            }}
          >
            <Text style={styles.deleteText}>{deleteText}</Text>
          </RectButton>
        </Animated.View>
      </View>
    );
  };

  return (
    <Swipeable
      ref={swipeableRef}
      friction={2}
      rightThreshold={40}
      renderRightActions={renderRightActions}
      overshootRight={false}
    >
      {children}
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  rightActionContainer: {
    width: 80,
  },
  rightAction: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButton: {
    flex: 1,
    backgroundColor: '#ef4444',
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    borderRadius: borderRadius.md,
  },
  deleteText: {
    color: '#ffffff',
    fontSize: fontSize.sm,
    fontWeight: '700',
  },
});
