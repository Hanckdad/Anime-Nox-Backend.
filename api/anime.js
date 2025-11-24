const express = require('express');
const { getAnimeData, cache } = require('../utils/animeApi');
const { authenticateUser } = require('../middleware/auth');

const router = express.Router();

// Public anime routes
router.get('/home', async (req, res) => {
  try {
    const data = await getAnimeData('/home');
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch home data' });
  }
});

router.get('/schedule', async (req, res) => {
  try {
    const data = await getAnimeData('/schedule');
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch schedule' });
  }
});

router.get('/anime/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const data = await getAnimeData(`/anime/${slug}`);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch anime details' });
  }
});

router.get('/complete-anime/:page', async (req, res) => {
  try {
    const { page } = req.params;
    const data = await getAnimeData(`/complete-anime/${page}`);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch complete anime' });
  }
});

router.get('/ongoing-anime', async (req, res) => {
  try {
    const data = await getAnimeData('/ongoing-anime');
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch ongoing anime' });
  }
});

router.get('/genre', async (req, res) => {
  try {
    const data = await getAnimeData('/genre');
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch genres' });
  }
});

router.get('/genre/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const data = await getAnimeData(`/genre/${slug}`);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch genre anime' });
  }
});

router.get('/episode/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const data = await getAnimeData(`/episode/${slug}`);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch episode' });
  }
});

router.get('/search/:keyword', async (req, res) => {
  try {
    const { keyword } = req.params;
    const data = await getAnimeData(`/search/${encodeURIComponent(keyword)}`);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to search anime' });
  }
});

router.get('/batch/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const data = await getAnimeData(`/batch/${slug}`);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch batch' });
  }
});

router.get('/server/:serverId', async (req, res) => {
  try {
    const { serverId } = req.params;
    const data = await getAnimeData(`/server/${serverId}`);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch server' });
  }
});

// Samehadaku routes
router.get('/samehadaku/recent', async (req, res) => {
  try {
    const data = await getAnimeData('/samehadaku/recent');
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch recent samehadaku' });
  }
});

router.get('/samehadaku/popular', async (req, res) => {
  try {
    const data = await getAnimeData('/samehadaku/popular');
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch popular samehadaku' });
  }
});

router.get('/samehadaku/movies', async (req, res) => {
  try {
    const data = await getAnimeData('/samehadaku/movies');
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch samehadaku movies' });
  }
});

router.get('/samehadaku/schedule', async (req, res) => {
  try {
    const data = await getAnimeData('/samehadaku/schedule');
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch samehadaku schedule' });
  }
});

router.get('/samehadaku/genres', async (req, res) => {
  try {
    const data = await getAnimeData('/samehadaku/genres');
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch samehadaku genres' });
  }
});

router.get('/samehadaku/anime/:animeId', async (req, res) => {
  try {
    const { animeId } = req.params;
    const data = await getAnimeData(`/samehadaku/anime/${animeId}`);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch samehadaku anime' });
  }
});

router.get('/samehadaku/episode/:episodeId', async (req, res) => {
  try {
    const { episodeId } = req.params;
    const data = await getAnimeData(`/samehadaku/episode/${episodeId}`);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch samehadaku episode' });
  }
});

// Nimegami routes
router.get('/nimegami/seasons/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const data = await getAnimeData(`/nimegami/seasons/${slug}`);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch nimegami seasons' });
  }
});

router.get('/nimegami/live-action', async (req, res) => {
  try {
    const data = await getAnimeData('/nimegami/live-action');
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch live action' });
  }
});

// Neko routes
router.get('/neko/latest', async (req, res) => {
  try {
    const data = await getAnimeData('/neko/latest');
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch neko latest' });
  }
});

router.get('/neko/release/:page', async (req, res) => {
  try {
    const { page } = req.params;
    const data = await getAnimeData(`/neko/release/${page}`);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch neko release' });
  }
});

router.get('/neko/search/:query', async (req, res) => {
  try {
    const { query } = req.params;
    const data = await getAnimeData(`/neko/search/${encodeURIComponent(query)}`);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to search neko' });
  }
});

// Get recent updates (auto update)
router.get('/recent-updates', async (req, res) => {
  try {
    const { limit = 20 } = req.query;
    
    // Try to get from multiple sources for latest updates
    const [latest, ongoing, samehadakuRecent] = await Promise.allSettled([
      getAnimeData('/neko/latest'),
      getAnimeData('/ongoing-anime'),
      getAnimeData('/samehadaku/recent')
    ]);

    let updates = [];
    
    if (latest.status === 'fulfilled') {
      updates = updates.concat(latest.value.slice(0, limit));
    }
    
    if (ongoing.status === 'fulfilled') {
      updates = updates.concat(ongoing.value.slice(0, limit));
    }
    
    if (samehadakuRecent.status === 'fulfilled') {
      updates = updates.concat(samehadakuRecent.value.slice(0, limit));
    }

    // Remove duplicates and limit results
    const uniqueUpdates = Array.from(new Set(updates.map(a => a.slug || a.title)))
      .map(slug => updates.find(a => (a.slug || a.title) === slug))
      .slice(0, limit);

    res.json(uniqueUpdates);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch recent updates' });
  }
});

// Clear cache endpoint (for development)
router.delete('/cache', (req, res) => {
  cache.flushAll();
  res.json({ message: 'Cache cleared successfully' });
});

module.exports = router;