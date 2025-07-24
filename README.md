# Lifetime Fitness Maintenance PWA

A comprehensive Progressive Web App for managing maintenance tasks, shopping lists, emails, knowledge base, and file uploads for Lifetime Fitness facilities.

## Features

### 🛠️ Task Management
- **Daily Service Channel Tasks**: Input and track daily maintenance tasks
- **Wednesday 10 AM Boss Meeting Notes**: Record projects and priorities from weekly meetings
- **Ongoing Projects**: Track long-term maintenance projects
- **Smart Project Grouping**: Automatically group tasks by project keywords (e.g., "concrete", "electrical", "hvac")
- **Status Tracking**: Mark tasks as pending, in progress, or completed
- **Due Date Management**: Set and track task deadlines

### 🛒 Shopping Lists
- **Enhanced Item Search**: Uses Perplexity Pro API to find Grainger part numbers
- **Store Information**: Provides Home Depot aisle locations and store addresses
- **Alternative Suggestions**: Shows alternative products when available
- **Task Integration**: Link shopping lists to specific maintenance tasks

### 📧 Email Management
- **Send Emails**: Compose and send emails using Supabase Functions + Resend
- **Smart Responses**: AI-powered email responses using Claude 4.0 Max API
- **Email History**: Track all sent emails and responses
- **Context-Aware**: Respond to emails with relevant context

### 📚 Knowledge Base
- **Maintenance Q&A**: Ask questions about maintenance procedures
- **AI-Powered Responses**: Uses Grok Pro API for detailed step-by-step instructions
- **Tools & Supplies**: Get recommendations for required tools and materials
- **Searchable History**: Access previous questions and answers

### 📁 File Management
- **Work File Upload**: Upload maintenance documents, photos, and reports
- **Supabase Storage**: Secure file storage with automatic organization
- **Download Support**: Easy file download and sharing
- **Multiple Formats**: Support for PDF, DOC, XLS, JPG, PNG files

### 📱 PWA Features
- **Offline Support**: Works offline with data caching
- **Mobile-First Design**: Responsive design optimized for mobile devices
- **Installable**: Can be installed as a native app
- **Push Notifications**: Real-time updates (future enhancement)

## Tech Stack

- **Frontend**: React 18, Vite
- **Styling**: CSS3 with custom design system
- **Database**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage
- **APIs**: 
  - Perplexity Pro (shopping enhancements)
  - Claude 4.0 Max (email responses)
  - Grok Pro (knowledge base)
  - Resend (email sending)
- **PWA**: Vite PWA Plugin

## Setup Instructions

### 1. Clone and Install Dependencies
```bash
git clone <repository-url>
cd lifetime-maintenance
npm install
```

### 2. Environment Configuration
Copy the example environment file and configure your API keys:
```bash
cp env.example .env.local
```

Edit `.env.local` with your actual API keys:
```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# API Keys
VITE_PERPLEXITY_API_KEY=your-perplexity-pro-key
VITE_CLAUDE_API_KEY=your-claude-4-max-key
VITE_GROK_API_KEY=your-grok-pro-key
VITE_RESEND_API_KEY=your-resend-key
```

### 3. Supabase Setup

#### Database Tables
Create the following tables in your Supabase project:

**tasks table:**
```sql
CREATE TABLE tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  task_list TEXT NOT NULL,
  project_id TEXT,
  status TEXT DEFAULT 'pending',
  due_date DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**shopping_lists table:**
```sql
CREATE TABLE shopping_lists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  task_id UUID REFERENCES tasks(id),
  items_json JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**emails table:**
