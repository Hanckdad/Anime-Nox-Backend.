const express = require('express');
const { supabase } = require('../config/supabase');
const { authenticateUser } = require('../middleware/auth');

const router = express.Router();

// Get user profile
router.get('/profile', authenticateUser, async (req, res) => {
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

// Update user profile
router.put('/profile', authenticateUser, async (req, res) => {
  try {
    const { username, avatar_url, preferences } = req.body;
    
    const { data, error } = await supabase
      .from('profiles')
      .update({
        username,
        avatar_url,
        preferences,
        updated_at: new Date().toISOString()
      })
      .eq('id', req.user.id)
      .select()
      .single();

    if (error) throw error;

    res.json({ message: 'Profile updated successfully', profile: data });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Watch history routes
router.post('/watch-history', authenticateUser, async (req, res) => {
  try {
    const { anime_slug, episode_slug, current_time, duration, anime_title, episode_title, thumbnail } = req.body;
    
    const { data, error } = await supabase
      .from('watch_history')
      .upsert({
        user_id: req.user.id,
        anime_slug,
        episode_slug,
        current_time: Math.floor(current_time),
        duration: Math.floor(duration),
        anime_title,
        episode_title,
        thumbnail,
        watched_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id, anime_slug, episode_slug' });

    if (error) throw error;

    res.json({ message: 'Watch history updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update watch history' });
  }
});

router.get('/watch-history', authenticateUser, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const { data, error, count } = await supabase
      .from('watch_history')
      .select('*', { count: 'exact' })
      .eq('user_id', req.user.id)
      .order('watched_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    res.json({
      data,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch watch history' });
  }
});

router.delete('/watch-history/:id', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    
    const { error } = await supabase
      .from('watch_history')
      .delete()
      .eq('id', id)
      .eq('user_id', req.user.id);

    if (error) throw error;

    res.json({ message: 'Watch history deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete watch history' });
  }
});

router.delete('/watch-history', authenticateUser, async (req, res) => {
  try {
    const { error } = await supabase
      .from('watch_history')
      .delete()
      .eq('user_id', req.user.id);

    if (error) throw error;

    res.json({ message: 'All watch history cleared successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to clear watch history' });
  }
});

// Get continue watching
router.get('/continue-watching', authenticateUser, async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const { data, error } = await supabase
      .from('watch_history')
      .select('*')
      .eq('user_id', req.user.id)
      .lt('current_time', supabase.rpc('duration - 60')) // Not finished (1 minute left)
      .order('watched_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch continue watching' });
  }
});

module.exports = router;