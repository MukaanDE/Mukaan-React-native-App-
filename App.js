import React from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Tabs from './src/navigation/Tabs';
import { View } from 'react-native';

const MukaanDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: '#000',
    card: '#000',
    primary: '#fff',
    text: '#fff',
    border: 'rgba(255,255,255,0.1)',
    notification: '#fff',
  },
};

export default function App() {
  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      <StatusBar style="light" backgroundColor="#000" />
      <SafeAreaProvider style={{ backgroundColor: '#000' }}>
        <NavigationContainer theme={MukaanDarkTheme}>
          <Tabs />
        </NavigationContainer>
      </SafeAreaProvider>
    </View>
  );
}
