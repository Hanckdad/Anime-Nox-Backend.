const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://zqlsbizhwaoepyayzjfp.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpxbHNiaXpod2FvZXB5YXl6amZwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzcxMjE4NywiZXhwIjoyMDc5Mjg4MTg3fQ.jBjomFYoJpuiYSPrT36DQbzSLYDwJjj0npxtwsl3rVs';

const supabase = createClient(supabaseUrl, supabaseKey);

// Initialize database tables
const initializeDatabase = async () => {
  try {
    // Create profiles table
    const { error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);

    if (profilesError) {
      console.log('Profiles table might need to be created');
    }

    // Create watch_history table
    const { error: historyError } = await supabase
      .from('watch_history')
      .select('*')
      .limit(1);

    if (historyError) {
      console.log('Watch history table might need to be created');
    }

    // Create subscriptions table
    const { error: subsError } = await supabase
      .from('subscriptions')
      .select('*')
      .limit(1);

    if (subsError) {
      console.log('Subscriptions table might need to be created');
    }

    // Create downloads table
    const { error: downloadsError } = await supabase
      .from('downloads')
      .select('*')
      .limit(1);

    if (downloadsError) {
      console.log('Downloads table might need to be created');
    }

    console.log('Database initialization check completed');
  } catch (error) {
    console.error('Database initialization error:', error);
  }
};

module.exports = { supabase, initializeDatabase };