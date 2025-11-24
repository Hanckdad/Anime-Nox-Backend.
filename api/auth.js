const express = require('express');
const { supabase } = require('../config/supabase');
const { authenticateUser } = require('../middleware/auth');

const router = express.Router();

// Google auth callback
router.post('/google', async (req, res) => {
  try {
    const { access_token } = req.body;
    
    if (!access_token) {
      return res.status(400).json({ error: 'Access token required' });
    }

    const { data: { user }, error } = await supabase.auth.getUser(access_token);
    
    if (error) {
      return res.status(401).json({ error: 'Invalid Google token' });
    }

    // Create or update user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        email: user.email,
        username: user.user_metadata.full_name || user.email.split('@')[0],
        avatar_url: user.user_metadata.avatar_url,
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' });

    if (profileError) {
      console.error('Profile error:', profileError);
    }

    res.json({ 
      user: {
        id: user.id,
        email: user.email,
        username: user.user_metadata.full_name || user.email.split('@')[0],
        avatar_url: user.user_metadata.avatar_url
      },
      access_token 
    });
  } catch (error) {
    console.error('Auth error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
});

// Get user session
router.get('/session', authenticateUser, async (req, res) => {
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', req.user.id)
      .single();

    if (error) throw error;

    res.json({ 
      user: {
        ...req.user,
        profile: profile
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get session' });
  }
});

// Logout
router.post('/logout', authenticateUser, async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1] || req.cookies.token;
    
    const { error } = await supabase.auth.admin.signOut(token);
    
    if (error) throw error;

    res.clearCookie('token');
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Logout failed' });
  }
});

// Update profile
router.put('/profile', authenticateUser, async (req, res) => {
  try {
    const { username, avatar_url } = req.body;
    
    const { data, error } = await supabase
      .from('profiles')
      .update({
        username,
        avatar_url,
        updated_at: new Date().toISOString()
      })
      .eq('id', req.user.id);

    if (error) throw error;

    res.json({ message: 'Profile updated successfully', profile: data });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

module.exports = router;