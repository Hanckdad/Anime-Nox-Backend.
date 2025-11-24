const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const { createClient } = require('@supabase/supabase-js');
const axios = require('axios');

const app = express();

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(cors({
  origin: ['http://localhost:3000', 'https://animenox.vercel.app'],
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Supabase Configuration
const supabaseUrl = 'https://zqlsbizhwaoepyayzjfp.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpxbHNiaXpod2FvZXB5YXl6amZwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzcxMjE4NywiZXhwIjoyMDc5Mjg4MTg3fQ.jBjomFYoJpuiYSPrT36DQbzSLYDwJjj0npxtwsl3rVs';
const supabase = createClient(supabaseUrl, supabaseKey);

// Base API URL
const ANIME_API_BASE = 'https://www.sankavollerei.com/anime';

// Auth Middleware
const authenticateUser = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1] || req.cookies.token;
    
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Authentication failed' });
  }
};

// Routes
app.get('/', (req, res) => {
  res.json({ 
    message: 'AnimeNox Backend API', 
    developer: 'Bayu Official',
    github: 'hanckdad'
  });
});

// Auth Routes
app.post('/api/auth/session', async (req, res) => {
  try {
    const { access_token } = req.body;
    
    const { data: { user }, error } = await supabase.auth.getUser(access_token);
    
    if (error) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Anime Routes
app.get('/api/anime/home', async (req, res) => {
  try {
    const response = await axios.get(`${ANIME_API_BASE}/home`);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch home data' });
  }
});

app.get('/api/anime/schedule', async (req, res) => {
  try {
    const response = await axios.get(`${ANIME_API_BASE}/schedule`);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch schedule' });
  }
});

app.get('/api/anime/anime/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const response = await axios.get(`${ANIME_API_BASE}/anime/${slug}`);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch anime details' });
  }
});

app.get('/api/anime/complete-anime/:page', async (req, res) => {
  try {
    const { page } = req.params;
    const response = await axios.get(`${ANIME_API_BASE}/complete-anime/${page}`);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch complete anime' });
  }
});

app.get('/api/anime/ongoing-anime', async (req, res) => {
  try {
    const response = await axios.get(`${ANIME_API_BASE}/ongoing-anime`);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch ongoing anime' });
  }
});

app.get('/api/anime/genre', async (req, res) => {
  try {
    const response = await axios.get(`${ANIME_API_BASE}/genre`);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch genres' });
  }
});

app.get('/api/anime/genre/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const response = await axios.get(`${ANIME_API_BASE}/genre/${slug}`);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch genre anime' });
  }
});

app.get('/api/anime/episode/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const response = await axios.get(`${ANIME_API_BASE}/episode/${slug}`);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch episode' });
  }
});

app.get('/api/anime/search/:keyword', async (req, res) => {
  try {
    const { keyword } = req.params;
    const response = await axios.get(`${ANIME_API_BASE}/search/${keyword}`);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to search anime' });
  }
});

app.get('/api/anime/batch/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const response = await axios.get(`${ANIME_API_BASE}/batch/${slug}`);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch batch' });
  }
});

app.get('/api/anime/server/:serverId', async (req, res) => {
  try {
    const { serverId } = req.params;
    const response = await axios.get(`${ANIME_API_BASE}/server/${serverId}`);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch server' });
  }
});

// User-specific Routes (Require Authentication)
app.get('/api/user/profile', authenticateUser, async (req, res) => {
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', req.user.id)
      .single();

    if (error) throw error;

    res.json(profile);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

app.post('/api/user/watch-history', authenticateUser, async (req, res) => {
  try {
    const { anime_slug, episode_slug, current_time, duration } = req.body;
    
    const { data, error } = await supabase
      .from('watch_history')
      .upsert({
        user_id: req.user.id,
        anime_slug,
        episode_slug,
        current_time,
        duration,
        watched_at: new Date().toISOString()
      });

    if (error) throw error;

    res.json({ message: 'Watch history updated' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update watch history' });
  }
});

app.get('/api/user/watch-history', authenticateUser, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('watch_history')
      .select('*')
      .eq('user_id', req.user.id)
      .order('watched_at', { ascending: false });

    if (error) throw error;

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch watch history' });
  }
});

app.post('/api/user/subscriptions', authenticateUser, async (req, res) => {
  try {
    const { anime_slug } = req.body;
    
    const { data, error } = await supabase
      .from('subscriptions')
      .upsert({
        user_id: req.user.id,
        anime_slug,
        subscribed_at: new Date().toISOString()
      });

    if (error) throw error;

    res.json({ message: 'Subscription updated' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update subscription' });
  }
});

app.get('/api/user/subscriptions', authenticateUser, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', req.user.id)
      .order('subscribed_at', { ascending: false });

    if (error) throw error;

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch subscriptions' });
  }
});

app.delete('/api/user/subscriptions/:anime_slug', authenticateUser, async (req, res) => {
  try {
    const { anime_slug } = req.params;
    
    const { error } = await supabase
      .from('subscriptions')
      .delete()
      .eq('user_id', req.user.id)
      .eq('anime_slug', anime_slug);

    if (error) throw error;

    res.json({ message: 'Subscription removed' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to remove subscription' });
  }
});

// Download tracking
app.post('/api/user/downloads', authenticateUser, async (req, res) => {
  try {
    const { anime_slug, episode_slug, download_url } = req.body;
    
    const { data, error } = await supabase
      .from('downloads')
      .insert({
        user_id: req.user.id,
        anime_slug,
        episode_slug,
        download_url,
        downloaded_at: new Date().toISOString()
      });

    if (error) throw error;

    res.json({ message: 'Download recorded' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to record download' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`AnimeNox Backend running on port ${PORT}`);
});

module.exports = app;