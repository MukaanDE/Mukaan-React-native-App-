import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Dimensions, Platform } from 'react-native';
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
        {posts.map((post) => (
          <TouchableOpacity
            key={post.id}
            onPress={() => onPostPress(post)}
            activeOpacity={0.8}
          >
            <View style={styles.postCardWrapper}>
                <RoundedContainer 
                  style={styles.postCard}
                  backgroundColor="rgba(0, 0, 0, 0.6)"
                >
                    <Text style={styles.postTitle} numberOfLines={3}>
                    {post.title}
                    </Text>
                    <View style={styles.postFooter}>
                        <PlatformIcon name="arrow-forward-circle" size={normalize(30)} color="#FFFFFF" />
                    </View>
                </RoundedContainer>
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
    borderRadius: normalize(18),
    overflow: 'hidden',
    marginRight: normalize(12),
    width: width * 0.6,
    height: width * 0.45,
  },
  postCard: {
    flex: 1,
    justifyContent: 'space-between',
    padding: normalize(16),
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  postTitle: {
    fontSize: normalize(17),
    fontWeight: 'bold',
    color: '#ffffff',
    lineHeight: normalize(24),
  },
  postFooter: {
    alignItems: 'flex-end',
  },
});

export default RelatedPosts; 