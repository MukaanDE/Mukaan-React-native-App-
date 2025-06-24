import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const PlatformIcon = ({ 
  name, 
  size, 
  color, 
  style, 
  containerStyle,
  showBackground = false,
  showRoundedBackground = false,
  backgroundStyle,
  ...props 
}) => {
  const iconElement = (
    <Ionicons
      name={name}
      size={size}
      color={color}
      style={[styles.icon, style]}
      {...props}
    />
  );

  // Wenn kein Hintergrund gewünscht ist, nur das Icon zurückgeben
  if (!showBackground && !showRoundedBackground) {
    return iconElement;
  }

  // Mit abgerundetem Hintergrund für iOS-Optimierung
  if (showRoundedBackground) {
    return (
      <View style={[styles.roundedIconContainer, backgroundStyle, containerStyle]}>
        {iconElement}
      </View>
    );
  }

  // Mit normalem Hintergrund
  return (
    <View style={[styles.iconContainer, backgroundStyle, containerStyle]}>
      {iconElement}
    </View>
  );
};

const styles = StyleSheet.create({
  icon: {
    // Einheitliches Styling für beide Plattformen
    textAlign: 'center',
    ...Platform.select({
      ios: {
        // iOS-spezifische Anpassungen für bessere Darstellung
        lineHeight: undefined, // Wird dynamisch gesetzt
        fontWeight: 'normal',
      },
      android: {
        // Android-Standard beibehalten
        textAlignVertical: 'center',
      },
    }),
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        // iOS-Hintergrund an Android anpassen
        backgroundColor: 'transparent',
        borderRadius: 8,
        overflow: 'hidden',
      },
      android: {
        // Android-Standard
        backgroundColor: 'transparent',
      },
    }),
  },
  roundedIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        // iOS-optimierter abgerundeter Hintergrund
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 8,
        overflow: 'hidden',
        borderWidth: 0.5,
        borderColor: 'rgba(255, 255, 255, 0.1)',
      },
      android: {
        // Android-Standard
        backgroundColor: 'transparent',
      },
    }),
  },
});

export default PlatformIcon; 