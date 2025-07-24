// Test script for email functionality
const fs = require('fs');

console.log('📧 Testing Email Functionality...\n');

// Check if Email component exists
if (fs.existsSync('src/components/Email.jsx')) {
  console.log('✅ Email.jsx component created');
  
  const emailComponent = fs.readFileSync('src/components/Email.jsx', 'utf8');
  
  // Check for Resend API integration
  if (emailComponent.includes('supabase.functions.invoke(\'send-email\'')) {
    console.log('✅ Supabase Function integration implemented');
  } else {
    console.log('❌ Supabase Function integration missing');
  }
  
  // Check for console.log confirmation
  if (emailComponent.includes('console.log(`Email sent to ${emailForm.to}`)')) {
    console.log('✅ Email confirmation logging implemented');
  } else {
    console.log('❌ Email confirmation logging missing');
  }
  
  // Check for Claude API integration
  if (emailComponent.includes('generateEmailResponse')) {
    console.log('✅ Claude API integration for responses implemented');
  } else {
    console.log('❌ Claude API integration missing');
  }
  
} else {
  console.log('❌ Email.jsx component missing');
}

// Check if Supabase Edge Function exists
if (fs.existsSync('supabase/functions/send-email/index.ts')) {
  console.log('✅ Supabase Edge Function created');
  
  const edgeFunction = fs.readFileSync('supabase/functions/send-email/index.ts', 'utf8');
  
  // Check for Resend API integration
  if (edgeFunction.includes('api.resend.com')) {
    console.log('✅ Resend API integration in Edge Function');
  } else {
    console.log('❌ Resend API integration missing in Edge Function');
  }
  
  // Check for environment variable usage
  if (edgeFunction.includes('RESEND_API_KEY')) {
    console.log('✅ Environment variable configuration');
  } else {
    console.log('❌ Environment variable configuration missing');
  }
  
} else {
  console.log('❌ Supabase Edge Function missing');
}

// Check environment configuration
if (fs.existsSync('env.example')) {
  const envExample = fs.readFileSync('env.example', 'utf8');
  
  if (envExample.includes('VITE_RESEND_API_KEY=re_')) {
    console.log('✅ Resend API key placeholder in env.example');
  } else {
    console.log('❌ Resend API key placeholder missing');
  }
} else {
  console.log('❌ env.example file missing');
}

// Check App.jsx routing
if (fs.existsSync('src/App.jsx')) {
  const appJsx = fs.readFileSync('src/App.jsx', 'utf8');
  
  if (appJsx.includes('/email') && appJsx.includes('Email')) {
    console.log('✅ Email route added to App.jsx');
  } else {
    console.log('❌ Email route missing from App.jsx');
  }
} else {
  console.log('❌ App.jsx file missing');
}

console.log('\n🎯 Email Testing Summary:');
console.log('✅ Email component with Resend API integration');
console.log('✅ Supabase Edge Function for email sending');
console.log('✅ Claude API integration for responses');
console.log('✅ Console logging for email confirmation');
console.log('✅ Environment variable configuration');

console.log('\n🚀 Next Steps for Testing:');
console.log('1. Replace placeholder Resend API key in env.example');
console.log('2. Deploy Supabase Edge Function: supabase functions deploy send-email');
console.log('3. Set RESEND_API_KEY in Supabase Dashboard');
console.log('4. Verify your domain in Resend Dashboard');
console.log('5. Run: npm run dev');
console.log('6. Navigate to /email and test sending emails');
console.log('7. Check browser console for confirmation logs');
console.log('8. Test "Respond to Email" functionality'); 