```sql
CREATE TABLE emails (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  to_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  sent BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**knowledge table:**
```sql
CREATE TABLE knowledge (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  question TEXT NOT NULL,
  response TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Storage Bucket
Create a storage bucket named `work-files` in Supabase:
```sql
INSERT INTO storage.buckets (id, name, public) 
VALUES ('work-files', 'work-files', false);
```

### 4. Run Development Server
```bash
npm run dev
```

The app will be available at `http://localhost:3000`

### 5. Build for Production
```bash
npm run build
```

## Testing Guide

### Manual Testing Checklist

#### Task Management
- [ ] Add a new task with description, project ID, due date, and notes
- [ ] Verify task appears in the correct project group
- [ ] Mark task as completed using checkbox
- [ ] Verify status updates in real-time
- [ ] Test offline functionality (disable network)

#### Shopping Lists
- [ ] Create shopping list with multiple items
- [ ] Verify Perplexity API integration (placeholder data)
- [ ] Check Grainger part numbers and Home Depot aisle info
- [ ] Verify alternatives are displayed
- [ ] Test store address display

#### Email Management
- [ ] Send email with recipient, subject, and body
- [ ] Verify email appears in history
- [ ] Test "Respond to Email" functionality
- [ ] Verify Claude API integration (placeholder response)
- [ ] Check email timestamps

#### Knowledge Base
- [ ] Search for maintenance question (e.g., "How to change a light bulb")
- [ ] Verify Grok API integration (placeholder response)
- [ ] Check step-by-step instructions
- [ ] Verify tools and supplies recommendations
- [ ] Test knowledge history

#### File Management
- [ ] Upload various file types (PDF, DOC, XLS, JPG, PNG)
- [ ] Verify files appear in the list
- [ ] Test file download functionality
- [ ] Check file size display
- [ ] Verify Supabase Storage integration

#### PWA Features
- [ ] Test responsive design on mobile devices
- [ ] Verify offline functionality
- [ ] Test app installation (if supported)
- [ ] Check navigation between tabs
- [ ] Verify loading states and error handling

### API Testing

#### Perplexity Pro API
```javascript
// Test shopping item enhancement
const items = "Light bulbs\nConcrete mix\nElectrical tape";
const enhanced = await enhanceShoppingItems(items);
console.log(enhanced);
```

#### Claude 4.0 Max API
```javascript
// Test email response generation
const context = { subject: "Maintenance Request" };
const response = await generateEmailResponse(context);
console.log(response);
```

#### Grok Pro API
```javascript
// Test knowledge search
const question = "How to change a light bulb";
const response = await generateKnowledgeResponse(question);
console.log(response);
```

### Database Testing
```sql
-- Test task creation
INSERT INTO tasks (user_id, task_list, project_id, status) 
VALUES ('test-user', 'Test task', 'concrete', 'pending');

-- Test shopping list creation
INSERT INTO shopping_lists (user_id, items_json) 
VALUES ('test-user', '[{"name": "Test Item", "grainger_part": "GR-TEST123"}]');

-- Test email creation
INSERT INTO emails (user_id, to_email, subject, body) 
VALUES ('test-user', 'test@example.com', 'Test Subject', 'Test Body');

-- Test knowledge creation
INSERT INTO knowledge (user_id, question, response) 
VALUES ('test-user', 'Test Question', 'Test Response');
```

## Deployment

### Vercel Deployment
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Netlify Deployment
1. Connect your GitHub repository to Netlify
2. Set environment variables in Netlify dashboard
3. Configure build command: `npm run build`
4. Set publish directory: `dist`

## Troubleshooting

### Common Issues

1. **Supabase Connection Error**
   - Verify environment variables are set correctly
   - Check Supabase project URL and anon key
   - Ensure database tables exist

2. **API Key Errors**
   - Verify all API keys are valid and active
   - Check API rate limits
   - Ensure proper API permissions

3. **File Upload Issues**
   - Verify Supabase Storage bucket exists
   - Check file size limits
   - Ensure proper storage permissions

4. **PWA Not Working**
   - Verify HTTPS is enabled (required for PWA)
   - Check service worker registration
   - Clear browser cache and reload

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For support and questions, please contact the development team or create an issue in the repository. 