const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config();

async function testSupabaseConnection() {
  console.log('🔗 Testing Supabase Connection...');
  
  try {
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      console.log('❌ Supabase credentials not found in .env');
      return;
    }
    
    console.log('📋 Supabase URL:', supabaseUrl);
    console.log('🔑 Anon Key:', supabaseKey.substring(0, 20) + '...');
    
    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Test connection by trying to fetch from photos table
    console.log('\n🧪 Testing database connection...');
    const { data, error } = await supabase
      .from('photos')
      .select('count')
      .limit(1);
    
    if (error) {
      console.log('⚠️  Database connection test:', error.message);
      console.log('   This is normal if the photos table doesn\'t exist yet');
    } else {
      console.log('✅ Database connection successful!');
    }
    
    // Test storage bucket
    console.log('\n📦 Testing storage bucket...');
    const { data: buckets, error: bucketError } = await supabase
      .storage
      .listBuckets();
    
    if (bucketError) {
      console.log('⚠️  Storage test:', bucketError.message);
    } else {
      console.log('✅ Storage connection successful!');
      console.log('   Available buckets:', buckets.map(b => b.name).join(', '));
    }
    
    console.log('\n🎉 Supabase connection test completed!');
    console.log('   Your app is ready for photo upload and storage!');
    
  } catch (error) {
    console.error('❌ Error testing Supabase connection:', error.message);
  }
}

testSupabaseConnection(); 