const express = require('express');
const { supabase } = require('../config/supabase');
const { authenticateUser } = require('../middleware/auth');
const { getAnimeData } = require('../utils/animeApi');

const router = express.Router();

// Track download
router.post('/track', authenticateUser, async (req, res) => {
  try {
    const { anime_slug, episode_slug, download_url, quality, file_size, anime_title, episode_title } = req.body;
    
    const { data, error } = await supabase
      .from('downloads')
      .insert({
        user_id: req.user.id,
        anime_slug,
        episode_slug,
        download_url,
        quality,
        file_size,
        anime_title,
        episode_title,
        downloaded_at: new Date().toISOString()
      });

    if (error) throw error;

    res.json({ message: 'Download tracked successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to track download' });
  }
});

// Get download history
router.get('/history', authenticateUser, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const { data, error, count } = await supabase
      .from('downloads')
      .select('*', { count: 'exact' })
      .eq('user_id', req.user.id)
      .order('downloaded_at', { ascending: false })
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
    res.status(500).json({ error: 'Failed to fetch download history' });
  }
});

// Get download links for episode
router.get('/episode/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    
    // Get episode data first
    const episodeData = await getAnimeData(`/episode/${slug}`);
    
    if (!episodeData || !episodeData.servers) {
      return res.status(404).json({ error: 'Episode not found' });
    }

    // Extract download links from servers
    const downloadLinks = [];
    
    episodeData.servers.forEach(server => {
      if (server.download_links) {
        server.download_links.forEach(link => {
          downloadLinks.push({
            server: server.name,
            quality: link.quality,
            url: link.url,
            size: link.size
          });
        });
      }
    });

    res.json({
      episode: episodeData.episode,
      anime: episodeData.anime,
      downloads: downloadLinks
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch download links' });
  }
});

// Batch download for anime
router.get('/batch/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    
    const animeData = await getAnimeData(`/anime/${slug}`);
    
    if (!animeData || !animeData.episodes) {
      return res.status(404).json({ error: 'Anime not found' });
    }

    // Get download links for all episodes
    const batchDownloads = [];
    
    for (const episode of animeData.episodes.slice(0, 10)) { // Limit to first 10 episodes
      try {
        const episodeData = await getAnimeData(`/episode/${episode.slug}`);
        
        if (episodeData && episodeData.servers) {
          episodeData.servers.forEach(server => {
            if (server.download_links) {
              server.download_links.forEach(link => {
                batchDownloads.push({
                  episode: episode.episode,
                  title: episode.title,
                  server: server.name,
                  quality: link.quality,
                  url: link.url,
                  size: link.size
                });
              });
            }
          });
        }
      } catch (error) {
        console.error(`Failed to get downloads for episode ${episode.slug}`);
      }
    }

    res.json({
      anime: animeData.anime,
      total_episodes: animeData.episodes.length,
      downloads: batchDownloads
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch batch downloads' });
  }
});

// Delete download history
router.delete('/history/:id', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    
    const { error } = await supabase
      .from('downloads')
      .delete()
      .eq('id', id)
      .eq('user_id', req.user.id);

    if (error) throw error;

    res.json({ message: 'Download history deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete download history' });
  }
});

module.exports = router;