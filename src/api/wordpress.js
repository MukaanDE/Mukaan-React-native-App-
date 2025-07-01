import { decode } from 'html-entities';

const API_BASE_URL = 'https://mukaan.de/wp-json/wp/v2';
const SITE_URL = 'https://mukaan.de';

// --- Daten-Transformationsfunktionen ---
const transformPostListItem = (post) => ({
  id: post.id,
  title: post.title?.rendered ? decode(post.title.rendered) : '',
  excerpt: post.excerpt?.rendered ? decode(post.excerpt.rendered) : '',
  date: post.date,
  modified: post.modified,
  link: post.link,
  slug: post.slug,
  featuredImage: post._embedded?.['wp:featuredmedia']?.[0]?.source_url || null,
  featuredImageAlt: post._embedded?.['wp:featuredmedia']?.[0]?.alt_text || '',
  categories: post._embedded?.['wp:term']?.[0] || [],
  tags: post._embedded?.['wp:term']?.[1] || [],
  author: post._embedded?.author?.[0] || { name: 'Mukaan', id: 1 },
  commentStatus: post.comment_status,
  pingStatus: post.ping_status,
  format: post.format || 'standard',
  meta: post.meta || {},
  _links: post._links || {}
});

const transformPostDetail = (post) => ({
  id: post.id,
  title: post.title?.rendered ? decode(post.title.rendered) : '',
  excerpt: post.excerpt?.rendered ? decode(post.excerpt.rendered) : '',
  content: post.content?.rendered || '',
  elementor_content: post.meta?._elementor_data || post.content?.rendered || '',
  elementor_template_id: post.meta?._elementor_template_id || null,
  elementor_edit_mode: post.meta?._elementor_edit_mode || false,
  date: post.date,
  modified: post.modified,
  link: post.link,
  slug: post.slug,
  categories: post._embedded?.['wp:term']?.[0] || [],
  tags: post._embedded?.['wp:term']?.[1] || [],
  featuredImage: post._embedded?.['wp:featuredmedia']?.[0]?.source_url || null,
  featuredImageAlt: post._embedded?.['wp:featuredmedia']?.[0]?.alt_text || '',
  author: post._embedded?.author?.[0] || { name: 'Mukaan', id: 1 },
  commentStatus: post.comment_status,
  pingStatus: post.ping_status,
  format: post.format || 'standard',
  meta: post.meta || {},
  _links: post._links || {}
});

export const fetchPosts = async (page = 1, perPage = 10) => {
  try {
    const url = `${API_BASE_URL}/posts?page=${page}&per_page=${perPage}&_embed&orderby=date&order=desc`;
    const response = await fetch(url);
    
    if (!response.ok) throw new Error('Netzwerk-Antwort war nicht ok.');
    const posts = await response.json();
    
    return posts.map(transformPostListItem);
  } catch (error) {
    console.error('Fehler beim Laden der Beiträge:', error);
    return [];
  }
};

export const fetchPostsByCategory = async (categoryId, page = 1, perPage = 10) => {
  try {
    const url = `${API_BASE_URL}/posts?categories=${categoryId}&page=${page}&per_page=${perPage}&_embed&orderby=date&order=desc`;
    const response = await fetch(url);
    
    if (!response.ok) throw new Error('Netzwerk-Antwort war nicht ok.');
    const posts = await response.json();
    
    return posts.map(transformPostListItem);
  } catch (error) {
    console.error('Fehler beim Laden der Kategorie-Beiträge:', error);
    return [];
  }
};

