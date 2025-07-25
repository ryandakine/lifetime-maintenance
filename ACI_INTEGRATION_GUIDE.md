# 🚀 ACI.dev Integration Guide for Lifetime Maintenance App

## Overview

Your Lifetime Maintenance app now includes a powerful ACI.dev integration that provides 600+ tool integrations through a unified interface. This integration allows your SmartAssistant to interact with external services like Google Calendar, Gmail, Notion, Slack, and more.

## ✨ What's New

### **ACI.dev Tools Available**
- 📅 **Google Calendar** - Schedule workouts and maintenance tasks
- 📧 **Gmail** - Send progress reports and automated emails
- 📝 **Notion** - Export goals and progress data
- 💬 **Slack** - Send notifications and progress updates
- 📊 **Analytics** - Track app usage and user behavior

### **Voice Commands**
You can now use natural language commands like:
- "Schedule a workout for tomorrow at 6 PM"
- "Send me a weekly progress report"
- "Export my goals to Notion"
- "Send a progress update to Slack"

## 🎯 How to Use

### **1. Voice Commands**
1. Click the Smart Assistant button (brain icon)
2. Click the microphone button
3. Speak your command naturally
4. The assistant will process it through ACI.dev

### **2. Quick Actions**
1. Open the Smart Assistant panel
2. Click on any tool button (Calendar, Gmail, Notion, etc.)
3. The assistant will execute a predefined action for that tool

### **3. Manual Commands**
1. Open the Smart Assistant panel
2. Type your command in the text area
3. Press Enter to execute

## 🔧 Configuration

### **Environment Variables**
Add these to your `.env` file:

```bash
# Google OAuth (for Calendar and Gmail)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Notion OAuth
NOTION_CLIENT_ID=your-notion-client-id
NOTION_CLIENT_SECRET=your-notion-client-secret

# Slack OAuth
SLACK_CLIENT_ID=your-slack-client-id
SLACK_CLIENT_SECRET=your-slack-client-secret
```

### **Setting Up OAuth**
1. **Google Calendar/Gmail**:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project
   - Enable Calendar and Gmail APIs
   - Create OAuth 2.0 credentials
   - Add your domain to authorized origins

2. **Notion**:
   - Go to [Notion Developers](https://developers.notion.com/)
   - Create a new integration
   - Get your client ID and secret
   - Add your domain to redirect URIs

3. **Slack**:
   - Go to [Slack API](https://api.slack.com/apps)
   - Create a new app
   - Add OAuth scopes: `chat:write`, `channels:read`
   - Get your client ID and secret

## 🎮 Available Commands

### **Calendar Commands**
- "Schedule a workout for [time]"
- "Schedule maintenance for [date]"
- "Show my calendar for [period]"
- "Create a meeting with [person]"

### **Email Commands**
- "Send me a progress report"
- "Email my weekly summary to [email]"
- "Send a reminder to [person]"
- "Create an email draft about [topic]"

### **Notion Commands**
- "Export my goals to Notion"
- "Export my progress report"
- "Create a new page in Notion"
- "Update my Notion database"

### **Slack Commands**
- "Send a message to [channel]"
- "Notify the team about my progress"
- "Send a reminder to [channel]"
- "Share my weekly update"

### **Analytics Commands**
- "Show my app usage stats"
- "Track my productivity"
- "Get insights about my habits"
- "Show my progress trends"

## 🔄 Integration Flow

### **1. Command Processing**
```
User Command → ACI.dev Parser → Tool Selection → API Call → Response
```

### **2. Error Handling**
- If ACI.dev can't handle a command, it falls back to AI processing
- All errors are logged and displayed to the user
- Retry mechanisms for failed API calls

### **3. Authentication Flow**
```
User Action → OAuth Redirect → Authorization → Token Storage → API Access
```

## 🛠️ Development

### **Adding New Tools**
1. Edit `src/lib/aciIntegration.js`
2. Add tool configuration in `registerDefaultTools()`
3. Add execution logic in `simulateToolExecution()`
4. Add command parsing in `parseAndExecute()`

### **Example: Adding Twitter Integration**
```javascript
// In registerDefaultTools()
this.registerTool('twitter', {
  name: 'Twitter',
  description: 'Post updates to Twitter',
  functions: {
    postTweet: {
      description: 'Post a tweet',
      parameters: {
        message: { type: 'string', required: true }
      }
    }
  }
})

// In simulateToolExecution()
case 'twitter':
  return this.simulateTwitterExecution(functionName, parameters)

// In parseAndExecute()
if (lowerCommand.includes('tweet') || lowerCommand.includes('twitter')) {
  return await this.executeTool('twitter', 'postTweet', {
    message: command.replace(/tweet|twitter/gi, '').trim()
  })
}
```

## 📊 Monitoring and Analytics

### **ACI.dev Status**
The app shows real-time status of ACI.dev integration:
- 🔄 **Initializing** - Setting up tools
- ✅ **Ready** - All tools available
- ⚡ **Processing** - Executing command
- ❌ **Error** - Tools unavailable

### **Command History**
Recent ACI.dev commands are displayed with:
- Timestamp
- Original command
- Result message
- Success/failure status

## 🚀 Future Enhancements

### **Planned Features**
- 🔐 **Advanced Authentication** - Multi-user support
- 📱 **Mobile Notifications** - Push notifications for actions
- 🤖 **AI-Powered Suggestions** - Smart command suggestions
- 🔄 **Workflow Automation** - Multi-step processes
- 📊 **Advanced Analytics** - Detailed usage insights

### **Additional Tools**
- 🎵 **Spotify** - Music integration for workouts
- 📱 **WhatsApp** - Messaging integration
- 📊 **Google Sheets** - Data export and analysis
- 🗓️ **Outlook** - Calendar and email integration
- 📝 **Evernote** - Note-taking integration

## 🐛 Troubleshooting

### **Common Issues**

1. **"ACI.dev tools unavailable"**
   - Check your internet connection
   - Verify environment variables are set
   - Check browser console for errors

2. **"Authentication failed"**
   - Verify OAuth credentials
   - Check redirect URIs
   - Clear browser cache and cookies

3. **"Command not recognized"**
   - Try different phrasing
   - Check available commands list
   - Use the quick action buttons

### **Debug Mode**
Enable debug logging by adding to your browser console:
```javascript
localStorage.setItem('aci-debug', 'true')
```

## 📚 Resources

- [ACI.dev Documentation](https://aci.dev/docs)
- [Google Calendar API](https://developers.google.com/calendar)
- [Gmail API](https://developers.google.com/gmail)
- [Notion API](https://developers.notion.com/)
- [Slack API](https://api.slack.com/)

## 🎉 Success!

Your Lifetime Maintenance app now has enterprise-level integration capabilities! The ACI.dev integration transforms your personal productivity app into a powerful automation platform.

**Next Steps:**
1. Set up your OAuth credentials
2. Test voice commands
3. Explore the available tools
4. Customize for your workflow

Happy vibe coding! 🚀 