/**
 * apiClient.js
 * Cliente para comunicarse con la API de PHP.
 */

// Configurado para el puerto 8080 de tu XAMPP
const API_URL = 'http://localhost:8080/PlusCode_Academy-main/api/api.php';

async function fetchAPI(entity, options = {}, id = null) {
  let url = `${API_URL}?entity=${entity}`;
  if (id !== null) {
    url += `&id=${id}`;
  }

  const defaultHeaders = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  if (config.body && typeof config.body === 'object') {
    config.body = JSON.stringify(config.body);
  }

  try {
    const response = await fetch(url, config);
    const data = await response.json();
    
    if (!response.ok) {
      const errorMsg = data && (data.message || data.error) ? (data.message || data.error) : `API Error: ${response.status}`;
      throw new Error(errorMsg);
    }
    
    return data;
  } catch (error) {
    console.error(`[apiClient] Fetch error for ${entity}:`, error);
    throw error;
  }
}

export const api = {
  get: (entity, id = null) => fetchAPI(entity, { method: 'GET' }, id),
  post: (entity, data) => fetchAPI(entity, { method: 'POST', body: data }),
  put: (entity, id, data) => fetchAPI(entity, { method: 'PUT', body: data }, id),
  delete: (entity, id) => fetchAPI(entity, { method: 'DELETE' }, id),
  
  // Endpoints especiales
  login: (username, password) => fetchAPI('auth', { 
      method: 'POST', 
      body: { username, password } 
  })
};
