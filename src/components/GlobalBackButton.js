import React from 'react';
import { TouchableOpacity, StyleSheet, Dimensions, Platform } from 'react-native';
import PlatformIcon from './PlatformIcon';
import RoundedContainer from './RoundedContainer';

const { width } = Dimensions.get('window');
const scale = width / 375;
const normalize = (size) => Math.round(scale * size);

const GlobalBackButton = ({ onPress, style }) => {
  return (
    <TouchableOpacity onPress={onPress} style={[styles.permanentBackButton, style]}>
      <RoundedContainer 
        style={styles.backButtonBlur}
        backgroundColor="rgba(0, 0, 0, 0.6)"
        borderRadius={25}
      >
        <PlatformIcon name="arrow-back" size={24} color="#FFFFFF" />
      </RoundedContainer>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  permanentBackButton: {
    position: 'absolute',
    bottom: normalize(65), // Noch weiter nach unten
    left: normalize(16),
    zIndex: 1000,
    borderRadius: normalize(25),
    overflow: 'hidden',
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  backButtonBlur: {
    padding: normalize(14),
    borderRadius: normalize(25),
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
});

export default GlobalBackButton; 