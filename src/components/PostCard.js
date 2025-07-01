import React, { useState, useRef } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions, Animated } from 'react-native';
import RoundedContainer from './RoundedContainer';

const { width } = Dimensions.get('window');
const scale = width / 375;

const normalize = (size) => Math.round(scale * size);

const PostCard = React.memo(({ post, onPress }) => {
  const [isPressed, setIsPressed] = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const handlePressIn = () => {
    setIsPressed(true);
    Animated.timing(scaleAnim, {
      toValue: 0.98,
      duration: 100,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    setIsPressed(false);
    Animated.timing(scaleAnim, {
      toValue: 1,
      duration: 150,
      useNativeDriver: true,
    }).start();
  };

  return (
    <TouchableOpacity 
      onPress={() => onPress(post)} 
      activeOpacity={0.95}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.View 
        style={[
          styles.container,
          {
            transform: [{ scale: scaleAnim }],
          }
        ]}
      >
        <RoundedContainer 
          style={[
            styles.glassBackground,
            {
              borderColor: isPressed ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.1)',
              borderWidth: isPressed ? 1.5 : 1,
            }
          ]}
        >
          <View style={styles.imageContainer}>
            {post.featuredImage ? (
              <Image source={{ uri: post.featuredImage }} style={styles.image} />
            ) : (
              <View style={styles.placeholderImage}>
                <Text style={styles.placeholderText}>MUKAAN</Text>
              </View>
            )}
            {post.categories && post.categories.length > 0 && (
              <RoundedContainer 
                style={styles.categoryBadge}
                borderRadius={20}
                backgroundColor="rgba(0, 0, 0, 0.6)"
              >
                <Text style={styles.categoryText}>{post.categories[0].name}</Text>
              </RoundedContainer>
            )}
          </View>
          
          <View style={styles.content}>
            <Text style={styles.title} numberOfLines={3}>
              {post.title}
            </Text>
            
            <View style={styles.footer}>
              <Text style={styles.date}>{formatDate(post.date)}</Text>
              <RoundedContainer 
                style={styles.readMoreButton}
                borderRadius={20}
                backgroundColor="rgba(0, 0, 0, 0.6)"
              >
                <Text style={styles.readMoreText}>Mehr anzeigen</Text>
              </RoundedContainer>
            </View>
          </View>
        </RoundedContainer>
      </Animated.View>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  container: {
    marginHorizontal: normalize(16),
    marginBottom: normalize(20),
    borderRadius: normalize(12),
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  glassBackground: {
    borderRadius: normalize(12),
    overflow: 'hidden',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: normalize(200),
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(42, 42, 42, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#666',
    fontSize: normalize(18),
    fontWeight: 'bold',
  },
  categoryBadge: {
    position: 'absolute',
    top: normalize(12),
    left: normalize(12),
    paddingHorizontal: normalize(12),
    paddingVertical: normalize(6),
    borderRadius: normalize(20),
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  categoryText: {
    color: '#FFFFFF',
    fontSize: normalize(11),
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  content: {
    padding: normalize(16),
  },
  title: {
    fontSize: normalize(18),
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: normalize(16),
    lineHeight: normalize(24),
    textAlign: 'center',
  },
  footer: {
    flexDirection: 'column',
    alignItems: 'center',
    paddingTop: normalize(12),
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  date: {
    fontSize: normalize(12),
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '500',
    marginBottom: normalize(8),
  },
  readMoreButton: {
    paddingHorizontal: normalize(16),
    paddingVertical: normalize(8),
    borderRadius: normalize(20),
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  readMoreText: {
    color: '#FFFFFF',
    fontSize: normalize(12),
    fontWeight: '600',
  },
});

export default PostCard; 