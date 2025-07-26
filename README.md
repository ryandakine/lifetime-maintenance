# 🏋️ Lifetime Fitness Maintenance PWA

A comprehensive, AI-powered maintenance management system designed specifically for Lifetime Fitness facilities. This Progressive Web App (PWA) provides intelligent task management, shopping lists, knowledge base, email automation, and photo documentation with voice-first interaction for fitness facility maintenance teams.

## ✨ Features

### 🎯 Core Functionality
- **Smart Task Management**: AI-powered task parsing, categorization, and priority assignment for fitness equipment and facility maintenance
- **Intelligent Shopping Lists**: Automatic item categorization, supplier integration, and smart reminders for maintenance supplies
- **Knowledge Base**: Searchable maintenance procedures and documentation for fitness equipment
- **Email Automation**: AI-generated contextual email replies for maintenance communications
- **Photo Documentation**: Organized photo management with AI analysis for equipment and facility issues
- **Voice-First Interface**: Natural language processing for hands-free maintenance operations

### 🚀 Advanced Features
- **AI Integration**: Perplexity Pro API for intelligent maintenance suggestions and automation
- **PWA Capabilities**: Offline support, app-like experience, push notifications for maintenance alerts
- **Mobile Optimized**: Galaxy Fold 6 and foldable device support for on-the-go maintenance
- **Real-time Sync**: Supabase backend with real-time updates for team coordination
- **Voice Commands**: Natural language processing for hands-free maintenance operations

### 🎨 User Experience
- **Modern UI/UX**: Lifetime Fitness branding with responsive design for maintenance workflows
- **Accessibility**: WCAG AA compliant with screen reader support for inclusive maintenance teams
- **Performance**: Optimized bundle size with lazy loading for fast maintenance operations
- **Security**: Production-grade security with API key protection for facility data

## 🏗️ Architecture

### Frontend Stack
- **React 18**: Modern React with hooks and concurrent features
- **Redux Toolkit**: Centralized state management
- **Vite**: Fast build tool with hot module replacement
- **Lucide React**: Beautiful, customizable icons
- **PWA**: Service worker and web app manifest

### Backend & Services
- **Supabase**: Backend-as-a-Service (PostgreSQL, Auth, Storage)
- **Perplexity Pro API**: AI-powered natural language processing
- **Edge Functions**: Serverless API endpoints for secure operations

### Development Tools
- **Vitest**: Fast unit testing framework
- **Testing Library**: React component testing
- **ESLint**: Code quality and consistency
- **GitHub Actions**: CI/CD pipeline with automated testing

## 📱 Mobile Support

### Galaxy Fold 6 Optimizations
- **Foldable Breakpoints**: Specific CSS media queries (280px, 904px, 1856px)
- **Touch Interactions**: 44px minimum touch targets
- **Responsive Design**: Mobile-first approach with progressive enhancement
- **Voice Interface**: Optimized for mobile voice input

### PWA Features
- **Offline Support**: Service worker caching
- **App-like Experience**: Full-screen mode, splash screen
- **Installable**: Add to home screen functionality
- **Push Notifications**: Real-time updates (planned)

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account
- Perplexity Pro API key

### Installation

1. **Clone the repository**
```bash
   git clone https://github.com/your-org/lifetime-maintenance.git
cd lifetime-maintenance
   ```

2. **Install dependencies**
   ```bash
npm install
```

3. **Environment Setup**
```bash
   cp .env.example .env
```

   Add your API keys to `.env`:
```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_PERPLEXITY_API_KEY=your_perplexity_api_key
   ```

4. **Start development server**
```bash
npm run dev
```

5. **Open in browser**
   ```
   http://localhost:5174
   ```

### Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run tests
npm run test

# Run tests with coverage
npm run test:coverage

# Lint code
npm run lint
```

## 🧪 Testing

### Running Tests
```bash
# Run all tests
npm run test:run

# Run tests in watch mode
npm run test

# Run tests with UI
npm run test:ui

