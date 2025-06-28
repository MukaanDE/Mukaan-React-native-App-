import React, { useState, useRef } from 'react';
import {
  TouchableOpacity,
  Animated,
  StyleSheet,
  Text,
  View,
  Platform,
} from 'react-native';
import { BlurView } from 'expo-blur';

const LiquidGlassButton = ({ 
  title, 
  onPress, 
  style, 
  textStyle,
  disabled = false 
}) => {
  const [isPressed, setIsPressed] = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;
  const shadowOpacityAnim = useRef(new Animated.Value(1)).current;
  const shadowRadiusAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    if (disabled) return;
    
    setIsPressed(true);

    // Native Animationen (scale, opacity)
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 0.95,
        useNativeDriver: true,
        tension: 300,
        friction: 8,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0.8,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    // JS-basierte Animationen (shadow) separat
    Animated.parallel([
      Animated.timing(shadowOpacityAnim, {
        toValue: 0.3,
        duration: 100,
        useNativeDriver: false,
      }),
      Animated.timing(shadowRadiusAnim, {
        toValue: 0.3,
        duration: 100,
        useNativeDriver: false,
      }),
    ]).start();
  };

  const handlePressOut = () => {
    if (disabled) return;
    
    setIsPressed(false);

    // Native Animationen (scale, opacity)
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 300,
        friction: 8,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();

    // JS-basierte Animationen (shadow) separat
    Animated.parallel([
      Animated.timing(shadowOpacityAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: false,
      }),
      Animated.timing(shadowRadiusAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: false,
      }),
    ]).start();
  };

  const shadowOpacity = shadowOpacityAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.1, 0.3],
  });

  const shadowRadius = shadowRadiusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [4, 12],
  });

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ scale: scaleAnim }],
          opacity: opacityAnim,
          shadowOpacity,
          shadowRadius,
        },
        style,
      ]}
    >
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
        disabled={disabled}
        style={styles.touchable}
      >
        <BlurView 
          intensity={isPressed ? 60 : 80} 
          tint="dark" 
          style={[
            styles.glassBackground,
            {
              borderColor: isPressed 
                ? 'rgba(255, 255, 255, 0.2)' 
                : 'rgba(255, 255, 255, 0.3)',
            }
          ]}
        >
          <Text style={[styles.text, textStyle]}>
            {title}
          </Text>
        </BlurView>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  touchable: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  glassBackground: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  text: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default LiquidGlassButton; 