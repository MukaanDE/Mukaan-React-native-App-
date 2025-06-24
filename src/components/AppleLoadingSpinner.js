import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import { BlurView } from 'expo-blur';

const { width } = Dimensions.get('window');
const scale = width / 375;
const normalize = (size) => Math.round(scale * size);

const AppleLoadingSpinner = ({ size = 'medium', show = false }) => {
  const spinValue = useRef(new Animated.Value(0)).current;
  const opacityValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (show) {
      // Fade in
      Animated.timing(opacityValue, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      // Start spinning
      Animated.loop(
        Animated.timing(spinValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        })
      ).start();
    } else {
      // Fade out
      Animated.timing(opacityValue, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [show]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const getSize = () => {
    switch (size) {
      case 'small': return normalize(20);
      case 'large': return normalize(40);
      default: return normalize(30);
    }
  };

  if (!show) return null;

  return (
    <Animated.View 
      style={[
        styles.container,
        {
          opacity: opacityValue,
          width: getSize(),
          height: getSize(),
        }
      ]}
    >
      <BlurView intensity={20} tint="dark" style={styles.blurContainer}>
        <Animated.View
          style={[
            styles.spinner,
            {
              width: getSize() - normalize(8),
              height: getSize() - normalize(8),
              transform: [{ rotate: spin }],
            }
          ]}
        >
          <View style={[styles.spinnerSegment, styles.segment1]} />
          <View style={[styles.spinnerSegment, styles.segment2]} />
          <View style={[styles.spinnerSegment, styles.segment3]} />
          <View style={[styles.spinnerSegment, styles.segment4]} />
        </Animated.View>
      </BlurView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  blurContainer: {
    borderRadius: normalize(20),
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  spinner: {
    position: 'relative',
  },
  spinnerSegment: {
    position: 'absolute',
    width: 2,
    height: '25%',
    backgroundColor: '#FFFFFF',
    borderRadius: 1,
  },
  segment1: {
    top: 0,
    left: '50%',
    marginLeft: -1,
    opacity: 1,
  },
  segment2: {
    top: '25%',
    right: 0,
    opacity: 0.7,
  },
  segment3: {
    bottom: '25%',
    right: 0,
    opacity: 0.4,
  },
  segment4: {
    bottom: 0,
    left: '50%',
    marginLeft: -1,
    opacity: 0.1,
  },
});

export default AppleLoadingSpinner; 