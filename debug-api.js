const API_BASE_URL = 'https://mukaan.de/wp-json/wp/v2';

async function testAPI() {
  try {
    // Test 1: Basis-API-Endpunkt
    const baseResponse = await fetch('https://mukaan.de/wp-json/');
    
    if (baseResponse.ok) {
      const baseData = await baseResponse.json();
    }
    
    // Test 2: Posts-Endpunkt
    const postsResponse = await fetch(`${API_BASE_URL}/posts?per_page=1`);
    
    if (postsResponse.ok) {
      const posts = await postsResponse.json();
    } else {
    }
    
    // Test 3: Categories-Endpunkt
    const categoriesResponse = await fetch(`${API_BASE_URL}/categories?per_page=5`);
    
    if (categoriesResponse.ok) {
      const categories = await categoriesResponse.json();
    }
    
  } catch (error) {
    console.error('❌ Netzwerk-Fehler:', error.message);
  }
}

testAPI(); 