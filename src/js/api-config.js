/**
 * PlusCode Academy - API Configuration & Auto-Detection
 * 
 * Automatically detects available PHP backend ports and configures
 * the API base URL accordingly.
 */

class ApiConfig {
  constructor() {
    // Common PHP server ports to try
    this.defaultPorts = [80, 8080, 8000, 8888, 3000, 5000];
    this.defaultHosts = ['localhost', '127.0.0.1'];
    this.apiPath = '/api';
    
    // Storage key for cached config
    this.storageKey = 'pluscode_api_config';
    
    // Default timeout for connection tests (ms)
    this.timeout = 3000;
  }

  /**
   * Get API base URL
   * Tries cached config first, then auto-detects
   */
  async getBaseUrl() {
    // Try cached working URL first
    const cached = this.getCachedUrl();
    if (cached) {
      const isValid = await this.testConnection(cached);
      if (isValid) {
        console.log('Using cached API URL:', cached);
        return cached;
      }
    }

    // Auto-detect available port
    console.log('Auto-detecting API server...');
    const detected = await this.detectAvailablePort();
    
    if (detected) {
      this.cacheUrl(detected);
      console.log('API server detected at:', detected);
      return detected;
    }

    // Fallback to default
    console.warn('Could not detect API server, using default');
    return 'http://localhost/api';
  }

  /**
   * Test if API is reachable at given URL
   */
  async testConnection(url) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(`${url}/test-connection.php`, {
        method: 'GET',
        signal: controller.signal,
        headers: {
          'Accept': 'application/json'
        }
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        return data.success === true;
      }
      return false;
    } catch (error) {
      return false;
    }
  }

  /**
   * Detect which port/host combination is available
   */
  async detectAvailablePort() {
    const urlsToTry = this.generateUrls();
    
    for (const url of urlsToTry) {
      const isAvailable = await this.testConnection(url);
      if (isAvailable) {
        return url;
      }
    }
    
    return null;
  }

  /**
   * Generate all possible URL combinations to try
   */
  generateUrls() {
    const urls = [];
    
    // Generate URLs for each host:port combination
    for (const host of this.defaultHosts) {
      for (const port of this.defaultPorts) {
        const portStr = port === 80 ? '' : `:${port}`;
        urls.push(`http://${host}${portStr}${this.apiPath}`);
      }
    }
    
    // Also try with https for common ports
    for (const port of [443, 8443]) {
      for (const host of this.defaultHosts) {
        urls.push(`https://${host}:${port}${this.apiPath}`);
      }
    }
    
    // Add custom user-defined URLs if any
    const customUrls = this.getCustomUrls();
    urls.unshift(...customUrls);
    
    return urls;
  }

  /**
   * Get cached working URL from localStorage
   */
  getCachedUrl() {
    try {
      const config = localStorage.getItem(this.storageKey);
      if (config) {
        const parsed = JSON.parse(config);
        return parsed.baseUrl || null;
      }
    } catch (e) {
      console.warn('Error reading cached API config:', e);
    }
    return null;
  }

  /**
   * Cache working URL to localStorage
   */
  cacheUrl(url) {
    try {
      const config = {
        baseUrl: url,
        timestamp: new Date().toISOString(),
        version: '1.0.0'
      };
      localStorage.setItem(this.storageKey, JSON.stringify(config));
    } catch (e) {
      console.warn('Error caching API config:', e);
    }
  }

  /**
   * Get custom user-defined URLs
   */
  getCustomUrls() {
    try {
      const custom = localStorage.getItem('pluscode_api_custom_urls');
      if (custom) {
        return JSON.parse(custom);
      }
    } catch (e) {
      console.warn('Error reading custom URLs:', e);
    }
    return [];
  }

  /**
   * Add custom API URL
   */
  addCustomUrl(url) {
    const current = this.getCustomUrls();
    if (!current.includes(url)) {
      current.unshift(url); // Add to beginning (priority)
      localStorage.setItem('pluscode_api_custom_urls', JSON.stringify(current));
    }
  }

  /**
   * Clear cached configuration
   */
  clearCache() {
    localStorage.removeItem(this.storageKey);
    localStorage.removeItem('pluscode_api_custom_urls');
  }

  /**
   * Manual configuration - force specific URL
   */
  setManualUrl(url) {
    this.cacheUrl(url);
    this.addCustomUrl(url);
  }

  /**
   * Get full API endpoint URL
   */
  async getEndpoint(endpoint) {
    const baseUrl = await this.getBaseUrl();
    return `${baseUrl}/${endpoint}`;
  }

  /**
   * Check API health status
   */
  async checkHealth() {
    const baseUrl = await this.getBaseUrl();
    try {
      const response = await fetch(`${baseUrl}/`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });
      return await response.json();
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

// Create singleton instance
const apiConfig = new ApiConfig();

/**
 * API Client with automatic port detection
 */
class ApiClient {
  constructor() {
    this.baseUrl = null;
    this.token = localStorage.getItem('pluscode_token') || null;
  }

  /**
   * Initialize and detect API server
   */
  async init() {
    this.baseUrl = await apiConfig.getBaseUrl();
    console.log('API Client initialized:', this.baseUrl);
    return this.baseUrl;
  }

  /**
   * Get request headers
   */
  getHeaders(includeAuth = true) {
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };

    if (includeAuth && this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  /**
   * Make API request
   */
  async request(endpoint, options = {}) {
    if (!this.baseUrl) {
      await this.init();
    }

    const url = `${this.baseUrl}/${endpoint}`;
    const config = {
      headers: this.getHeaders(options.includeAuth !== false),
      ...options
    };

    try {
      const response = await fetch(url, config);
      
      // Handle 401 Unauthorized
      if (response.status === 401) {
        this.token = null;
        localStorage.removeItem('pluscode_token');
        throw new Error('Session expired. Please login again.');
      }

      const data = await response.json();
      
      if (!response.ok || !data.success) {
        throw new Error(data.error?.message || `HTTP ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API Request failed:', error);
      throw error;
    }
  }

  // HTTP Methods
  async get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  }

  async post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }

  /**
   * Authentication
   */
  async login(credentials) {
    const data = await this.post('auth/login', credentials);
    if (data.success && data.data.token) {
      this.token = data.data.token;
      localStorage.setItem('pluscode_token', this.token);
    }
    return data;
  }

  logout() {
    this.token = null;
    localStorage.removeItem('pluscode_token');
  }

  isAuthenticated() {
    return !!this.token;
  }
}

// Export singleton
export const apiClient = new ApiClient();
export const apiDetector = apiConfig;

// Default export
export default apiClient;
