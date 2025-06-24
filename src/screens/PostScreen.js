import React, { useState, useEffect, useRef } from 'react';
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
  Share
} from 'react-native';
import { WebView } from 'react-native-webview';
import { useNavigation } from '@react-navigation/native';
import { fetchPostById, fetchCategories } from '../api/wordpress';
import AppleLoadingSpinner from '../components/AppleLoadingSpinner';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_PREFIX = 'post_cache_';
const CACHE_TTL = 60 * 60 * 24; // 24 Stunden in Sekunden

const PostScreen = ({ route }) => {
  const { postId } = route.params;
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showLoadingSpinner, setShowLoadingSpinner] = useState(false);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const { width } = useWindowDimensions();
  const navigation = useNavigation();
  const loadingTimeoutRef = useRef(null);

  useEffect(() => {
    const getPost = async () => {
      try {
        setLoading(true);
        setShowLoadingSpinner(false);
        
        // Starte Timer für verzögerte Animation
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
            setLoading(false);
            setShowLoadingSpinner(false);
            if (loadingTimeoutRef.current) {
              clearTimeout(loadingTimeoutRef.current);
            }
            return;
          }
        }
        const [postData, categoriesData] = await Promise.all([
          fetchPostById(postId),
          fetchCategories(),
        ]);
        if (postData) {
          setPost(postData);
          await AsyncStorage.setItem(cacheKey, JSON.stringify({
            data: postData,
            timestamp: Math.floor(Date.now() / 1000),
          }));
        } else if (!cachedPost) {
          setError('Beitrag nicht gefunden.');
        }
        setCategories(categoriesData);
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

  // Cleanup Timer beim Unmount
  useEffect(() => {
    return () => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
    };
  }, []);

  const onShare = async (shareData = null) => {
    try {
      const shareInfo = shareData || {
        title: post?.title || 'MUKAAN Beitrag',
        text: post?.title ? `${post.title} - Geteilt von der MUKAAN App` : 'Geteilt von der MUKAAN App',
        url: post?.link || ''
      };

      await Share.share({
        message: shareInfo.text,
        url: shareInfo.url,
        title: shareInfo.title
      }, {
        dialogTitle: 'Beitrag teilen'
      });
    } catch (error) {
      Alert.alert('Fehler', 'Beitrag konnte nicht geteilt werden.');
    }
  };

  // Link-Behandlung für interne Links
  const handleInternalLink = async (url) => {
    try {
      // Versuche den Beitrag in der App zu öffnen
      const postIdMatch = url.match(/\/\?p=(\d+)/) || url.match(/\/(\d+)\//);
      if (postIdMatch) {
        const postId = parseInt(postIdMatch[1]);
        navigation.navigate('PostDetail', { postId });
      } else {
        // Fallback: Öffne in Browser
        const supported = await Linking.canOpenURL(url);
        if (supported) {
          await Linking.openURL(url);
        }
      }
    } catch (error) {
      console.log('Fehler beim Öffnen des internen Links:', error);
    }
  };

  // Link-Behandlung für externe Links
  const handleExternalLink = async (url) => {
    try {
      // Deep-Linking für bekannte Apps
      let deepLinkUrl = url;
      
      // Amazon Links
      if (url.includes('amazon.de') || url.includes('amazon.com')) {
        deepLinkUrl = url.replace('https://', 'amzn://');
      }
      // Instagram Links
      else if (url.includes('instagram.com')) {
        deepLinkUrl = url.replace('https://www.instagram.com/', 'instagram://user?username=');
      }
      // YouTube Links
      else if (url.includes('youtube.com') || url.includes('youtu.be')) {
        deepLinkUrl = url.replace('https://www.youtube.com/watch?v=', 'youtube://');
        deepLinkUrl = deepLinkUrl.replace('https://youtu.be/', 'youtube://');
      }
      // WhatsApp Links
      else if (url.includes('whatsapp.com')) {
        deepLinkUrl = url.replace('https://', 'whatsapp://');
      }
      // TikTok Links
      else if (url.includes('tiktok.com')) {
        deepLinkUrl = url.replace('https://', 'tiktok://');
      }
      // Twitch Links
      else if (url.includes('twitch.tv')) {
        deepLinkUrl = url.replace('https://www.twitch.tv/', 'twitch://stream/');
      }

      // Versuche Deep-Link zu öffnen
      const supported = await Linking.canOpenURL(deepLinkUrl);
      if (supported) {
        await Linking.openURL(deepLinkUrl);
      } else {
        // Fallback: Öffne normale URL
        const supportedOriginal = await Linking.canOpenURL(url);
        if (supportedOriginal) {
          await Linking.openURL(url);
        } else {
          Alert.alert("Link kann nicht geöffnet werden", "Es wurde keine App gefunden, um diesen Link zu öffnen.");
        }
      }
    } catch (error) {
      console.log('Fehler beim Öffnen des externen Links:', error);
      Alert.alert('Fehler', 'Link konnte nicht geöffnet werden.');
    }
  };

  // Funktion zum Entfernen unerwünschter Texte
  const removeUnwantedText = (html) => {
    if (!html) return '';
    
    // Entferne "*alles hier drüber platzieren" (mit verschiedenen Varianten)
    html = html.replace(/\*alles hier drüber platzieren\*/gi, '');
    html = html.replace(/alles hier drüber platzieren/gi, '');
    html = html.replace(/\*.*?hier drüber platzieren.*?\*/gi, '');
    
    // Entferne "diese Beiträge könnten dich auch interessieren" (mit verschiedenen Varianten)
    html = html.replace(/diese Beiträge könnten dich auch interessieren/gi, '');
    html = html.replace(/diese Beiträge könnten Sie auch interessieren/gi, '');
    html = html.replace(/diese Beiträge könnten dich interessieren/gi, '');
    html = html.replace(/diese Beiträge könnten Sie interessieren/gi, '');
    html = html.replace(/Beiträge könnten dich auch interessieren/gi, '');
    html = html.replace(/Beiträge könnten Sie auch interessieren/gi, '');
    
    // Entferne "(Dieser Text ist nicht sichtbar)" und ähnliche Varianten
    html = html.replace(/\(Dieser Text ist nicht sichtbar\)/gi, '');
    html = html.replace(/Dieser Text ist nicht sichtbar/gi, '');
    html = html.replace(/\(.*?Text ist nicht sichtbar.*?\)/gi, '');
    html = html.replace(/\(.*?nicht sichtbar.*?\)/gi, '');
    html = html.replace(/nicht sichtbar/gi, '');
    
    // Entferne verwandte Texte
    html = html.replace(/ähnliche Beiträge/gi, '');
    html = html.replace(/weitere Beiträge/gi, '');
    html = html.replace(/empfohlene Beiträge/gi, '');
    
    // Entferne leere Absätze, die durch das Entfernen entstanden sind
    html = html.replace(/<p>\s*<\/p>/gi, '');
    html = html.replace(/<div>\s*<\/div>/gi, '');
    
    return html;
  };

  if (loading && showLoadingSpinner) {
    return (
      <View style={styles.loadingContainer}>
        <AppleLoadingSpinner size="large" show={true} />
      </View>
    );
  }

  if (error) return <View style={styles.center}><Text style={styles.errorText}>{error}</Text></View>;
  if (!post) return <View style={styles.center}><Text>Kein Beitrag zum Anzeigen.</Text></View>;

  // WebView-HTML vorbereiten (nur den Beitragsinhalt, ohne Header/Footer der Webseite)
  const html = `
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
        <style>
          * { box-sizing: border-box; }
          body { 
            background: #000; 
            color: #fff; 
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; 
            margin: 0; 
            padding: 20px 16px 100px 16px; 
            font-size: 18px;
            line-height: 1.7;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
            font-feature-settings: 'liga' 1, 'calt' 1;
          }
          
          h1, h2, h3, h4, h5, h6 {
            text-align: center;
          }
          
          h1 { 
            font-size: 32px; 
            color: #fff; 
            margin: 0 0 20px 0; 
            font-weight: 700;
            line-height: 1.3;
            letter-spacing: -0.5px;
          }
          
          h2 { 
            font-size: 28px; 
            color: #fff; 
            margin: 36px 0 20px 0; 
            font-weight: 600;
            line-height: 1.4;
          }
          
          h3 { 
            font-size: 24px; 
            color: #fff; 
            margin: 32px 0 16px 0; 
            font-weight: 600;
            line-height: 1.4;
          }
          
          p { 
            margin: 0 0 24px 0; 
            color: #fff;
            line-height: 1.8;
            font-size: 18px;
          }
          
          a { 
            color: #7FDBFF; 
            text-decoration: none;
            transition: color 0.2s ease;
            cursor: pointer;
          }
          
          a:hover { 
            color: #5BC0DE; 
          }
          
          /* Moderne Button-Styles */
          .wp-block-button__link, 
          .elementor-button,
          .elementor-button-wrapper .elementor-button,
          .elementor-widget-button .elementor-button,
          .wp-block-button a,
          .button,
          .btn {
            border-radius: 16px !important;
            font-size: 18px !important;
            font-weight: 600 !important;
            padding: 18px 28px !important;
            margin: 24px 0 !important;
            width: 100% !important;
            display: block !important;
            background: linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(240,240,240,0.95) 100%) !important;
            color: #111 !important;
            text-align: center !important;
            text-decoration: none !important;
            box-shadow: 0 8px 24px rgba(0,0,0,0.15), 0 2px 8px rgba(0,0,0,0.1) !important;
            border: none !important;
            transition: all 0.3s ease !important;
            position: relative !important;
            overflow: hidden !important;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
            letter-spacing: 0.3px !important;
            cursor: pointer !important;
          }
          
          .wp-block-button__link:hover, 
          .elementor-button:hover,
          .elementor-button-wrapper .elementor-button:hover,
          .elementor-widget-button .elementor-button:hover,
          .wp-block-button a:hover,
          .button:hover,
          .btn:hover {
            background: linear-gradient(135deg, #7FDBFF 0%, #5BC0DE 100%) !important;
            color: #000 !important;
            transform: translateY(-2px) !important;
            box-shadow: 0 12px 32px rgba(127, 219, 255, 0.3), 0 4px 12px rgba(0,0,0,0.15) !important;
          }
          
          .wp-block-button__link:active, 
          .elementor-button:active,
          .elementor-button-wrapper .elementor-button:active,
          .elementor-widget-button .elementor-button:active,
          .wp-block-button a:active,
          .button:active,
          .btn:active {
            transform: translateY(0) !important;
            box-shadow: 0 4px 16px rgba(0,0,0,0.2) !important;
          }
          
          /* Tabellen-Styling */
          table { 
            width: 100%; 
            background: rgba(20,20,20,0.8); 
            color: #fff; 
            border-radius: 12px; 
            border-collapse: collapse; 
            margin: 24px 0; 
            overflow: hidden;
            box-shadow: 0 4px 16px rgba(0,0,0,0.2);
          }
          
          th, td { 
            border: 1px solid rgba(255,255,255,0.08); 
            padding: 12px 16px; 
            text-align: left;
          }
          
          th { 
            background: rgba(127, 219, 255, 0.1); 
            color: #7FDBFF; 
            font-weight: 600;
            font-size: 16px;
          }
          
          td {
            font-size: 16px;
            line-height: 1.6;
          }
          
          /* Listen-Styling */
          ul, ol {
            margin: 24px 0;
            padding-left: 28px;
          }
          
          li {
            margin: 10px 0;
            line-height: 1.7;
            font-size: 18px;
          }
          
          /* Strong/Bold Text */
          strong, b {
            font-weight: 600;
            color: #fff;
          }
          
          /* Meta-Info */
          .meta-info {
            color: #bbb; 
            font-size: 16px; 
            margin-bottom: 28px; 
            border-bottom: 1px solid rgba(255,255,255,0.08); 
            padding-bottom: 20px;
            font-weight: 400;
            letter-spacing: 0.2px;
          }
          
          /* Bilder */
          img {
            max-width: 100%;
            height: auto;
            border-radius: 8px;
            margin: 16px auto;
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
            display: block;
          }
          
          /* Bilder in verschiedenen Containern zentrieren */
          figure {
            text-align: center;
            margin: 20px 0;
          }
          
          figure img {
            margin: 0 auto;
          }
          
          .wp-block-image {
            text-align: center;
            margin: 20px 0;
          }
          
          .wp-block-image img {
            margin: 0 auto;
          }
          
          .elementor-widget-image {
            text-align: center;
            margin: 20px 0;
          }
          
          .elementor-widget-image img {
            margin: 0 auto;
          }
          
          /* Blockquotes */
          blockquote {
            background: rgba(127, 219, 255, 0.05);
            border-left: 4px solid #7FDBFF;
            margin: 24px 0;
            padding: 16px 20px;
            border-radius: 0 8px 8px 0;
            font-style: italic;
            color: #e0e0e0;
          }
          
          /* Code-Blöcke */
          pre, code {
            background: rgba(20,20,20,0.8);
            border-radius: 8px;
            padding: 12px 16px;
            font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
            font-size: 14px;
            overflow-x: auto;
            border: 1px solid rgba(255,255,255,0.08);
          }
          
          /* Responsive Design */
          @media (max-width: 480px) {
            body {
              padding: 16px 12px 100px 12px;
              font-size: 17px;
            }
            
            h1 {
              font-size: 28px;
            }
            
            h2 {
              font-size: 24px;
            }
            
            h3 {
              font-size: 20px;
            }
            
            p {
              font-size: 17px;
            }
            
            li {
              font-size: 17px;
            }
            
            .wp-block-button__link, 
            .elementor-button,
            .elementor-button-wrapper .elementor-button,
            .elementor-widget-button .elementor-button,
            .wp-block-button a,
            .button,
            .btn {
              padding: 16px 24px !important;
              font-size: 17px !important;
            }
            
            th, td {
              font-size: 15px;
            }
            
            .meta-info {
              font-size: 15px;
            }
          }
          
          /* Teilen-Button Hover-Effekte */
          .share-button:hover {
            background: rgba(255, 255, 255, 0.1) !important;
            border-color: rgba(255, 255, 255, 0.2) !important;
            transform: scale(1.01) !important;
            box-shadow: 0 6px 24px rgba(0, 0, 0, 0.25), 0 3px 8px rgba(0, 0, 0, 0.15) !important;
          }
          
          .share-button:active {
            transform: scale(0.99) !important;
            box-shadow: 0 3px 12px rgba(0, 0, 0, 0.2) !important;
          }
          
          /* Automatische Schriftfarbe-Anpassung für weiße Hintergründe */
          * {
            color-scheme: light dark;
          }
          
          /* Spezifische Regeln für weiße Hintergründe */
          [style*="background: white"], 
          [style*="background: #fff"], 
          [style*="background: #ffffff"],
          [style*="background-color: white"],
          [style*="background-color: #fff"],
          [style*="background-color: #ffffff"],
          .white-bg,
          .light-bg {
            color: #000 !important;
          }
          
          /* Für Elemente mit weißem Hintergrund */
          div[style*="background: white"] *,
          div[style*="background: #fff"] *,
          div[style*="background: #ffffff"] *,
          div[style*="background-color: white"] *,
          div[style*="background-color: #fff"] *,
          div[style*="background-color: #ffffff"] * {
            color: #000 !important;
          }
          
          /* Für Links auf weißem Hintergrund */
          [style*="background: white"] a,
          [style*="background: #fff"] a,
          [style*="background: #ffffff"] a,
          [style*="background-color: white"] a,
          [style*="background-color: #fff"] a,
          [style*="background-color: #ffffff"] a {
            color: #0066cc !important;
          }
        </style>
      </head>
      <body>
        <h1>${post.title}</h1>
        <div class="meta-info">${new Date(post.date).toLocaleDateString('de-DE', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
        ${removeUnwantedText(post.elementor_content || post.content || '')}
        
        <!-- Teilen-Button am Ende -->
        <div style="text-align: center; margin: 30px 0 15px 0; padding: 15px 0; border-top: 1px solid rgba(255,255,255,0.08);">
          <button onclick="sharePost()" class="share-button" style="
            background: rgba(255, 255, 255, 0.08);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            color: rgba(255, 255, 255, 0.9);
            border: 1px solid rgba(255, 255, 255, 0.15);
            border-radius: 16px;
            padding: 12px 24px;
            font-size: 15px;
            font-weight: 500;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            cursor: pointer;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2), 0 2px 6px rgba(0, 0, 0, 0.1);
            transition: all 0.3s ease;
            display: inline-flex;
            align-items: center;
            gap: 8px;
            position: relative;
            overflow: hidden;
          ">
            <div style="
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              background: linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%);
              border-radius: 16px;
              pointer-events: none;
            "></div>
            <svg style="width: 16px; height: 16px; position: relative; z-index: 1; fill: currentColor;" viewBox="0 0 24 24">
              <path d="M16 5l-1.42 1.42-1.59-1.59V16h-1.98V4.83L9.42 6.42 8 5l4-4 4 4zm4 5v11c0 1.1-.9 2-2 2H6c-1.11 0-2-.9-2-2V10c0-1.11.89-2 2-2h3v2H6v11h12V10h-3V8h3c1.1 0 2 .89 2 2z"/>
            </svg>
            <span style="position: relative; z-index: 1;">Beitrag teilen</span>
          </button>
        </div>
        
        <script>
          // Link-Behandlung für iOS und Android
          function handleLinkClick(event) {
            event.preventDefault();
            const url = event.target.href || event.target.closest('a').href;
            
            // Prüfe ob es ein interner Link ist (mukaan.de)
            if (url.includes('mukaan.de') || url.includes('localhost')) {
              // Interne Links in der App öffnen
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'openInternalLink',
                url: url
              }));
            } else {
              // Externe Links mit Deep-Linking versuchen
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'openExternalLink',
                url: url
              }));
            }
          }
          
          // Alle Links mit Click-Handler versehen
          function setupLinks() {
            const links = document.querySelectorAll('a');
            links.forEach(link => {
              link.addEventListener('click', handleLinkClick);
            });
          }
          
          // Links beim Laden der Seite einrichten
          document.addEventListener('DOMContentLoaded', setupLinks);
          
          // Auch nach dynamischen Änderungen Links einrichten
          const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
              if (mutation.type === 'childList') {
                setupLinks();
              }
            });
          });
          
          observer.observe(document.body, {
            childList: true,
            subtree: true
          });
          
          function sharePost() {
            // Verwende direkt React Native Share
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'share',
              title: '${post.title.replace(/'/g, "\\'")}',
              text: '${post.title.replace(/'/g, "\\'")} - Geteilt von der MUKAAN App',
              url: '${post.link}'
            }));
          }
          
          function goBack() {
            // Sende Nachricht an React Native für Zurück-Navigation
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'goBack'
            }));
          }
        </script>
        
        <!-- Schwebender Zurück-Button -->
        <div style="
          position: fixed;
          bottom: 130px;
          left: 20px;
          width: 50px;
          height: 50px;
          z-index: 9999;
          pointer-events: auto;
        ">
          <button onclick="goBack()" style="
            width: 100%;
            height: 100%;
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(30px);
            -webkit-backdrop-filter: blur(30px);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
            transition: all 0.3s ease;
            padding: 0;
            outline: none;
          ">
            <svg style="width: 24px; height: 24px; fill: rgba(255, 255, 255, 0.9);" viewBox="0 0 24 24">
              <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
            </svg>
          </button>
        </div>
      </body>
    </html>
  `;

  return (
    <View style={styles.container}>
      <WebView
        originWhitelist={["*"]}
        source={{ html }}
        style={styles.webview}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        backgroundColor="#000"
        onMessage={(event) => {
          try {
            const data = JSON.parse(event.nativeEvent.data);
            if (data.type === 'share') {
              onShare({
                title: data.title,
                text: data.text,
                url: data.url
              });
            } else if (data.type === 'goBack') {
              navigation.goBack();
            } else if (data.type === 'openInternalLink') {
              // Interne Links in der App öffnen
              handleInternalLink(data.url);
            } else if (data.type === 'openExternalLink') {
              // Externe Links mit Deep-Linking versuchen
              handleExternalLink(data.url);
            }
          } catch (error) {
            console.log('WebView message error:', error);
          }
        }}
      />
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
  webview: {
    flex: 1,
    backgroundColor: '#000',
    marginTop: 80,
    borderRadius: 18,
    overflow: 'hidden',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#000',
  },
});

export default PostScreen; 