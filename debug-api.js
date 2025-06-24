const API_BASE_URL = 'https://mukaan.de/wp-json/wp/v2';

async function testAPI() {
  console.log('🔍 Teste WordPress API...');
  
  try {
    // Test 1: Basis-API-Endpunkt
    console.log('📡 Teste Basis-Endpunkt...');
    const baseResponse = await fetch('https://mukaan.de/wp-json/');
    console.log('✅ Basis-Endpunkt Status:', baseResponse.status);
    
    if (baseResponse.ok) {
      const baseData = await baseResponse.json();
      console.log('📋 Verfügbare Routen:', Object.keys(baseData.routes || {}).slice(0, 5));
    }
    
    // Test 2: Posts-Endpunkt
    console.log('\n📡 Teste Posts-Endpunkt...');
    const postsResponse = await fetch(`${API_BASE_URL}/posts?per_page=1`);
    console.log('✅ Posts-Endpunkt Status:', postsResponse.status);
    
    if (postsResponse.ok) {
      const posts = await postsResponse.json();
      console.log('📄 Anzahl Posts:', posts.length);
      if (posts.length > 0) {
        console.log('📝 Erster Post Titel:', posts[0].title?.rendered || 'Kein Titel');
        console.log('🆔 Post ID:', posts[0].id);
        console.log('📅 Post Datum:', posts[0].date);
      }
    } else {
      console.log('❌ Posts-Endpunkt Fehler:', postsResponse.statusText);
    }
    
    // Test 3: Categories-Endpunkt
    console.log('\n📡 Teste Categories-Endpunkt...');
    const categoriesResponse = await fetch(`${API_BASE_URL}/categories?per_page=5`);
    console.log('✅ Categories-Endpunkt Status:', categoriesResponse.status);
    
    if (categoriesResponse.ok) {
      const categories = await categoriesResponse.json();
      console.log('📂 Anzahl Kategorien:', categories.length);
      if (categories.length > 0) {
        console.log('🏷️ Erste Kategorie:', categories[0].name);
      }
    }
    
  } catch (error) {
    console.error('❌ Netzwerk-Fehler:', error.message);
  }
}

testAPI(); 