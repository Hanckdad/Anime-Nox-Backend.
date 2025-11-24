const { supabase } = require('../config/supabase');

const initializeDatabase = async () => {
  try {
    console.log('🔄 Initializing AnimeNox Database...');

    // Check and create tables if they don't exist
    const tables = ['profiles', 'watch_history', 'subscriptions', 'downloads'];
    
    for (const table of tables) {
      const { error } = await supabase
        .from(table)
        .select('*')
        .limit(1);

      if (error) {
        console.log(`Table ${table} might not exist. Please run the SQL schema.`);
      } else {
        console.log(`✅ Table ${table} is ready`);
      }
    }

    console.log('🎌 AnimeNox Database initialized successfully');
  } catch (error) {
    console.error('❌ Database initialization error:', error.message);
  }
};

// Helper functions for common operations
const dbHelpers = {
  // Upsert with conflict handling
  upsert: async (table, data, conflictColumns) => {
    const { data: result, error } = await supabase
      .from(table)
      .upsert(data, { onConflict: conflictColumns })
      .select();

    if (error) throw error;
    return result;
  },

  // Safe insert that ignores conflicts
  safeInsert: async (table, data) => {
    const { data: result, error } = await supabase
      .from(table)
      .insert(data)
      .select();

    if (error && !error.code.includes('23505')) { // Ignore unique violation
      throw error;
    }
    return result;
  },

  // Paginated select
  paginatedSelect: async (table, conditions = {}, page = 1, limit = 20, orderBy = 'created_at', orderAsc = false) => {
    const offset = (page - 1) * limit;
    
    let query = supabase
      .from(table)
      .select('*', { count: 'exact' });

    // Apply conditions
    Object.entries(conditions).forEach(([key, value]) => {
      query = query.eq(key, value);
    });

    // Apply ordering and pagination
    const { data, error, count } = await query
      .order(orderBy, { ascending: orderAsc })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return {
      data,
      pagination: {
        page,
        limit,
        total: count,
        pages: Math.ceil(count / limit)
      }
    };
  }
};

module.exports = { initializeDatabase, dbHelpers, supabase };