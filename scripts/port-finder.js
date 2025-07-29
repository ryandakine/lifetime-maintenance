const net = require('net');
const portConfig = require('./port-config');

/**
 * Dynamic Port Finder Utility
 * Automatically finds available ports to avoid conflicts with other projects
 */

class PortFinder {
  constructor() {
    this.usedPorts = new Set();
    this.portRanges = portConfig.portRanges;
    this.defaults = portConfig.defaults;
  }

  /**
   * Check if a port is available
   * @param {number} port - Port number to check
   * @returns {Promise<boolean>} - True if port is available
   */
  async isPortAvailable(port) {
    return new Promise((resolve) => {
      const server = net.createServer();
      
      server.listen(port, () => {
        server.once('close', () => {
          resolve(true);
        });
        server.close();
      });
      
      server.on('error', () => {
        resolve(false);
      });
    });
  }

  /**
   * Find an available port within a range
   * @param {string} service - Service name (frontend, backend, api, vite)
   * @returns {Promise<number>} - Available port number
   */
  async findAvailablePort(service) {
    const range = this.portRanges[service];
    if (!range) {
      throw new Error(`Unknown service: ${service}`);
    }

    for (let port = range.start; port <= range.end; port++) {
      if (await this.isPortAvailable(port)) {
        this.usedPorts.add(port);
        console.log(`✅ Found available port ${port} for ${service}`);
        return port;
      }
    }

    throw new Error(`No available ports found for ${service} in range ${range.start}-${range.end}`);
  }

  /**
   * Find multiple available ports for different services
   * @param {string[]} services - Array of service names
   * @returns {Promise<Object>} - Object with service names as keys and port numbers as values
   */
  async findMultiplePorts(services) {
    const ports = {};
    
    for (const service of services) {
      try {
        ports[service] = await this.findAvailablePort(service);
      } catch (error) {
        console.error(`❌ Failed to find port for ${service}:`, error.message);
        throw error;
      }
    }
    
    return ports;
  }

  /**
   * Get port configuration for all services
   * @returns {Promise<Object>} - Complete port configuration
   */
  async getPortConfig() {
    const services = ['frontend', 'backend', 'api', 'vite'];
    return await this.findMultiplePorts(services);
  }

  /**
   * Reserve a specific port (mark as used)
   * @param {number} port - Port number to reserve
   */
  reservePort(port) {
    this.usedPorts.add(port);
  }

  /**
   * Release a port (mark as available)
   * @param {number} port - Port number to release
   */
  releasePort(port) {
    this.usedPorts.delete(port);
  }

  /**
   * Get current port usage status
   * @returns {Object} - Current port configuration and usage
   */
  getStatus() {
    return {
      usedPorts: Array.from(this.usedPorts),
      portRanges: this.portRanges
    };
  }
}

// Export singleton instance
const portFinder = new PortFinder();
module.exports = portFinder;

// CLI usage
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    // Find ports for all services
    portFinder.getPortConfig()
      .then(config => {
        console.log('🎯 Available Port Configuration:');
        console.log(JSON.stringify(config, null, 2));
        process.exit(0);
      })
      .catch(error => {
        console.error('❌ Error finding ports:', error.message);
        process.exit(1);
      });
  } else {
    // Find port for specific service
    const service = args[0];
    portFinder.findAvailablePort(service)
      .then(port => {
        console.log(`✅ Available port for ${service}: ${port}`);
        process.exit(0);
      })
      .catch(error => {
        console.error(`❌ Error finding port for ${service}:`, error.message);
        process.exit(1);
      });
  }
} 