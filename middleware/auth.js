const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://zqlsbizhwaoepyayzjfp.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpxbHNiaXpod2FvZXB5YXl6amZwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzcxMjE4NywiZXhwIjoyMDc5Mjg4MTg3fQ.jBjomFYoJpuiYSPrT36DQbzSLYDwJjj0npxtwsl3rVs';
const supabase = createClient(supabaseUrl, supabaseKey);

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

module.exports = { authenticateUser };