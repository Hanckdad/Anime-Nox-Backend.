const { supabase } = require('../config/supabase');

const initDatabase = async () => {
  console.log('🚀 Initializing AnimeNox Database Schema...');

  try {
    // This script is for reference - actual tables should be created via Supabase SQL editor
    console.log('📝 Please run the following SQL in your Supabase SQL editor:');
    
    const sqlSchema = `
-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  username TEXT,
  avatar_url TEXT,
  preferences JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Watch history table
CREATE TABLE IF NOT EXISTS watch_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  anime_slug TEXT NOT NULL,
  episode_slug TEXT NOT NULL,
  anime_title TEXT,
  episode_title TEXT,
  thumbnail TEXT,
  current_time INTEGER DEFAULT 0,
  duration INTEGER DEFAULT 0,
  watched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, anime_slug, episode_slug)
);

-- Subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  anime_slug TEXT NOT NULL,
  anime_title TEXT,
  thumbnail TEXT,
  subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, anime_slug)
);

-- Downloads table
CREATE TABLE IF NOT EXISTS downloads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  anime_slug TEXT NOT NULL,
  episode_slug TEXT NOT NULL,
  anime_title TEXT,
  episode_title TEXT,
  download_url TEXT NOT NULL,
  quality TEXT,
  file_size TEXT,
  downloaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE watch_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE downloads ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can manage own watch history" ON watch_history FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own subscriptions" ON subscriptions FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own downloads" ON downloads FOR ALL USING (auth.uid() = user_id);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_watch_history_user_id ON watch_history(user_id);
CREATE INDEX IF NOT EXISTS idx_watch_history_anime_slug ON watch_history(anime_slug);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_downloads_user_id ON downloads(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
    `;

    console.log(sqlSchema);
    console.log('\n💡 Copy and paste the above SQL into your Supabase SQL editor to create the necessary tables.');

  } catch (error) {
    console.error('❌ Database initialization failed:', error);
  }
};

// Run initialization if called directly
if (require.main === module) {
  initDatabase();
}

module.exports = { initDatabase };