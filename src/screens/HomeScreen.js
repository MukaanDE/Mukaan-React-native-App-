import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Linking,
  Alert,
  Image,
  Dimensions,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  SafeAreaView,
  ActivityIndicator,
  Animated,
} from 'react-native';
import PlatformIcon from '../components/PlatformIcon';
import { BlurView } from 'expo-blur';
import PostCard from '../components/PostCard';
import { fetchPosts } from '../api/wordpress';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');
const scale = width / 375;

const normalize = (size) => Math.round(scale * size);

const SocialButton = ({ onPress, iconName, iconColor }) => {
  const [isPressed, setIsPressed] = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  const handlePressIn = () => {
    setIsPressed(true);
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
    setIsPressed(false);
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

  return (
    <TouchableOpacity 
      onPress={onPress} 
      style={styles.socialButtonContainer}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={1}
    >
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        {/* Glow Effect */}
        <Animated.View
          style={[
            styles.socialGlowEffect,
            {
              opacity: glowAnim,
              backgroundColor: iconColor,
            }
          ]}
        />
        
        {/* Glass Background */}
        <BlurView 
          intensity={isPressed ? 60 : 40} 
          tint="dark" 
          style={[
            styles.socialButton,
            {
              borderColor: isPressed ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.1)',
              borderWidth: isPressed ? 1.5 : 1,
            }
          ]}
        >
          <PlatformIcon 
            name={iconName} 
            size={normalize(30)} 
            color={iconColor} 
            style={styles.socialIcon}
          />
        </BlurView>
      </Animated.View>
    </TouchableOpacity>
  );
};

const KabelKraftButton = ({ onPress }) => (
     <TouchableOpacity onPress={onPress} style={styles.kabelKraftButtonContainer}>
        <Image 
            source={require('../../assets/kabelkraft_banner.png')} 
            style={styles.kabelKraftLogo}
            resizeMode="contain"
        />
    </TouchableOpacity>
);

const HomeScreen = ({ navigation }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const insets = useSafeAreaInsets();

  const loadPosts = async (pageNum = 1, refresh = false) => {
    if (refresh) {
      setRefreshing(true);
    }
    setLoading(true);
    try {
      const fetchedPosts = await fetchPosts(pageNum, 10);
      if (refresh || pageNum === 1) {
        setPosts(fetchedPosts);
      } else {
        setPosts(prevPosts => [...prevPosts, ...fetchedPosts]);
      }
      setPage(pageNum);
      setHasMore(fetchedPosts.length === 10);
    } catch (error) {
      console.error('Fehler beim Laden der Beiträge:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    loadPosts(1, true);
  };

  const loadMore = () => {
    if (hasMore && !loading) {
      loadPosts(page + 1, false);
    }
  };

  useEffect(() => {
    loadPosts(1, false);
  }, []);

  const handlePostPress = (post) => {
    navigation.navigate('PostDetail', { postId: post.id });
  };

  const handleSocialMediaPress = async (url) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert("Link kann nicht geöffnet werden", "Es wurde keine App gefunden, um diesen Link zu öffnen.");
      }
    } catch (error) {
      console.error('Fehler beim Öffnen des Links:', error);
      Alert.alert('Fehler', 'Link konnte nicht geöffnet werden.');
    }
  };

  const handleKabelKraftPress = async () => {
    const url = 'https://kabelkraft.com/discount/MUKAAN';
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert("Link kann nicht geöffnet werden", "Es wurde keine App gefunden, um diesen Link zu öffnen.");
      }
    } catch (error) {
      console.error('Fehler beim Öffnen des KabelKraft-Links:', error);
      Alert.alert('Fehler', 'Link konnte nicht geöffnet werden.');
    }
  };

  const renderHeader = () => (
    <>
      <View style={[styles.header, { paddingTop: insets.top + normalize(16) }]}>
        <Image source={require('../../assets/logo.png')} style={styles.logo} />
      </View>
      <View style={styles.socialGrid}>
        <SocialButton onPress={() => handleSocialMediaPress('https://www.instagram.com/mukaan.de/')} iconName="logo-instagram" iconColor="#E4405F" />
        <SocialButton onPress={() => handleSocialMediaPress('https://youtube.com/@mukaan')} iconName="logo-youtube" iconColor="#FF0000" />
        <SocialButton onPress={() => handleSocialMediaPress('https://www.twitch.tv/mukaaanTV')} iconName="logo-twitch" iconColor="#6441a5" />
        <SocialButton onPress={() => handleSocialMediaPress('https://www.tiktok.com/@muhammed_kaan')} iconName="logo-tiktok" iconColor="#ffffff" />
        <SocialButton onPress={() => handleSocialMediaPress('https://whatsapp.com/channel/0029Va7JWL8CcW4sTGsJt942')} iconName="logo-whatsapp" iconColor="#25D366" />
      </View>
      <KabelKraftButton onPress={handleKabelKraftPress} />
      <Text style={styles.sectionTitle}>Aktuelle Beiträge</Text>
    </>
  );

  const renderFooter = () => {
    if (!loading || refreshing || !hasMore) return null;
    return (
      <View style={styles.footer}>
        <ActivityIndicator size="small" color="#FFFFFF" />
      </View>
    );
  };

  if (loading && posts.length === 0 && !refreshing) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Lade MUKAAN...</Text>
      </SafeAreaView>
    );
  }

  return (
     <View style={styles.container}>
        <FlatList
            data={posts}
            renderItem={({ item }) => <PostCard post={item} onPress={handlePostPress} />}
            keyExtractor={(item) => item.id.toString()}
            ListHeaderComponent={renderHeader}
            ListFooterComponent={renderFooter}
            showsVerticalScrollIndicator={false}
            refreshControl={
                <RefreshControl 
                    refreshing={refreshing} 
                    onRefresh={onRefresh} 
                    tintColor="#FFFFFF"
                />
            }
            onEndReached={loadMore}
            onEndReachedThreshold={0.1}
            contentContainerStyle={styles.listContentContainer}
        />
     </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  listContentContainer: {
    paddingBottom: normalize(80),
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: normalize(18),
    fontWeight: '600',
  },
  header: {
    paddingBottom: normalize(16),
    alignItems: 'center',
  },
  logo: {
    width: '80%',
    height: normalize(70),
    resizeMode: 'contain',
  },
  socialGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: normalize(20),
    marginBottom: normalize(20),
    marginTop: normalize(10),
  },
  socialButtonContainer: {
     borderRadius: normalize(18),
     overflow: 'hidden',
     width: width / 6.5,
     height: width / 6.5,
     marginHorizontal: normalize(4),
  },
  socialButton: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: normalize(18),
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  kabelKraftButtonContainer: {
    marginHorizontal: normalize(16),
    marginBottom: normalize(30),
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: normalize(10),
  },
  kabelKraftLogo: {
    width: '100%',
    height: normalize(140),
    resizeMode: 'contain',
  },
  sectionTitle: {
    fontSize: normalize(24),
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: normalize(16),
    paddingHorizontal: normalize(16),
    textAlign: 'center',
  },
  footer: {
    padding: normalize(16),
    alignItems: 'center',
  },
  socialGlowEffect: {
    position: 'absolute',
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    borderRadius: normalize(20),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  socialIcon: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
});

export default HomeScreen; 