import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  useWindowDimensions,
  TouchableOpacity,
  Linking,
  Alert,
  Platform,
  Share,
  ScrollView,
  Image
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { fetchPostById, fetchCategories, fetchRelatedPosts } from '../api/wordpress';
import AppleLoadingSpinner from '../components/AppleLoadingSpinner';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RenderHTML from 'react-native-render-html';
import { decode } from 'html-entities';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import RelatedPosts from '../components/RelatedPosts';
import WebView from 'react-native-webview';
import TableRenderer, { tableModel } from '@native-html/table-plugin';

const CACHE_PREFIX = 'post_cache_';
const CACHE_TTL = 60 * 60 * 24; // 24 Stunden in Sekunden

const PostScreen = ({ route }) => {
  const { postId } = route.params;
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showLoadingSpinner, setShowLoadingSpinner] = useState(false);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const { width } = useWindowDimensions();
  const navigation = useNavigation();
  const loadingTimeoutRef = useRef(null);
  const insets = useSafeAreaInsets();
  const imgCounter = useRef(0);

  const tableCss = `
    table {
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 12px;
      background-color: rgba(255, 255, 255, 0.05);
      border-collapse: separate;
      border-spacing: 0;
      overflow: hidden;
      margin: 16px 0;
    }
    th {
      color: #fff;
      font-weight: 700;
      font-size: 16px;
      padding: 12px;
      background-color: rgba(255, 255, 255, 0.1);
      text-align: left;
      border-bottom: 1px solid rgba(255, 255, 255, 0.2);
    }
    td {
      color: #fff;
      font-weight: 400;
      font-size: 16px;
      padding: 12px;
      text-align: left;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }
    tr:last-child td {
      border-bottom: 0;
    }
  `;

  const tagsStyles = useMemo(() => ({
    img: {
      marginVertical: 20,
      width: '100%',
      alignSelf: 'center',
    },
    p: {
      color: '#fff',
      fontSize: 17,
      fontFamily: 'System',
      fontWeight: '400',
      lineHeight: 24,
      textAlign: 'left',
      marginBottom: 16,
      marginHorizontal: 20,
    },
    a: {
      color: '#7FDBFF',
      textDecorationLine: 'underline',
      fontSize: 17,
      fontWeight: '500',
      fontFamily: 'System',
    },
    h1: { color: '#fff', fontSize: 34, fontWeight: '700', fontFamily: 'System', marginVertical: 18, textAlign: 'center', lineHeight: 40, letterSpacing: -0.01, marginHorizontal: 20 },
    h2: { color: '#fff', fontSize: 28, fontWeight: '700', fontFamily: 'System', marginVertical: 16, textAlign: 'center', lineHeight: 34, letterSpacing: -0.01, marginHorizontal: 20 },
    h3: { color: '#fff', fontSize: 22, fontWeight: '600', fontFamily: 'System', marginVertical: 14, textAlign: 'center', lineHeight: 28, letterSpacing: -0.01, marginHorizontal: 20 },
    h4: { color: '#fff', fontSize: 20, fontWeight: '600', fontFamily: 'System', marginVertical: 12, textAlign: 'center', lineHeight: 26, letterSpacing: -0.01, marginHorizontal: 20 },
    h5: { color: '#fff', fontSize: 17, fontWeight: '600', fontFamily: 'System', marginVertical: 10, textAlign: 'center', lineHeight: 22, letterSpacing: -0.01, marginHorizontal: 20 },
    h6: { color: '#fff', fontSize: 15, fontWeight: '600', fontFamily: 'System', marginVertical: 8, textAlign: 'center', lineHeight: 20, letterSpacing: -0.01, marginHorizontal: 20 },
    strong: { fontWeight: '700', color: '#fff' },
    b: { fontWeight: '700', color: '#fff' },
    ul: { marginVertical: 16, paddingLeft: 28, marginHorizontal: 20 },
    ol: { marginVertical: 16, paddingLeft: 28, marginHorizontal: 20 },
    li: { fontSize: 17, color: '#fff', lineHeight: 24, marginBottom: 8, fontFamily: 'System' },
    blockquote: { backgroundColor: 'rgba(127,219,255,0.05)', borderLeftWidth: 4, borderLeftColor: '#7FDBFF', marginVertical: 16, paddingVertical: 12, paddingHorizontal: 16, borderRadius: 8, fontStyle: 'italic', color: '#e0e0e0', marginHorizontal: 20 },
    code: { backgroundColor: 'rgba(20,20,20,0.8)', borderRadius: 8, padding: 8, fontFamily: 'Menlo', fontSize: 14, color: '#fff', marginHorizontal: 20 },
  }), []);

  useEffect(() => {
    const getPost = async () => {
      try {
        setLoading(true);
        setShowLoadingSpinner(false);
        
        loadingTimeoutRef.current = setTimeout(() => {
          setShowLoadingSpinner(true);
        }, 2000);
        
        const cacheKey = `${CACHE_PREFIX}${postId}`;
        const cached = await AsyncStorage.getItem(cacheKey);
        let cachedPost = null;
        if (cached) {
          const parsed = JSON.parse(cached);
          const now = Math.floor(Date.now() / 1000);
          if (parsed.timestamp && now - parsed.timestamp < CACHE_TTL) {
            cachedPost = parsed.data;
            setPost(cachedPost);
            if (cachedPost.categories && cachedPost.categories.length > 0) {
                const catIds = cachedPost.categories.map(c => c.id);
                const fetchedRelatedPosts = await fetchRelatedPosts(cachedPost.id, catIds, 5);
                setRelatedPosts(fetchedRelatedPosts);
            }
            setLoading(false);
            setShowLoadingSpinner(false);
            if (loadingTimeoutRef.current) {
              clearTimeout(loadingTimeoutRef.current);
            }
            return;
          }
        }
        const postData = await fetchPostById(postId);
        
        if (postData) {
          setPost(postData);
          await AsyncStorage.setItem(cacheKey, JSON.stringify({
            data: postData,
            timestamp: Math.floor(Date.now() / 1000),
          }));
          
          if (postData.categories && postData.categories.length > 0) {
            const categoryIds = postData.categories.map(c => c.id);
            const fetchedRelatedPosts = await fetchRelatedPosts(postData.id, categoryIds, 5);
            setRelatedPosts(fetchedRelatedPosts);
          }
        } else if (!cachedPost) {
          setError('Beitrag nicht gefunden.');
        }
        setCategories(await fetchCategories());
      } catch (e) {
        setError('Fehler beim Laden des Beitrags.');
      } finally {
        setLoading(false);
        setShowLoadingSpinner(false);
        if (loadingTimeoutRef.current) {
          clearTimeout(loadingTimeoutRef.current);
        }
      }
    };
    if (postId) {
      getPost();
    }
  }, [postId]);

  useEffect(() => {
    return () => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
    };
  }, []);

  const onShare = async () => {
    try {
      await Share.share({
        message: `${post.title} - Geteilt von der MUKAAN App`,
        url: post.link,
        title: post.title
      }, {
        dialogTitle: 'Beitrag teilen'
      });
    } catch (error) {
      Alert.alert('Fehler', 'Beitrag konnte nicht geteilt werden.');
    }
  };

  const handleLinkPress = async (url) => {
    try {
        if (url.includes('mukaan.de')) {
            const postIdMatch = url.match(/\/\?p=(\d+)/) || url.match(/\/(\d+)\//);
            if (postIdMatch) {
                const newPostId = parseInt(postIdMatch[1]);
                navigation.push('PostDetail', { postId: newPostId });
                return;
            }
        }
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
  
  const alterNode = (node) => {
    if (node.name === 'img') {
      imgCounter.current += 1;
      
      // Remove width and height attributes to allow full-width styling
      delete node.attribs.width;
      delete node.attribs.height;

      const { src } = node.attribs;
      if (src && src.startsWith('/wp-content/')) {
        node.attribs.src = `https://mukaan.de${src}`;
      }

      if (imgCounter.current > 1) {
        node.attribs.class = `${node.attribs.class || ''} scaled-image`;
      }
    }
    return node;
  };

  const removeUnwantedText = (html) => {
    if (!html) return '';
    const patterns = [
      /\*?alles hier drüber platzieren\*?/gi,
      /diese Beiträge könnten dich auch interessieren/gi,
      /\(?Dieser Text ist nicht sichtbar\)?/gi,
      /nicht sichtbar/gi,
      /ähnliche Beiträge/gi,
      /weitere Beiträge/gi,
      /empfohlene Beiträge/gi,
      /<p>\s*<\/p>/gi,
      /<div>\s*<\/div>/gi,
    ];
    let cleanedHtml = html;
    patterns.forEach(pattern => {
      cleanedHtml = cleanedHtml.replace(pattern, '');
    });
    return cleanedHtml;
  };

  if (loading && showLoadingSpinner) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  if (error) return <View style={styles.center}><Text style={styles.errorText}>{error}</Text></View>;
  if (!post) return <View style={styles.center}><Text>Kein Beitrag zum Anzeigen.</Text></View>;

  const content = removeUnwantedText(post.elementor_content || post.content || '');
  
  imgCounter.current = 0;

  const classesStyles = {
    'scaled-image': {
      transform: [{ scale: 2.0 }],
    }
  };

  // --- HTML Renderer-Konfiguration ---
  const renderers = {
    table: TableRenderer,
  };

  const customHTMLElementModels = {
    table: tableModel,
  };

  const renderersProps = {
    a: {
      onPress: (event, href) => handleLinkPress(href)
    },
    table: {
      WebView,
      cssRules: tableCss
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 30, paddingBottom: 100 }]}
      >
        <Text style={styles.title}>{decode(post.title)}</Text>
        <Text style={styles.metaInfo}>
          {new Date(post.date).toLocaleDateString('de-DE', { year: 'numeric', month: 'long', day: 'numeric' })}
        </Text>
        
        <RenderHTML
          contentWidth={width}
          source={{ html: content }}
          tagsStyles={tagsStyles}
          alterNode={alterNode}
          renderers={renderers}
          customHTMLElementModels={customHTMLElementModels}
          renderersProps={renderersProps}
          enableExperimentalPercentWidth={true}
          classesStyles={classesStyles}
        />

        <TouchableOpacity style={styles.shareButton} onPress={onShare}>
          <Ionicons name="share-outline" size={20} color="#fff" style={{ marginRight: 8 }}/>
          <Text style={styles.shareButtonText}>Beitrag teilen</Text>
        </TouchableOpacity>

        <RelatedPosts posts={relatedPosts} onPostPress={(p) => navigation.push('PostDetail', { postId: p.id })} />

      </ScrollView>
      <TouchableOpacity 
        onPress={() => navigation.goBack()} 
        style={[styles.floatingBackButton, { top: insets.top > 0 ? insets.top : 20 }]}
      >
        <Ionicons name="arrow-back" size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#000',
  },
  errorText: {
    color: '#FF5252',
    fontSize: 16,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    // paddingHorizontal: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
    marginTop: 44, // Extra space at the top after removing padding from scrollview
    textAlign: 'center',
    marginHorizontal: 20,
  },
  metaInfo: {
    fontSize: 14,
    color: '#bbb',
    marginBottom: 24,
    textAlign: 'center',
    textTransform: 'uppercase',
    marginHorizontal: 20,
  },
  shareButton: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -90,
    alignSelf: 'center',
  },
  shareButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  floatingBackButton: {
    position: 'absolute',
    left: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  relatedContainer: {
    marginTop: 20,
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
  },
  relatedTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  },
});

export default PostScreen; 