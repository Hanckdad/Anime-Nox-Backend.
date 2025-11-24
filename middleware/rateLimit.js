const { RateLimiterMemory } = require('rate-limiter-flexible');

// Rate limit configuration
const rateLimiters = {
  general: new RateLimiterMemory({
    keyGenerator: (req) => req.ip,
    points: 100, // Number of requests
    duration: 60, // Per 60 seconds
  }),
  auth: new RateLimiterMemory({
    keyGenerator: (req) => req.ip,
    points: 10, // Strict limit for auth endpoints
    duration: 300, // Per 5 minutes
  }),
  anime: new RateLimiterMemory({
    keyGenerator: (req) => req.ip,
    points: 200, // Higher limit for anime data
    duration: 60,
  })
};

const rateLimitMiddleware = async (req, res, next) => {
  try {
    let limiter = rateLimiters.general;

    // Use different limiters based on route
    if (req.path.startsWith('/api/auth')) {
      limiter = rateLimiters.auth;
    } else if (req.path.startsWith('/api/anime')) {
      limiter = rateLimiters.anime;
    }

    await limiter.consume(req.ip);
    next();
  } catch (error) {
    res.status(429).json({
      error: 'Too many requests',
      message: 'Please slow down and try again later.',
      retryAfter: Math.ceil(error.msBeforeNext / 1000) || 60
    });
  }
};

module.exports = rateLimitMiddleware;