# Generate coverage report
npm run test:coverage
```

### Test Structure
- **Unit Tests**: Component and utility function testing
- **Integration Tests**: Redux store and API integration
- **E2E Tests**: User workflow testing (planned)

## 🏗️ Project Structure

```
lifetime-maintenance/
├── src/
│   ├── components/          # React components
│   │   ├── Tasks.jsx       # Task management
│   │   ├── Shopping.jsx    # Shopping lists
│   │   ├── Knowledge.jsx   # Knowledge base
│   │   ├── Email.jsx       # Email automation
│   │   ├── Photos.jsx      # Photo management
│   │   └── VoiceAssistant.jsx # Voice interface
│   ├── store/              # Redux store
│   │   ├── slices/         # Redux Toolkit slices
│   │   ├── hooks.js        # Custom Redux hooks
│   │   └── index.js        # Store configuration
│   ├── lib/                # Utilities and services
│   │   ├── supabase.js     # Supabase client
│   │   └── aiProcessor.js  # AI processing utilities
│   └── test/               # Test setup and utilities
├── supabase/
│   └── functions/          # Edge functions
├── public/                 # Static assets
└── docs/                   # Documentation
```

## 🔧 Configuration

### Environment Variables
- `VITE_SUPABASE_URL`: Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Supabase anonymous key
- `VITE_PERPLEXITY_API_KEY`: Perplexity Pro API key

### Supabase Setup
1. Create a new Supabase project
2. Set up the database schema (see `database/schema.sql`)
3. Configure Row Level Security (RLS)
4. Set up Edge Functions for AI processing

### PWA Configuration
- Update `public/manifest.json` for app metadata
- Configure service worker in `public/sw.js`
- Set up icons in `public/` directory

## 🚀 Deployment

### Vercel Deployment
1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Manual Deployment
```bash
# Build the application
npm run build

# Deploy to your hosting provider
# Copy dist/ folder to your web server
```

### CI/CD Pipeline
- **Automated Testing**: Runs on every PR and push
- **Security Scanning**: Vulnerability assessment
- **Performance Testing**: Lighthouse CI integration
- **Staging Deployment**: Automatic deployment to staging
- **Production Deployment**: Manual approval required

## 🔒 Security

### API Key Protection
- All API keys stored in environment variables
- Edge functions handle sensitive operations
- Client-side code never exposes API keys

### Data Security
- Supabase Row Level Security (RLS)
- Input validation and sanitization
- HTTPS enforcement
- Regular security audits

## 📊 Performance

### Optimization Features
- **Code Splitting**: Lazy loading of components
- **Bundle Optimization**: Tree shaking and minification
- **Caching**: Service worker and browser caching
- **Image Optimization**: WebP format and lazy loading

### Performance Metrics
- **Lighthouse Score**: 90+ (Performance, Accessibility, Best Practices, SEO)
- **Bundle Size**: <500KB (target)
- **Load Time**: <2 seconds (target)
- **Mobile Performance**: Optimized for foldable devices

## 🤝 Contributing

### Development Workflow
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Standards
- Follow ESLint configuration
- Write tests for new features
- Update documentation
- Follow conventional commits

## 📈 Roadmap

### Phase 3: Enhancement (Weeks 9-12)
- [ ] Advanced AI features with Perplexity integration
- [ ] Comprehensive UX improvements
- [ ] Monitoring and analytics setup
- [ ] Equipment management system foundation

### Phase 4: Advanced Features (Weeks 13-16)
- [ ] IoT integration capabilities
- [ ] Mobile workforce management
- [ ] Advanced analytics dashboard
- [ ] Vendor management system

### Future Enhancements
- [ ] Predictive maintenance algorithms
- [ ] Equipment lifecycle tracking
- [ ] Advanced reporting and analytics
- [ ] Integration with facility management systems

## 📞 Support

### Getting Help
- **Documentation**: Check the docs/ folder
- **Issues**: Create a GitHub issue
- **Discussions**: Use GitHub Discussions
- **Email**: support@lifetimefitness.com

### Troubleshooting
- **Common Issues**: See docs/troubleshooting.md
- **Performance Issues**: Check Lighthouse reports
- **Mobile Issues**: Test on Galaxy Fold 6 simulator

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Lifetime Fitness**: For the opportunity to build this system
- **Supabase**: For the excellent backend-as-a-service platform
- **Perplexity**: For AI-powered natural language processing
- **React Community**: For the amazing ecosystem and tools

---

**Built with ❤️ for Lifetime Fitness Maintenance Teams** 