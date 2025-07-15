import React, { useState, useEffect, useRef } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, Dimensions, Text, ScrollView, Platform, Animated } from 'react-native';
import PlatformIcon from './PlatformIcon';
import RoundedContainer from './RoundedContainer';
import { fetchPosts, searchPosts } from '../api/wordpress';

const { width } = Dimensions.get('window');
const scale = width / 375;
const normalize = (size) => Math.round(scale * size);

const SearchBar = ({ onSearch, placeholder = "Finde Beiträge, Tipps und mehr..." }) => {
  const [query, setQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  // Lade dynamisch Vorschläge bei Texteingabe ab 2 Buchstaben
  useEffect(() => {
    const loadDynamicSuggestions = async () => {
      if (query.length < 2) {
        setSuggestions([]);
        setShowSuggestions(false);
        return;
      }
      setLoadingSuggestions(true);
      try {
        const results = await searchPosts(query, 1, 10); // Suche nach passenden Beiträgen
        const titles = results.map(post => post.title);
        setSuggestions(titles);
        setShowSuggestions(titles.length > 0);
      } catch (error) {
        setSuggestions([]);
        setShowSuggestions(false);
      } finally {
        setLoadingSuggestions(false);
      }
    };
    loadDynamicSuggestions();
  }, [query]);

  const handleSearch = () => {
    onSearch(query.trim());
    setShowSuggestions(false);
  };

  const handleClear = () => {
    setQuery('');
    onSearch('');
    setShowSuggestions(false);
  };

  const handleSuggestionPress = (suggestion) => {
    setQuery(suggestion);
    onSearch(suggestion);
    setShowSuggestions(false);
  };

  const handleTextChange = (text) => {
    setQuery(text);
  };

  const handleFocus = () => {
    setIsFocused(true);
    setShowSuggestions(query.length > 0);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  // Einfache Filterung für echte Beiträge
  const filteredSuggestions = suggestions.filter(suggestion => {
    const queryLower = query.toLowerCase();
    const suggestionLower = suggestion.toLowerCase();
    
    // Beginnt mit der Suche oder enthält sie
    return suggestionLower.startsWith(queryLower) || suggestionLower.includes(queryLower);
  }).slice(0, 8); // Maximal 8 Vorschläge anzeigen

  return (
    <View style={styles.container}>
      <RoundedContainer 
        style={styles.blurView}
        backgroundColor="rgba(0, 0, 0, 0.6)"
        borderRadius={18}
      >
        <PlatformIcon 
          name="search" 
          size={normalize(20)} 
          color={isFocused ? "#FFFFFF" : "rgba(255, 255, 255, 0.6)"} 
          style={styles.searchIcon} 
        />
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor="rgba(255, 255, 255, 0.6)"
          value={query}
          onChangeText={handleTextChange}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
          selectionColor="#FFFFFF"
          onFocus={handleFocus}
          onBlur={handleBlur}
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
            <PlatformIcon name="close-circle" size={normalize(22)} color="rgba(255, 255, 255, 0.6)" />
          </TouchableOpacity>
        )}
      </RoundedContainer>
      
      {showSuggestions && filteredSuggestions.length > 0 && (
        <View 
          style={styles.suggestionsContainer}
        >
          <RoundedContainer 
            style={styles.suggestionsBlur}
            backgroundColor="rgba(0, 0, 0, 0.6)"
            borderRadius={18}
          >
            <ScrollView style={styles.suggestionsScroll} showsVerticalScrollIndicator={false}>
              {filteredSuggestions.map((suggestion, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.suggestionItem}
                  onPress={() => handleSuggestionPress(suggestion)}
                  activeOpacity={0.7}
                >
                  <PlatformIcon name="search-circle" size={normalize(16)} color="rgba(255, 255, 255, 0.6)" />
                  <Text style={styles.suggestionText}>{suggestion}</Text>
                  <PlatformIcon name="arrow-forward" size={normalize(14)} color="rgba(255, 255, 255, 0.3)" />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </RoundedContainer>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: normalize(16),
    paddingTop: normalize(70),
    paddingBottom: normalize(10),
    position: 'relative',
  },
  blurView: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: normalize(18),
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  blurViewFocused: {
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  searchIcon: {
    marginHorizontal: normalize(12),
  },
  input: {
    flex: 1,
    fontSize: normalize(17),
    color: '#ffffff',
    paddingVertical: normalize(14),
    height: normalize(50),
  },
  clearButton: {
    padding: normalize(12),
  },
  suggestionsContainer: {
    position: 'absolute',
    top: normalize(130),
    left: normalize(16),
    right: normalize(16),
    maxHeight: normalize(300),
    zIndex: 1000,
  },
  suggestionsBlur: {
    borderRadius: normalize(18),
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  suggestionsScroll: {
    maxHeight: normalize(300),
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: normalize(14),
    paddingHorizontal: normalize(16),
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  suggestionText: {
    marginLeft: normalize(12),
    fontSize: normalize(16),
    color: '#ffffff',
    flex: 1,
  },
});

export default SearchBar; 