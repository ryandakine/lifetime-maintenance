/**
 * Port Configuration for Dynamic Port Finding
 * Modify these ranges to avoid conflicts with other projects
 */

module.exports = {
  // Port ranges for different services
  portRanges: {
    // Frontend development server (Vite/React)
    frontend: { start: 3000, end: 3010 },
    
    // Node.js API server
    api: { start: 3001, end: 3011 },
    
    // FastAPI backend server
    backend: { start: 8001, end: 8011 },
    
    // Vite dev server (alternative range)
    vite: { start: 5173, end: 5183 },
    
    // Additional ranges for other services
    n8n: { start: 5678, end: 5688 },
    redis: { start: 6379, end: 6389 },
    postgres: { start: 5432, end: 5442 },
    mongodb: { start: 27017, end: 27027 }
  },

  // Default ports (fallbacks)
  defaults: {
    frontend: 3000,
    api: 3001,
    backend: 8000,
    vite: 5173
  },

  // Service dependencies (which services need to know about each other)
  dependencies: {
    frontend: ['api', 'backend'],
    api: ['backend'],
    backend: [],
    vite: ['api', 'backend']
  },

  // Environment variable mappings
  envMappings: {
    frontend: 'VITE_PORT',
    api: 'API_PORT',
    backend: 'BACKEND_PORT',
    vite: 'VITE_PORT'
  },

  // URL templates for services
  urlTemplates: {
    frontend: 'http://localhost:{port}',
    api: 'http://localhost:{port}',
    backend: 'http://localhost:{port}',
    vite: 'http://localhost:{port}'
  }
}; 