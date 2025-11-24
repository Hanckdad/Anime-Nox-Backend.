const express = require('express');
const { supabase } = require('../config/supabase');
const { authenticateUser } = require('../middleware/auth');
const { getAnimeData } = require('../utils/animeApi');

const router = express.Router();

// Subscribe to anime
router.post('/subscribe', authenticateUser, async (req, res) => {
  try {
    const { anime_slug, anime_title, thumbnail } = req.body;
    
    const { data, error } = await supabase
      .from('subscriptions')
      .upsert({
        user_id: req.user.id,
        anime_slug,
        anime_title,
        thumbnail,
        subscribed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id, anime_slug' });

    if (error) throw error;

    res.json({ message: 'Subscribed successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to subscribe' });
  }
});

// Unsubscribe from anime
router.delete('/unsubscribe/:anime_slug', authenticateUser, async (req, res) => {
  try {
    const { anime_slug } = req.params;
    
    const { error } = await supabase
      .from('subscriptions')
      .delete()
      .eq('user_id', req.user.id)
      .eq('anime_slug', anime_slug);

    if (error) throw error;

    res.json({ message: 'Unsubscribed successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to unsubscribe' });
  }
});

// Get user subscriptions
router.get('/my-subscriptions', authenticateUser, async (req, res) => {
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

// Check if subscribed
router.get('/check/:anime_slug', authenticateUser, async (req, res) => {
  try {
    const { anime_slug } = req.params;
    
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', req.user.id)
      .eq('anime_slug', anime_slug)
      .single();

    if (error && error.code !== 'PGRST116') throw error;

    res.json({ subscribed: !!data });
  } catch (error) {
    res.status(500).json({ error: 'Failed to check subscription' });
  }
});

// Get subscription updates (new episodes for subscribed anime)
router.get('/updates', authenticateUser, async (req, res) => {
  try {
    // Get user's subscriptions
    const { data: subscriptions, error: subsError } = await supabase
      .from('subscriptions')
      .select('anime_slug, anime_title')
      .eq('user_id', req.user.id);

    if (subsError) throw subsError;

    // Get recent updates
    const recentUpdates = await getAnimeData('/neko/latest');
    
    // Filter updates based on subscriptions
    const subscriptionUpdates = recentUpdates.filter(update => 
      subscriptions.some(sub => 
        sub.anime_slug === update.slug || 
        sub.anime_title === update.title
      )
    );

    res.json({
      subscriptions: subscriptions.length,
      updates: subscriptionUpdates.slice(0, 20) // Limit to 20 updates
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch subscription updates' });
  }
});

module.exports = router;