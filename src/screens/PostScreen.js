import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
  Image,
  StatusBar,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { fetchPostById, fetchRelatedPosts } from '../api/wordpress';
import { decode } from 'html-entities';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import RelatedPosts from '../components/RelatedPosts';
import RenderHTML from 'react-native-render-html';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');
const scale = width / 375;
const normalize = (size) => Math.round(scale * size);

const systemFonts = ['System'];

const CACHE_PREFIX = 'post_';
const CACHE_TTL = 3600; // 1 hour in seconds

const PostScreen = ({ route }) => {
  const { postId } = route.params;
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const { width: windowWidth } = useWindowDimensions();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [scrollEnabled, setScrollEnabled] = useState(true);

  useEffect(() => {
    const getPost = async () => {
      setLoading(true);
      const cacheKey = `${CACHE_PREFIX}${postId}`;

      try {
        const cached = await AsyncStorage.getItem(cacheKey);
        if (cached) {
          const parsed = JSON.parse(cached);
          const cacheAge = Math.floor(Date.now() / 1000) - parsed.timestamp;
          if (cacheAge < CACHE_TTL) {
          setPost(parsed.data);
          if (parsed.related) {
            setRelatedPosts(parsed.related);
          }
            setLoading(false);
          }
        }
      } catch (e) {
        console.error("Fehler beim Lesen des Caches", e);
      }

      try {
        const postData = await fetchPostById(postId);
        if (postData) {
          const catIds = postData.categories?.map(c => c.id) || [];
          const fetchedRelatedPosts = catIds.length > 0 ? await fetchRelatedPosts(postData.id, catIds, 5) : [];
          
          setPost(postData);
          setRelatedPosts(fetchedRelatedPosts);
          
          await AsyncStorage.setItem(cacheKey, JSON.stringify({
            data: postData,
            related: fetchedRelatedPosts,
            timestamp: Math.floor(Date.now() / 1000),
          }));
        } else if (!post) {
          setError('Beitrag nicht gefunden.');
        }
      } catch (e) {
        if (!post) {
           setError('Fehler beim Laden des Beitrags.');
        }
        if (e.response) {
            e.response.text().then(text => console.error("Fehlertext:", text));
        }
        console.error("Fehler beim Fetchen neuer Beitragsdaten", e);
      } finally {
        if (loading) { // Nur wenn noch kein alter Cache geladen wurde
        setLoading(false);
        }
      }
    };
    if (postId) {
      getPost();
    }
  }, [postId]);

  const onShare = useCallback(() => {
    if (!post) return;
      setScrollEnabled(false);
      Share.share({
        message: `${post.title.rendered} - Geteilt von der MUKAAN App`,
        url: post.link,
        title: post.title.rendered
      }, {
        dialogTitle: 'Beitrag teilen'
    }).finally(() => {
      setScrollEnabled(true);
    });
  }, [post]);

 const handleLinkPress = useCallback((url) => {
    if (!url) return;
    try {
        if (url.includes('mukaan.de')) {
            const postIdMatch = url.match(/\/?p=(\d+)/) || url.match(/\/(\d+)\//);
            if (postIdMatch && postIdMatch[1]) {
                const newPostId = parseInt(postIdMatch[1], 10);
                navigation.push('PostDetail', { postId: newPostId });
                return;
            }
        }
        Linking.openURL(url).catch(err => {
            console.error('Fehler beim Öffnen des Links:', err);
            Alert.alert('Fehler', 'Der Link konnte nicht geöffnet werden.');
        });
    } catch (err) {
        console.error('Unerwarteter Fehler beim Link-Handling:', err);
        Alert.alert('Fehler', 'Ein unerwarteter Fehler ist aufgetreten.');
    }
  }, [navigation]);

  const handleBackPress = () => {
    navigation.goBack();
  };
  
  const renderers = useMemo(() => {
    const extractText = (tnode) => {
        if (!tnode) return '';
        if (tnode.type === 'text') return tnode.data;
        if (tnode.children?.length) {
            return tnode.children.map(extractText).join('');
        }
        return '';
    };

    // Filtert nur den gewünschten Satz aus Textknoten
    const shouldHideText = (text) => {
      const lower = text.toLowerCase();
      return lower.includes('alles hier drüber platzieren') && lower.includes('dieser text ist nicht sichtbar');
    };

    return {
      a: ({ tnode, style, children, ...props }) => {
        try {
          const href = tnode.attributes.href;
          if (!href) {
            return <Text style={style} {...props}>{children}</Text>;
          }
          const classAttr = tnode.attributes.class || '';
          const styleAttr = tnode.attributes.style || '';
          const linkText = extractText(tnode).trim();
          const isWpButton = classAttr.includes('wp-block-button__link');
          const isElementorButton = classAttr.includes('elementor-button');
          const isCustomStyledButton = styleAttr.includes('display: inline-block');
          const isButton = isWpButton || isElementorButton || isCustomStyledButton;
          if (isButton && linkText) {
            return (
              <View style={{ width: '100%', alignItems: 'center', marginVertical: 8 }}>
                <TouchableOpacity onPress={() => handleLinkPress(href)} style={styles.nativeButton} activeOpacity={0.7}>
                  <Text style={styles.nativeButtonText}>{linkText}</Text>
                </TouchableOpacity>
              </View>
            );
          }
          return (
            <Text style={style} onPress={() => handleLinkPress(href)} {...props}>
              {linkText || children}
            </Text>
          );
        } catch (e) {
          console.error("Fehler im Link-Renderer:", e);
          const href = tnode.attributes.href;
          const linkText = extractText(tnode).trim();
          return (
             <Text style={style} onPress={() => handleLinkPress(href)} {...props}>
              {linkText || children}
            </Text>
          );
        }
      },
      text: ({ tnode, style, ...props }) => {
        const text = extractText(tnode).trim();
        if (shouldHideText(text)) {
          return null;
        }
        return <Text style={style} {...props}>{text}</Text>;
      },
      img: ({ tnode, style, ...props }) => {
        const src = tnode.attributes.src;
        if (!src) return null;
        return (
          <Image
            source={{ uri: src }}
            style={{ width: '100%', aspectRatio: 16/9, borderRadius: 12, marginVertical: 16, resizeMode: 'contain', backgroundColor: '#000' }}
            resizeMode="contain"
            {...props}
          />
        );
      }
    }
  }, [handleLinkPress]);

  // Stabile renderersProps
  const renderersProps = useMemo(() => ({
    img: { enableExperimentalPercentWidth: true }
  }), []);
  
  if (loading && !post) {
    return <View style={styles.loadingContainer}><ActivityIndicator size="large" color="#fff" /></View>;
  }

  if (error) return <View style={styles.center}><Text style={styles.errorText}>{error}</Text></View>;
  if (!post) return <View style={styles.center}><Text>Kein Beitrag zum Anzeigen.</Text></View>;

  const rawContent = post.elementor_content || post.content.rendered || '';
  
  const source = {
    html: `<h1 style='color:white; font-size:32px; font-weight:bold; text-align:center; margin-bottom:8px;'>${decode(post.title.rendered)}</h1><div style=\"color:white; font-family: System;\">${rawContent}</div>`
  };

  return (
    <View style={[styles.container, { paddingTop: 0 }]}> 
      <StatusBar hidden={false} barStyle="light-content" translucent backgroundColor="transparent" />
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        scrollEnabled={scrollEnabled}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.title}>{decode(post.title.rendered)}</Text>
        <Text style={styles.metaInfo}>
          {new Date(post.date).toLocaleDateString('de-DE', { year: 'numeric', month: 'long', day: 'numeric' })}
        </Text>
        <RenderHTML
          contentWidth={width}
          source={source}
          tagsStyles={tagsStyles}
          renderers={renderers}
          renderersProps={renderersProps}
        />
        <TouchableOpacity style={styles.shareButton} onPress={onShare} activeOpacity={0.8}>
            <Ionicons name="share-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
            <Text style={styles.shareButtonText}>Beitrag teilen</Text>
        </TouchableOpacity>
        <RelatedPosts posts={relatedPosts} onPostPress={(p) => navigation.push('PostDetail', { postId: p.id })} />
      </ScrollView>
      <TouchableOpacity onPress={handleBackPress} style={[styles.floatingBackButton, { top: insets.top + 8 }]}> 
        <Ionicons name="arrow-back" size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

const tagsStyles = {
  p: { color: '#fff', fontSize: 18, lineHeight: 27, marginBottom: 16, whiteSpace: 'normal' },
  a: { color: '#7FDBFF', textDecorationLine: 'underline', fontWeight: '500' },
  h1: { color: '#fff', fontSize: 32, fontWeight: '700', marginVertical: 16, lineHeight: 40, letterSpacing: -0.4 },
  h2: { color: '#fff', fontSize: 26, fontWeight: '700', marginVertical: 16, lineHeight: 34, letterSpacing: -0.3 },
  h3: { color: '#fff', fontSize: 22, fontWeight: '600', marginVertical: 16, lineHeight: 28, letterSpacing: -0.2 },
  strong: { fontWeight: '700' },
  b: { fontWeight: '700' },
  ul: { marginVertical: 16 },
  ol: { marginVertical: 16 },
  li: { color: '#fff', fontSize: 18, lineHeight: 27, marginBottom: 8 },
  blockquote: { backgroundColor: 'rgba(127,219,255,0.05)', borderLeftWidth: 4, borderLeftColor: '#7FDBFF', marginVertical: 16, padding: 16, borderRadius: 8, fontStyle: 'italic', color: '#e0e0e0' },
  img: { width: '100%', aspectRatio: 16/9, borderRadius: 12, marginVertical: 16, resizeMode: 'contain', backgroundColor: '#000' },
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#000' },
  errorText: { color: '#FF5252', fontSize: 16, textAlign: 'center' },
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: 15, paddingBottom: normalize(90) },
  title: { fontSize: 32, fontWeight: 'bold', color: '#fff', marginBottom: 8, marginTop: 24, textAlign: 'center' },
  metaInfo: { fontSize: 14, color: '#bbb', marginBottom: 20, textAlign: 'center', textTransform: 'uppercase' },
  shareButton: { flexDirection: 'row', backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: 16, paddingVertical: 14, paddingHorizontal: 24, alignItems: 'center', justifyContent: 'center', marginVertical: 24, alignSelf: 'center' },
  shareButtonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  floatingBackButton: { position: 'absolute', top: 8, left: 20, width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(0, 0, 0, 0.5)', alignItems: 'center', justifyContent: 'center' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' },
  nativeButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 16,
  },
  nativeButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default PostScreen;