export const fetchPostById = async (postId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/posts/${postId}?_embed`);
    
    if (!response.ok) {
      throw new Error('Netzwerk-Antwort war nicht ok.');
    }
    const post = await response.json();
    
    return transformPostDetail(post);
  } catch (error) {
    console.error(`Kritischer Fehler in fetchPostById für postId ${postId}:`, error);
    return null;
  }
};

// Spezielle Funktion für Elementor-Inhalte
export const fetchPostWithElementorContent = async (postId) => {
  try {
    // Versuche zuerst den normalen Post-Endpoint
    const response = await fetch(`${API_BASE_URL}/posts/${postId}?_embed`);
    
    if (!response.ok) throw new Error('Netzwerk-Antwort war nicht ok.');
    const post = await response.json();
    
    // Transformiere den Post
    const transformedPost = transformPostDetail(post);
    
    // Wenn Elementor-Daten vorhanden sind, versuche sie zu verarbeiten
    if (transformedPost.elementor_content && transformedPost.elementor_content !== transformedPost.content) {
      try {
        // Elementor-Daten sind oft JSON-Strings, die HTML enthalten
        const elementorData = JSON.parse(transformedPost.elementor_content);
        if (Array.isArray(elementorData)) {
          // Extrahiere HTML aus Elementor-Daten
          const htmlContent = extractHtmlFromElementorData(elementorData);
          if (htmlContent) {
            transformedPost.elementor_content = htmlContent;
          }
        }
      } catch (parseError) {
        // Falls das Parsen fehlschlägt, verwende den Inhalt als HTML
        console.log('Elementor-Daten konnten nicht geparst werden, verwende HTML-Inhalt');
      }
    }
    
    return transformedPost;
  } catch (error) {
    console.error('Fehler beim Laden des Elementor-Beitrags:', error);
    return null;
  }
};

// Hilfsfunktion zum Extrahieren von HTML aus Elementor-Daten
const extractHtmlFromElementorData = (elementorData) => {
  let htmlContent = '';

  const processElement = (element) => {
    if (element.widgetType === 'text-editor' && element.settings?.editor) {
      htmlContent += element.settings.editor;
    } else if (element.widgetType === 'heading' && element.settings?.title) {
      const level = element.settings?.header_size || 'h2';
      htmlContent += `<${level}>${element.settings.title}</${level}>`;
    } else if (element.widgetType === 'image' && element.settings?.image?.url) {
      const alt = element.settings?.image?.alt || '';
      htmlContent += `<img src="${element.settings.image.url}" alt="${alt}" />`;
    } else if (element.widgetType === 'button' && element.settings?.text) {
      const url = element.settings?.link?.url || '#';
      htmlContent += `<a href="${url}" class="elementor-button">${element.settings.text}</a>`;
    } else if (element.widgetType === 'html' && element.settings?.html) {
      htmlContent += element.settings.html;
    }
    
    // Rekursiv durch Kinder-Elemente gehen
    if (element.elements && Array.isArray(element.elements)) {
      element.elements.forEach(processElement);
    }
  };
  
  elementorData.forEach(processElement);
  return htmlContent;
};

export const searchPosts = async (query, page = 1, perPage = 10) => {
  try {
    const url = `${API_BASE_URL}/posts?search=${encodeURIComponent(query)}&page=${page}&per_page=${perPage}&_embed&orderby=relevance`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Netzwerk-Antwort war nicht ok.');
    const posts = await response.json();
    return posts.map(transformPostListItem);
  } catch (error) {
    console.error('Fehler bei der Suche:', error);
    return [];
  }
};

export const fetchRelatedPosts = async (currentPostId, categoryIds, limit = 3) => {
  try {
    const categoryQuery = categoryIds.map(id => `categories=${id}`).join('&');
    const url = `${API_BASE_URL}/posts?${categoryQuery}&exclude=${currentPostId}&per_page=${limit}&_embed&orderby=date&order=desc`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Netzwerk-Antwort war nicht ok.');
    const posts = await response.json();
    return posts.map(transformPostListItem);
  } catch (error) {
    console.error('Fehler beim Laden verwandter Beiträge:', error);
    return [];
  }
};

export const fetchCategories = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/categories?per_page=100&orderby=count&order=desc`);
    if (!response.ok) throw new Error('Netzwerk-Antwort war nicht ok.');
    const categories = await response.json();
    return categories.map(cat => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      description: cat.description,
      count: cat.count,
      link: cat.link,
      taxonomy: cat.taxonomy,
      meta: cat.meta || {}
    }));
  } catch (error) {
    console.error('Fehler beim Laden der Kategorien:', error);
    return [];
  }
};

export const fetchCategoryById = async (categoryId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/categories/${categoryId}`);
    if (!response.ok) throw new Error('Netzwerk-Antwort war nicht ok.');
    const category = await response.json();
    return {
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      count: category.count,
      link: category.link
    };
  } catch (error) {
    console.error('❌ Fehler beim Laden der Kategorie:', error);
    return null;
  }
};

export const fetchSiteInfo = async () => {
  try {
    const response = await fetch(`${SITE_URL}/wp-json/`);
    if (!response.ok) throw new Error('Netzwerk-Antwort war nicht ok.');
    const siteInfo = await response.json();
    return {
      name: siteInfo.name || 'Mukaan',
      description: siteInfo.description || '',
      url: siteInfo.url || SITE_URL,
      home: siteInfo.home || SITE_URL,
      gmt_offset: siteInfo.gmt_offset || 0,
      timezone_string: siteInfo.timezone_string || '',
      namespaces: siteInfo.namespaces || [],
      autoload: siteInfo.autoload || {},
      routes: siteInfo.routes || {}
    };
  } catch (error) {
    console.error('❌ Fehler beim Laden der Site-Informationen:', error);
    return null;
  }
};

export const fetchMediaById = async (mediaId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/media/${mediaId}`);
    if (!response.ok) throw new Error('Netzwerk-Antwort war nicht ok.');
    const media = await response.json();
    return {
      id: media.id,
      url: media.source_url,
      alt: media.alt_text || '',
      caption: media.caption?.rendered || '',
      description: media.description?.rendered || '',
      title: media.title?.rendered || '',
      sizes: media.media_details?.sizes || {},
      width: media.media_details?.width || 0,
      height: media.media_details?.height || 0
    };
  } catch (error) {
    console.error('❌ Fehler beim Laden des Mediums:', error);
    return null;
  }
};

export const getWordPressUrl = (path = '') => `${SITE_URL}${path}`;
export const getPostUrl = (slug) => `${SITE_URL}/${slug}`;
export const getCategoryUrl = (slug) => `${SITE_URL}/category/${slug}`;
export const getAuthorUrl = (slug) => `${SITE_URL}/author/${slug}`;

export const fetchTags = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/tags?per_page=100&orderby=count&order=desc`);
    if (!response.ok) throw new Error('Netzwerk-Antwort war nicht ok.');
    const tags = await response.json();
    return tags.map(tag => ({
      id: tag.id,
      name: tag.name,
      slug: tag.slug,
      description: tag.description,
      count: tag.count,
      link: tag.link,
      taxonomy: tag.taxonomy,
      meta: tag.meta || {}
    }));
  } catch (error) {
    console.error('Fehler beim Laden der Tags:', error);
    return [];
  }
};

export const fetchAuthors = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/users?per_page=100&orderby=registered&order=desc`);
    if (!response.ok) throw new Error('Netzwerk-Antwort war nicht ok.');
    const authors = await response.json();
    return authors.map(author => ({
      id: author.id,
      name: author.name,
      slug: author.slug,
      description: author.description,
      link: author.link,
      avatar_urls: author.avatar_urls || {},
      registered: author.registered,
      meta: author.meta || {}
    }));
  } catch (error) {
    console.error('Fehler beim Laden der Autoren:', error);
    return [];
  }
};
