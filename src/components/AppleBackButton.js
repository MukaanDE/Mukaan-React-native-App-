import React, { useRef } from 'react';
import { TouchableOpacity, StyleSheet, Animated, Dimensions, Platform } from 'react-native';
import PlatformIcon from './PlatformIcon';
import RoundedContainer from './RoundedContainer';

const { width } = Dimensions.get('window');
const scale = width / 375;
const normalize = (size) => Math.round(scale * size);

const AppleBackButton = ({ onPress, style, show = true }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(show ? 1 : 0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  const handlePressIn = () => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(glowAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: false,
      }),
    ]).start();
  };

  const handlePressOut = () => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(glowAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }),
    ]).start();
  };

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.3],
  });

  if (!show) return null;

  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[styles.container, style]}
      activeOpacity={1}
    >
      {/* Glow Effect */}
      <Animated.View
        style={[
          styles.glowEffect,
          {
            opacity: glowOpacity,
          }
        ]}
      />
      
      {/* Button */}
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <RoundedContainer 
          style={styles.buttonBlur}
          backgroundColor="rgba(0, 0, 0, 0.6)"
          borderRadius={25}
        >
          <PlatformIcon 
            name="chevron-back" 
            size={24} 
            color="#FFFFFF" 
          />
        </RoundedContainer>
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 40,
    left: 40,
    zIndex: 1000,
    borderRadius: normalize(28),
    overflow: 'hidden',
  },
  glowEffect: {
    position: 'absolute',
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    borderRadius: normalize(27),
    backgroundColor: '#FFFFFF',
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: normalize(15),
    elevation: 10,
  },
  buttonBlur: {
    padding: normalize(14),
    borderRadius: normalize(25),
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
});

export default AppleBackButton; 