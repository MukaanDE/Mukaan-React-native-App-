import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';

const RoundedContainer = ({ 
  children, 
  style, 
  borderRadius = 12,
  backgroundColor = 'rgba(0, 0, 0, 0.6)',
  borderColor = 'rgba(255, 255, 255, 0.1)',
  borderWidth = 1,
  ...props 
}) => {
  return (
    <View 
      style={[
        styles.container,
        {
          borderRadius,
          backgroundColor,
          borderColor,
          borderWidth,
        },
        style
      ]}
      {...props}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...Platform.select({
      ios: {
        // iOS-optimierte abgerundete Ecken
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        // Android-Standard
        elevation: 2,
      },
    }),
  },
});

export default RoundedContainer; 