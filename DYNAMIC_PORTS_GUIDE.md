# Dynamic Port Finding System

This system automatically finds available ports for your services to avoid conflicts with other projects running on your machine.

## 🚀 Quick Start

### Start All Services with Dynamic Ports
```bash
npm run start:dynamic
```

### Start Individual Services
```bash
# Frontend only
npm run dev:dynamic

# API only
npm run api:dynamic

# Backend only
npm run backend:dynamic
```

### Check Available Ports
```bash
npm run start:ports
```

## 📋 Available Commands

| Command | Description |
|---------|-------------|
| `npm run start:dynamic` | Start all services with dynamic ports |
| `npm run dev:dynamic` | Start only Vite frontend |
| `npm run api:dynamic` | Start only Node.js API |
| `npm run backend:dynamic` | Start only FastAPI backend |
| `npm run start:ports` | Check available ports for all services |

## 🔧 Configuration

### Port Ranges

Edit `scripts/port-config.js` to customize port ranges:

```javascript
portRanges: {
  frontend: { start: 3000, end: 3010 },  // Frontend dev server
  api: { start: 3001, end: 3011 },       // Node.js API
  backend: { start: 8000, end: 8010 },   // FastAPI backend
  vite: { start: 5173, end: 5183 },      // Vite dev server
  // Add more services as needed
}
```

### Avoiding Conflicts with Other Projects

If you have other projects using specific ports, modify the ranges:

```javascript
// Example: Avoid ports 3000-3005 if another project uses them
frontend: { start: 3006, end: 3016 },
api: { start: 3007, end: 3017 },
```

## 🎯 How It Works

1. **Port Scanning**: The system checks each port in the configured ranges
2. **Availability Check**: Uses Node.js `net` module to test port availability
3. **Port Reservation**: Reserves found ports to prevent conflicts
4. **Service Startup**: Starts services with the found ports
5. **Environment Setup**: Creates `.env.dynamic` with port configuration

## 📊 Service URLs

When services start, you'll see output like:

```
🎯 Service URLs:
📱 Frontend (Vite): http://localhost:5173
🔧 Node.js API: http://localhost:3001
🐍 FastAPI Backend: http://localhost:8000
📚 API Docs: http://localhost:8000/docs
🔍 Health Check: http://localhost:3001/health
```

## 🔍 Troubleshooting

### Port Already in Use
If you get "port already in use" errors:

1. **Check what's using the port**:
   ```bash
   # Windows
   netstat -ano | findstr :3000
   
   # Mac/Linux
   lsof -i :3000
   ```

2. **Kill the process** or modify port ranges in `scripts/port-config.js`

### Services Not Starting
1. **Check port availability**:
   ```bash
   npm run start:ports
   ```

2. **Verify Python installation** (for FastAPI):
   ```bash
   python --version
   # or
   py --version
   ```

3. **Check dependencies**:
   ```bash
   npm install
   cd backend && pip install -r requirements-simple.txt
   ```

## 🧪 Testing

Test the port finder system:

```bash
node test-port-finder.js
```

This will verify:
- Individual port finding
- Multiple port finding
- Port availability checking
- Port reservation and release

## 📁 Files

| File | Purpose |
|------|---------|
| `scripts/port-finder.js` | Core port finding logic |
| `scripts/port-config.js` | Port range configuration |
| `scripts/dynamic-start.js` | Dynamic startup script |
| `test-port-finder.js` | Test script |
| `.env.dynamic` | Generated port configuration |

## 🔄 Integration with Existing Scripts

The dynamic system integrates with your existing scripts:

- **Vite**: Uses `VITE_PORT` environment variable
- **Node.js API**: Uses `PORT` environment variable  
- **FastAPI**: Uses `PORT` environment variable

## 🎛️ Advanced Usage

### Custom Port Ranges

Add new services to `scripts/port-config.js`:

```javascript
portRanges: {
  // ... existing ranges
  websocket: { start: 8080, end: 8090 },
  admin: { start: 9000, end: 9010 }
}
```

### Manual Port Finding

```javascript
const portFinder = require('./scripts/port-finder');

// Find a specific port
const port = await portFinder.findAvailablePort('frontend');

// Find multiple ports
const ports = await portFinder.findMultiplePorts(['api', 'backend']);

// Check if port is available
const available = await portFinder.isPortAvailable(3000);
```

### Environment Variables

The system automatically sets these environment variables:

- `VITE_PORT` - Frontend/Vite port
- `API_PORT` - Node.js API port
- `BACKEND_PORT` - FastAPI backend port
- `VITE_API_URL` - API URL for frontend
- `VITE_BACKEND_URL` - Backend URL for frontend

## 🚨 Important Notes

1. **Port Reservation**: The system reserves ports to prevent conflicts
2. **Graceful Shutdown**: Use Ctrl+C to stop all services gracefully
3. **Environment Files**: `.env.dynamic` is created automatically
4. **Service Dependencies**: Services start in dependency order
5. **Fallback Ports**: If no ports are available, the system will error

## 🔗 Related Commands

- `npm run dev` - Original Vite dev server (fixed port)
- `npm run backend` - Original FastAPI startup
- `npm run start:hybrid` - Hybrid system startup

## 📞 Support

If you encounter issues:

1. Check the troubleshooting section above
2. Run `npm run start:ports` to verify port availability
3. Test with `node test-port-finder.js`
4. Check the generated `.env.dynamic` file for port configuration 