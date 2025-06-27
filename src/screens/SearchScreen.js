import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  Keyboard,
  Animated,
  TouchableWithoutFeedback,
  Platform,
} from 'react-native';
import PlatformIcon from '../components/PlatformIcon';
import RoundedContainer from '../components/RoundedContainer';
import PostCard from '../components/PostCard';
import SearchBar from '../components/SearchBar';
import { searchPosts } from '../api/wordpress';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');
const scale = width / 375;
const normalize = (size) => Math.round(scale * size);

const SearchScreen = ({ navigation }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState(null);
  const insets = useSafeAreaInsets();

  const handleSearch = async (query) => {
    if (!query.trim()) {
      setPosts([]);
      setSearched(false);
      setError(null);
      return;
    }

    Keyboard.dismiss();
    setLoading(true);
    setSearched(true);
    setError(null);
    
    try {
      const searchResults = await searchPosts(query, 1, 20);
      setPosts(searchResults);
      if (searchResults.length === 0) setError('Keine Treffer gefunden.');
    } catch (error) {
      setPosts([]);
      setError('Fehler bei der Suche.');
    } finally {
      setLoading(false);
    }
  };

  const handlePostPress = (post) => {
    navigation.navigate('PostDetail', { postId: post.id });
  };

  const renderPost = ({ item }) => (
    <PostCard post={item} onPress={handlePostPress} />
  );

  const renderEmptyState = () => {
    let icon = 'search-circle-outline';
    let title = 'Finde großartige Inhalte';
    let subtitle = 'Suche nach Artikeln, Anleitungen oder Angeboten.';

    if (loading) {
      return (
        <View style={styles.emptyContainer}>
          <RoundedContainer 
            style={styles.loadingBlur}
            backgroundColor="rgba(0, 0, 0, 0.6)"
          >
            <ActivityIndicator size="large" color="#FFFFFF" />
            <Text style={styles.loadingText}>Suche läuft...</Text>
          </RoundedContainer>
        </View>
      );
    }

    if (error) {
      icon = 'sad-outline';
      title = 'Nichts gefunden';
      subtitle = error;
    }

    return (
      <View style={styles.emptyContainer}>
        <RoundedContainer 
          style={styles.emptyBlur}
          backgroundColor="rgba(0, 0, 0, 0.6)"
        >
          <PlatformIcon name={icon} size={normalize(80)} color="rgba(255, 255, 255, 0.3)" />
          <Text style={styles.emptyTitle}>{title}</Text>
          <Text style={styles.emptySubtitle}>{subtitle}</Text>
        </RoundedContainer>
      </View>
    );
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={styles.container}>
        <SearchBar onSearch={handleSearch} />
        {posts.length > 0 ? (
          <FlatList
            data={posts}
            renderItem={renderPost}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={[styles.listContainer, { paddingTop: insets.top + normalize(40) }]}
            showsVerticalScrollIndicator={false}
            onScrollBeginDrag={() => Keyboard.dismiss()}
          />
        ) : (
          renderEmptyState()
        )}
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  listContainer: {
    paddingBottom: normalize(90), // Platz für die schwebende TabBar
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: normalize(32),
  },
  emptyBlur: {
    borderRadius: normalize(24),
    padding: normalize(32),
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: normalize(8) },
    shadowOpacity: 0.3,
    shadowRadius: normalize(16),
    elevation: 12,
  },
  loadingBlur: {
    borderRadius: normalize(24),
    padding: normalize(32),
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: normalize(8) },
    shadowOpacity: 0.3,
    shadowRadius: normalize(16),
    elevation: 12,
  },
  loadingText: {
    fontSize: normalize(16),
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: normalize(16),
    textAlign: 'center',
  },
  emptyTitle: {
    fontSize: normalize(22),
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginTop: normalize(20),
    marginBottom: normalize(8),
  },
  emptySubtitle: {
    fontSize: normalize(16),
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    lineHeight: normalize(24),
  },
});

export default SearchScreen; 