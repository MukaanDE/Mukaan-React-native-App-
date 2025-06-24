import React, { useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { View, StyleSheet, Dimensions, Animated, TouchableOpacity, Text, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import HomeScreen from '../screens/HomeScreen';
import CategoryScreen from '../screens/CategoryScreen';
import SearchScreen from '../screens/SearchScreen';
import PostScreen from '../screens/PostScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();
const { width } = Dimensions.get('window');
const scale = width / 375;
const normalize = (size) => Math.round(scale * size);

// Stack für HomeScreen mit PostScreen
const HomeStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="HomeMain" component={HomeScreen} />
    <Stack.Screen name="PostDetail" component={PostScreen} />
  </Stack.Navigator>
);

// Separate Stacks für jede Kategorie
const DealsStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="CategoryMain" component={CategoryScreen} initialParams={{ categoryId: 6 }} />
    <Stack.Screen name="PostDetail" component={PostScreen} />
  </Stack.Navigator>
);

const TippsStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="CategoryMain" component={CategoryScreen} initialParams={{ categoryId: 15 }} />
    <Stack.Screen name="PostDetail" component={PostScreen} />
  </Stack.Navigator>
);

const PCStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="CategoryMain" component={CategoryScreen} initialParams={{ categoryId: 10 }} />
    <Stack.Screen name="PostDetail" component={PostScreen} />
  </Stack.Navigator>
);

const AppsStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="CategoryMain" component={CategoryScreen} initialParams={{ categoryId: 7 }} />
    <Stack.Screen name="PostDetail" component={PostScreen} />
  </Stack.Navigator>
);

const CustomTabBar = ({ state, descriptors, navigation }) => {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [hoverAnimations] = useState(() => 
    state.routes.map(() => new Animated.Value(0))
  );

  const handleTabPress = (route, index) => {
    const event = navigation.emit({
      type: 'tabPress',
      target: route.key,
      canPreventDefault: true,
    });

    if (!event.defaultPrevented) {
      navigation.navigate(route.name);
    }
  };

  const handleTabHover = (index, isHovered) => {
    setHoveredIndex(isHovered ? index : null);
    
    Animated.timing(hoverAnimations[index], {
      toValue: isHovered ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const getIconName = (routeName) => {
    switch (routeName) {
      case 'Home': return 'home';
      case 'Deals': return 'pricetag';
      case 'Suche': return 'search';
      case 'Tipps': return 'bulb';
      case 'PC': return 'desktop';
      case 'Apps': return 'apps';
      default: return 'home';
    }
  };

  return (
    <View style={styles.tabBarContainer}>
      <BlurView intensity={95} tint="dark" style={styles.tabBar}>
        <View style={styles.milkGlassOverlay} />
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;
          const isHovered = hoveredIndex === index;

          const scale = hoverAnimations[index].interpolate({
            inputRange: [0, 1],
            outputRange: [1, 1.05],
          });

          const opacity = hoverAnimations[index].interpolate({
            inputRange: [0, 1],
            outputRange: [0.9, 1],
          });

          const glowOpacity = hoverAnimations[index].interpolate({
            inputRange: [0, 1],
            outputRange: [0, 0.15],
          });

          return (
            <TouchableOpacity
              key={route.key}
              style={styles.tabButton}
              onPress={() => handleTabPress(route, index)}
              onPressIn={() => handleTabHover(index, true)}
              onPressOut={() => handleTabHover(index, false)}
              activeOpacity={0.9}
            >
              <Animated.View
                style={[
                  styles.tabContent,
                  {
                    transform: [{ scale }],
                    opacity,
                  }
                ]}
              >
                {/* Glow Effect */}
                <Animated.View
                  style={[
                    styles.glowEffect,
                    {
                      opacity: glowOpacity,
                      backgroundColor: isFocused ? '#FFFFFF' : 'rgba(255, 255, 255, 0.03)',
                    }
                  ]}
                />
                
                {/* Glass Background */}
                <BlurView 
                  intensity={isHovered ? 80 : 60} 
                  tint="dark" 
                  style={[
                    styles.glassBackground,
                    {
                      borderColor: isFocused ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.1)',
                      borderWidth: isFocused ? 1.2 : 0.8,
                    }
                  ]}
                >
                  <Ionicons
                    name={getIconName(route.name)}
                    size={normalize(18)}
                    color={isFocused ? '#FFFFFF' : 'rgba(255, 255, 255, 0.8)'}
                    style={styles.tabIcon}
                  />
                </BlurView>
                
                {/* Tab Label */}
                <Text style={[
                  styles.tabLabel,
                  {
                    color: isFocused ? '#FFFFFF' : 'rgba(255, 255, 255, 0.8)',
                  }
                ]}>
                  {route.name}
                </Text>
              </Animated.View>
            </TouchableOpacity>
          );
        })}
      </BlurView>
    </View>
  );
};

const Tabs = () => {
  return (
    <Tab.Navigator
      tabBar={props => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeStack}
        options={{ headerShown: false }}
      />
      <Tab.Screen 
        name="Deals" 
        component={DealsStack}
        options={{ headerShown: false }}
      />
      <Tab.Screen 
        name="Suche" 
        component={SearchScreen}
        options={{ headerShown: false }}
      />
      <Tab.Screen 
        name="Tipps" 
        component={TippsStack}
        options={{ headerShown: false }}
      />
      <Tab.Screen 
        name="PC" 
        component={PCStack}
        options={{ headerShown: false }}
      />
      <Tab.Screen 
        name="Apps" 
        component={AppsStack}
        options={{ headerShown: false }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBarContainer: {
    position: 'absolute',
    bottom: -5,
    left: 0,
    right: 0,
  },
  tabBar: {
    flexDirection: 'row',
    borderRadius: 0,
    overflow: 'hidden',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 15,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: normalize(8),
    paddingBottom: normalize(20),
    paddingHorizontal: normalize(0.5),
  },
  tabContent: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    height: normalize(50),
  },
  glowEffect: {
    position: 'absolute',
    width: normalize(50),
    height: normalize(50),
    borderRadius: normalize(25),
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
    top: normalize(0),
  },
  glassBackground: {
    width: normalize(36),
    height: normalize(36),
    borderRadius: normalize(18),
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
    ...Platform.select({
      ios: {
        overflow: 'hidden',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
      },
      android: {
        backgroundColor: 'transparent',
      },
    }),
  },
  tabIcon: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    ...Platform.select({
      ios: {
        textAlign: 'center',
        lineHeight: normalize(18),
      },
      android: {
        textAlignVertical: 'center',
      },
    }),
  },
  tabLabel: {
    fontSize: normalize(9),
    fontWeight: '500',
    textAlign: 'center',
    marginTop: normalize(2),
    letterSpacing: 0.3,
  },
  milkGlassOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
});

export default Tabs; 