import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  TouchableOpacity,
  Platform,
} from 'react-native';
import PostCard from '../components/PostCard';
import AppleLoadingSpinner from '../components/AppleLoadingSpinner';
import { fetchPostsByCategory, fetchCategories } from '../api/wordpress';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');
const scale = width / 375;
const normalize = (size) => Math.round(scale * size);

const CategoryScreen = ({ route, navigation }) => {
  // Fallback für categoryId, falls nicht gesetzt
  const categoryId = route?.params?.categoryId ?? 6;
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const insets = useSafeAreaInsets();

  const loadPosts = async (pageNum = 1, refresh = false) => {
    if (refresh) setRefreshing(true);
    setLoading(true);
    try {
      const fetchedPosts = await fetchPostsByCategory(categoryId, pageNum, 10);
      if (refresh || pageNum === 1) {
        setPosts(fetchedPosts);
      } else {
        setPosts(prevPosts => {
          const existingIds = new Set(prevPosts.map(p => p.id));
          const newPosts = fetchedPosts.filter(p => !existingIds.has(p.id));
          return [...prevPosts, ...newPosts];
        });
      }
      setPage(pageNum);
      setHasMore(fetchedPosts.length === 10);
    } catch (error) {
      setPosts([]);
      setHasMore(false);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadPosts(1, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryId]);

  const onRefresh = () => {
    loadPosts(1, true);
  };

  const loadMore = () => {
    if (hasMore && !loading) {
      loadPosts(page + 1, false);
    }
  };

  const handlePostPress = (post) => {
    navigation.navigate('PostDetail', { postId: post.id });
  };

  const renderPost = ({ item }) => (
    <PostCard post={item} onPress={handlePostPress} />
  );

  const renderFooter = () => {
    if (!hasMore) return null;
    if (loading && !refreshing) {
      return (
        <View style={styles.footer}>
          <AppleLoadingSpinner size="small" show={true} />
        </View>
      );
    }
    return null;
  };

  if (loading && posts.length === 0 && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <AppleLoadingSpinner size="large" show={true} />
      </View>
    );
  }

  if (!loading && posts.length === 0) {
    return (
        <View style={styles.container}>
            <Text style={styles.emptyText}>In dieser Kategorie gibt es noch keine Beiträge.</Text>
        </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={posts}
        renderItem={renderPost}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={[styles.listContainer, { paddingTop: insets.top + normalize(40) }]}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            tintColor="#FFFFFF"
          />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.1}
        ListFooterComponent={renderFooter}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
  },
  listContainer: {
    paddingBottom: normalize(90),
  },
  footer: {
    padding: normalize(16),
    alignItems: 'center',
  },
  emptyText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: normalize(16),
    textAlign: 'center',
    marginTop: normalize(50),
  },
});

export default CategoryScreen; 