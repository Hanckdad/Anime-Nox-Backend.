const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://zqlsbizhwaoepyayzjfp.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpxbHNiaXpod2FvZXB5YXl6amZwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzcxMjE4NywiZXhwIjoyMDc5Mjg4MTg3fQ.jBjomFYoJpuiYSPrT36DQbzSLYDwJjj0npxtwsl3rVs';

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  global: {
    headers: {
      'X-Client-Info': 'animenox-backend'
    }
  }
});

// Test connection
const testConnection = async () => {
  try {
    const { data, error } = await supabase.from('profiles').select('*').limit(1);
    
    if (error) {
      console.warn('Supabase connection test failed (tables might not exist):', error.message);
    } else {
      console.log('✅ Supabase connection successful');
    }
  } catch (error) {
    console.error('❌ Supabase connection failed:', error.message);
  }
};

// Run connection test
testConnection();

module.exports = { supabase };