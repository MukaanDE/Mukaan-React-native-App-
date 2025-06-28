import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Dimensions, Image } from 'react-native';
import PlatformIcon from './PlatformIcon';
import RoundedContainer from './RoundedContainer';

const { width } = Dimensions.get('window');
const scale = width / 375;
const normalize = (size) => Math.round(scale * size);

const RelatedPosts = ({ posts, onPostPress }) => {
  if (!posts || posts.length === 0) {
    return null;
  }

  const cleanExcerpt = (excerpt) => {
    return excerpt.replace(/<[^>]*>/g, '').replace(/\[&hellip;\]/, '...').trim();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Diese Beiträge könnten dir auch gefallen</Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        {posts.map((post, idx) => (
          <TouchableOpacity
            key={post.id}
            onPress={() => onPostPress(post)}
            activeOpacity={0.8}
          >
            <View style={[styles.postCardWrapper, idx === posts.length - 1 && styles.lastCard]}>
              <View style={styles.postCardRow}>
                <Image
                  source={{ uri: post.featuredImage || 'https://via.placeholder.com/56x56.png?text=Bild' }}
                  style={styles.thumbnail}
                />
                <View style={styles.textContent}>
                  <Text style={styles.postTitle} numberOfLines={2}>
                    {post.title}
                  </Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: normalize(24),
  },
  title: {
    fontSize: normalize(20),
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: normalize(16),
    paddingHorizontal: normalize(16),
  },
  scrollContainer: {
    paddingHorizontal: normalize(16),
    paddingBottom: normalize(5),
  },
  postCardWrapper: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 14,
    marginRight: 14,
    padding: 8,
    minWidth: 210,
    maxWidth: 240,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  lastCard: {
    marginRight: 16,
  },
  postCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  thumbnail: {
    width: 56,
    height: 56,
    borderRadius: 10,
    backgroundColor: '#222',
    marginRight: 12,
  },
  textContent: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  postTitle: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 17,
    marginBottom: 0,
  },
  postFooter: {
    alignItems: 'flex-end',
  },
});

export default RelatedPosts; 