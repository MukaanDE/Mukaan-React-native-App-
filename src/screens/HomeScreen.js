import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
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
  Platform,
} from 'react-native';
import PlatformIcon from '../components/PlatformIcon';
import { BlurView } from 'expo-blur';
import PostCard from '../components/PostCard';
import { fetchPosts } from '../api/wordpress';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');
const scale = width / 375;

const normalize = (size) => Math.round(scale * size);

const SocialButton = React.memo(({ onPress, iconName, iconColor }) => {
  return (
    <TouchableOpacity 
      onPress={onPress} 
      style={styles.socialButtonContainer}
      activeOpacity={0.8}
      delayPressIn={0}
      delayPressOut={0}
      delayLongPress={0}
    >
      <BlurView 
        intensity={20} 
        tint="dark" 
        style={[
          styles.socialButton,
          {
            borderColor: 'rgba(255, 255, 255, 0.1)',
            borderWidth: 1,
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
    </TouchableOpacity>
  );
});

const KabelKraftBanner = ({ onPress }) => (
  <View style={styles.kabelkraftBannerWrapper}>
    <TouchableOpacity onPress={onPress} activeOpacity={0.85}>
      <Image 
        source={require('../../assets/kabelkraft_banner.png')} 
        style={styles.kabelKraftLogo}
        resizeMode="contain"
      />
    </TouchableOpacity>
  </View>
);

const HomeScreen = ({ navigation }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const insets = useSafeAreaInsets();

  // URL-Preloading für schnellere Link-Öffnung
  useEffect(() => {
    const preloadUrls = [
      'https://www.instagram.com/mukaan.de/',
      'https://youtube.com/@mukaan',
      'https://www.twitch.tv/mukaaanTV',
      'https://www.tiktok.com/@muhammed_kaan',
      'https://whatsapp.com/channel/0029Va7JWL8CcW4sTGsJt942',
      'https://kabelkraft.com/discount/MUKAAN'
    ];
    
    // Preload URLs im Hintergrund
    preloadUrls.forEach(url => {
      Linking.canOpenURL(url).catch(() => {});
    });
  }, []);

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

  const handlePostPress = useCallback((post) => {
    navigation.navigate('PostDetail', { postId: post.id });
  }, [navigation]);

  const handleSocialMediaPress = (url) => {
    Linking.openURL(url).catch(error => {
      console.error('Fehler beim Öffnen des Links:', error);
      Alert.alert('Fehler', 'Link konnte nicht geöffnet werden.');
    });
  };

  const handleKabelKraftPress = () => {
    const url = 'https://kabelkraft.com/discount/MUKAAN';
    Linking.openURL(url).catch(error => {
      console.error('Fehler beim Öffnen des KabelKraft-Links:', error);
      Alert.alert('Fehler', 'Link konnte nicht geöffnet werden.');
    });
  };

  // Direkte Link-Funktionen für maximale Geschwindigkeit
  const openInstagram = useCallback(() => Linking.openURL('https://www.instagram.com/mukaan.de/').catch(() => {}), []);
  const openYouTube = useCallback(() => Linking.openURL('https://youtube.com/@mukaan').catch(() => {}), []);
  const openTwitch = useCallback(() => Linking.openURL('https://www.twitch.tv/mukaaanTV').catch(() => {}), []);
  const openTikTok = useCallback(() => Linking.openURL('https://www.tiktok.com/@muhammed_kaan').catch(() => {}), []);
  const openWhatsApp = useCallback(() => Linking.openURL('https://whatsapp.com/channel/0029Va7JWL8CcW4sTGsJt942').catch(() => {}), []);
  const openKabelKraft = useCallback(() => Linking.openURL('https://kabelkraft.com/discount/MUKAAN').catch(() => {}), []);

  const renderFooter = () => {
    if (!loading || refreshing || !hasMore) return null;
    return (
      <View style={styles.footer}>
        <ActivityIndicator size="small" color="#FFFFFF" />
      </View>
    );
  };

  const renderHeader = () => (
    <>
      <View style={styles.header}>
        <Image source={require('../../assets/logo.png')} style={styles.logo} />
      </View>
      <View style={styles.socialGrid}>
        <SocialButton onPress={openInstagram} iconName="logo-instagram" iconColor="#E4405F" />
        <SocialButton onPress={openYouTube} iconName="logo-youtube" iconColor="#FF0000" />
        <SocialButton onPress={openTwitch} iconName="logo-twitch" iconColor="#6441a5" />
        <SocialButton onPress={openTikTok} iconName="logo-tiktok" iconColor="#ffffff" />
        <SocialButton onPress={openWhatsApp} iconName="logo-whatsapp" iconColor="#25D366" />
      </View>
      <View style={styles.kabelkraftHeaderContainer}>
        <TouchableOpacity onPress={openKabelKraft} activeOpacity={0.85}>
          <Image
            source={require('../../assets/kabelkraft_banner.png')}
            style={styles.kabelkraftHeaderLogo}
            resizeMode="contain"
          />
        </TouchableOpacity>
        <TouchableOpacity style={styles.kabelkraftHeaderButton} onPress={openKabelKraft} activeOpacity={0.85}>
          <Text style={styles.kabelkraftHeaderButtonText}>Jetzt bestellen</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.sectionTitle}>Aktuelle Beiträge</Text>
    </>
  );

  if (loading && posts.length === 0 && !refreshing) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FFFFFF" />
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
            contentContainerStyle={[styles.listContentContainer, { paddingTop: insets.top + normalize(40) }]}
            initialNumToRender={5}
            maxToRenderPerBatch={5}
            windowSize={7}
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
  },
  kabelkraftSection: {
    marginTop: 18,
    marginBottom: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  kabelkraftBannerWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginTop: 8,
    marginBottom: 12,
  },
  kabelKraftLogo: {
    width: '100%',
    height: normalize(40),
    resizeMode: 'contain',
    marginBottom: 0,
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
    // Schatten entfernt für bessere Performance
  },
  glassyButtonWrapper: {
    marginTop: 0,
    marginBottom: 10,
    borderRadius: 16,
    overflow: 'hidden',
    alignSelf: 'center',
    width: 130,
    elevation: 4,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  glassyButton: {
    backgroundColor: 'rgba(255, 215, 0, 0.4)',
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glassyButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0,0,0,0.10)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  bestellButtonWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginBottom: 18,
  },
  kabelkraftHeaderContainer: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 8,
  },
  kabelkraftHeaderLogo: {
    width: 220,
    height: 48,
    marginBottom: 18,
  },
  kabelkraftHeaderButton: {
    backgroundColor: 'rgba(178,163,105,0.8)',
    borderRadius: 32,
    paddingVertical: 12,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    minWidth: 160,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  kabelkraftHeaderButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 0.5,
  },
});

export default HomeScreen;
