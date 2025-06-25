import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, useWindowDimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { decode } from 'html-entities';

const RelatedPostCard = ({ post }) => {
  const navigation = useNavigation();
  const { width } = useWindowDimensions();
  
  if (!post) {
    return null;
  }

  const cardWidth = width * 0.7; // 70% der Bildschirmbreite

  return (
    <TouchableOpacity 
      style={[styles.card, { width: cardWidth }]}
      onPress={() => navigation.push('PostDetail', { postId: post.id })}
    >
      <Image 
        source={{ uri: post.featuredImage || 'https://via.placeholder.com/300x180.png?text=Mukaan' }} 
        style={styles.image} 
      />
      <View style={styles.textContainer}>
        <Text style={styles.title} numberOfLines={3}>
          {decode(post.title)}
        </Text>
        <Text style={styles.date}>
          {new Date(post.date).toLocaleDateString('de-DE', { year: 'numeric', month: 'long', day: 'numeric' })}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(30, 30, 30, 0.8)',
    borderRadius: 16,
    marginHorizontal: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
    height: 280, 
  },
  image: {
    width: '100%',
    height: 150,
  },
  textContainer: {
    padding: 12,
    flex: 1,
    justifyContent: 'space-between',
  },
  title: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Inter',
  },
  date: {
    color: '#aaa',
    fontSize: 12,
    marginTop: 8,
  }
});

export default RelatedPostCard; 