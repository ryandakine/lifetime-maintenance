# 🚀 Development Guide - Lifetime Maintenance PWA

## Background Agents & Automation

This project includes a sophisticated background agent system to accelerate development and maintain code quality automatically.

## 🤖 Background Agents

### Available Agents

| Agent | Purpose | Interval | Status |
|-------|---------|----------|--------|
| **Code Quality** | Auto-fix linting, formatting | 30s | ✅ Active |
| **Testing** | Run tests, generate coverage | 1m | ✅ Active |
| **Performance** | Monitor bundle size, metrics | 2m | ✅ Active |
| **Security** | Vulnerability scanning | 5m | ✅ Active |
| **Documentation** | Update docs, API docs | 10m | ✅ Active |
| **Deployment** | Staging/production deploys | Manual | ⏸️ Disabled |

### Starting Agents

```bash
# Start all agents
npm run agents:start

# Start specific agent
node scripts/background-agents.js start codeQuality

# Check agent status
npm run agents:status

# List available agents
npm run agents:list
```

### Agent Configuration

Edit `scripts/background-agents.js` to customize agent behavior:

```javascript
const AGENTS = {
  codeQuality: {
    name: 'Code Quality Agent',
    description: 'Automatically fixes linting issues and code formatting',
    tasks: ['lint', 'format', 'type-check'],
    interval: 30000, // 30 seconds
    enabled: true
  },
  // ... other agents
}
```

## 🔧 Development Automation

### Full Automation Mode

Start the complete development environment with all agents:

```bash
# Start full automation (dev server + agents + watchers)
npm run dev:auto

# Check automation status
npm run dev:status

# Stop automation
npm run dev:stop
```

### Quick Commands

```bash
# Quick build
npm run quick:build

# Quick test
npm run quick:test

# Quick deploy
npm run quick:deploy
```

## 📁 File Structure

```
lifetime-maintenance/
├── scripts/
│   ├── background-agents.js    # Background agent system
│   └── dev-automation.js       # Development automation
├── src/
│   ├── components/             # React components
│   ├── store/                  # Redux store & slices
│   ├── lib/                    # Utilities & services
│   └── test/                   # Test setup
├── docs/                       # Documentation
└── .github/workflows/          # CI/CD pipeline
```

## 🎯 Development Workflow

### 1. Start Development Environment

```bash
# Option A: Full automation (recommended)
npm run dev:auto

# Option B: Manual start
npm run dev
npm run agents:start
```

### 2. Code Development

The automation system will:
- ✅ Auto-format code on save
- ✅ Auto-fix linting issues
- ✅ Run tests automatically
- ✅ Monitor performance
- ✅ Update documentation
- ✅ Scan for security issues

### 3. Quality Assurance

```bash
# Check code quality
npm run lint

# Run tests
npm run test:run

# Generate coverage
npm run test:coverage

# Security audit
npm audit
```

### 4. Deployment

```bash
# Quick deployment
npm run quick:deploy

# Manual deployment
npm run build
# Deploy dist/ folder to your hosting provider
```

## 🔍 Monitoring & Debugging

### Agent Status

```bash
# Check all agent status
npm run agents:status

# Check specific agent
node scripts/background-agents.js status codeQuality
```

### System Health

The automation system monitors:
- Memory usage
- CPU usage
- Agent error rates
- File system changes
- Build performance

### Logs

Agents provide detailed logging:
- ✅ Success operations
- ⚠️ Warnings
- ❌ Errors with stack traces
- 📊 Performance metrics

## 🛠️ Customization

### Adding New Agents

1. **Define Agent Configuration**:

```javascript
// In scripts/background-agents.js
const AGENTS = {
  myCustomAgent: {
    name: 'My Custom Agent',
    description: 'Custom automation tasks',
    tasks: ['custom-task-1', 'custom-task-2'],
    interval: 60000,
    enabled: true
  }
}
```

2. **Implement Task Handler**:

```javascript
// In BackgroundAgent.executeTask()
case 'custom-task-1':
  await this.runCustomTask1()
  break
```

3. **Add Task Method**:

```javascript
async runCustomTask1() {
  try {
    // Your custom logic here
    console.log('✅ Custom task completed')
  } catch (error) {
    throw new Error(`Custom task failed: ${error.message}`)
  }
}
```

### Custom File Watchers

```javascript
// In DevAutomation.setupFileWatchers()
const watchPaths = [
  'src/components',
  'src/store',
  'src/lib',
  'src/test',
  'src/custom' // Add your custom paths
]
```

## 🚨 Troubleshooting

### Common Issues

#### Agent Not Starting
```bash
# Check if Node.js is running
node --version

# Check script permissions
chmod +x scripts/background-agents.js

# Check for syntax errors
node -c scripts/background-agents.js
```

#### High Resource Usage
```bash
# Check system resources
npm run dev:status

# Stop specific agents
node scripts/background-agents.js stop performance

# Restart automation
npm run dev:stop
npm run dev:auto
```

#### Test Failures
```bash
# Run tests manually
npm run test:run

# Check test configuration
cat vite.config.js

# Update test setup
node scripts/background-agents.js stop testing
npm run test:run
node scripts/background-agents.js start testing
```

### Performance Optimization

#### Reduce Agent Intervals
```javascript
// For development, increase intervals
interval: 120000, // 2 minutes instead of 30 seconds
```

#### Selective Agent Activation
```javascript
// Disable heavy agents during development
enabled: false
```

#### Resource Limits
```javascript
// Add resource checks
if (this.getSystemStats().memoryUsage > 80) {
  console.warn('⚠️ Skipping task due to high memory usage')
  return
}
```

## 📊 Metrics & Analytics

### Performance Tracking

The system tracks:
- **Build Times**: Average build duration
- **Test Coverage**: Percentage of code covered
- **Bundle Size**: JavaScript bundle size in KB
- **Error Rates**: Agent error frequency
- **Resource Usage**: Memory and CPU consumption

### Reporting

```bash
# Generate performance report
npm run dev:status

# Export metrics
node scripts/background-agents.js status > metrics.json
```

## 🔐 Security Considerations

### API Key Protection
- All API keys stored in environment variables
- Never committed to version control
- Rotated regularly

### Dependency Scanning
- Automated vulnerability scanning
- Regular security audits
- Dependency updates

### Access Control
- Limited agent permissions
- Sandboxed execution
- Error logging without sensitive data

## 🎯 Best Practices

### Development
1. **Use Full Automation**: Start with `npm run dev:auto`
2. **Monitor Agent Status**: Check status regularly
3. **Customize Intervals**: Adjust based on project needs
4. **Add Custom Agents**: Extend for project-specific needs

### Code Quality
1. **Auto-format on Save**: Let agents handle formatting
2. **Continuous Testing**: Keep tests running
3. **Performance Monitoring**: Watch bundle size
4. **Security Scanning**: Regular vulnerability checks

### Team Collaboration
1. **Shared Configuration**: Use consistent agent settings
2. **Documentation Updates**: Keep docs current
3. **Error Reporting**: Share agent error logs
4. **Performance Tracking**: Monitor team metrics

## 🚀 Next Steps

### Phase 3 Enhancements
- [ ] AI-powered code suggestions
- [ ] Automated refactoring
- [ ] Performance optimization suggestions
- [ ] Advanced error prediction

### Integration Opportunities
- [ ] IDE plugins
- [ ] Slack/Discord notifications
- [ ] GitHub integration
- [ ] CI/CD pipeline integration

---

**Happy Coding! 🎉**

The background agents are here to make your development experience faster, more reliable, and more enjoyable. Let them handle the repetitive tasks while you focus on building amazing features! 