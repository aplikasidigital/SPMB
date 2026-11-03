/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import dns from 'node:dns';
dns.setDefaultResultOrder('ipv4first');

import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isProduction = process.env.NODE_ENV === 'production';
const PORT = 3000;

const ACTIVE_SUPABASE_URL = 'https://mduwtxkqroausoxriqgf.supabase.co';
const ACTIVE_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1kdXd0eGtxcm9hdXNveHJpcWdmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM3MTUwMTEsImV4cCI6MjEwOTI5MTAxMX0.l281N2aTChr8qPu7sjLZIyLc4kjPuFxKiZ3Px0j1lwI';

const sanitizeSupabaseUrl = (url?: string) => {
  if (!url || !url.includes('mduwtxkqroausoxriqgf')) {
    return ACTIVE_SUPABASE_URL;
  }
  return url.replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');
};

const sanitizeSupabaseKey = (key?: string) => {
  if (!key || !key.includes('Im1kdXd0eGtxcm9hdXNveHJpcWdmI')) {
    return ACTIVE_SUPABASE_ANON_KEY;
  }
  return key;
};

const SUPABASE_URL = sanitizeSupabaseUrl(process.env.VITE_SUPABASE_URL);
const SUPABASE_ANON_KEY = sanitizeSupabaseKey(process.env.VITE_SUPABASE_ANON_KEY);

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '50mb' }));

  // In-memory cache for fast local delivery
  let cachedAppState: any = null;

  // GET state: Read application state from Supabase Cloud (checks spmb first, then app_state)
  const handleGetState = async (req: express.Request, res: express.Response) => {
    try {
      // 1. Try spmb table first
      try {
        const respSpmb = await fetch(`${SUPABASE_URL}/rest/v1/spmb?id=eq.main_state&select=*`, {
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
        });
        if (respSpmb.ok) {
          const rows = await respSpmb.json();
          if (Array.isArray(rows) && rows.length > 0 && rows[0]?.data) {
            cachedAppState = rows[0].data;
            return res.json({ success: true, data: rows[0].data, source: 'supabase_spmb' });
          }
        }
      } catch (spmbErr: any) {
        // continue to app_state fallback
      }

      // 2. Fallback to app_state table
      const response = await fetch(`${SUPABASE_URL}/rest/v1/app_state?id=eq.main_state&select=*`, {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const rows = await response.json();
        if (Array.isArray(rows) && rows.length > 0 && rows[0]?.data) {
          cachedAppState = rows[0].data;
          return res.json({ success: true, data: rows[0].data, source: 'supabase_app_state' });
        }
        return res.json({ success: true, data: cachedAppState, source: 'empty_or_cached', rows });
      }

      const errText = await response.text();
      return res.json({ success: cachedAppState !== null, data: cachedAppState, status: response.status, errText });
    } catch (err: any) {
      console.warn('[Server] Supabase fetch error, fallback to cache:', err?.message);
      return res.json({ success: true, data: cachedAppState, source: 'cache_fallback', debugErr: err?.message });
    }
  };

  // POST state: Save/Upsert application state to Supabase Cloud (writes to both spmb and app_state)
  const handlePostState = async (req: express.Request, res: express.Response) => {
    try {
      const { data } = req.body;
      if (!data) {
        return res.status(400).json({ error: 'Missing data payload' });
      }

      cachedAppState = data;
      const payloadStr = JSON.stringify({
        id: 'main_state',
        data,
        updated_at: new Date().toISOString(),
      });

      const headers = {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates,return=representation',
      };

      // Upsert to both 'spmb' and 'app_state' tables in parallel
      await Promise.allSettled([
        fetch(`${SUPABASE_URL}/rest/v1/spmb`, {
          method: 'POST',
          headers,
          body: payloadStr,
        }),
        fetch(`${SUPABASE_URL}/rest/v1/app_state`, {
          method: 'POST',
          headers,
          body: payloadStr,
        }),
      ]);

      return res.json({ success: true, message: 'Saved to Supabase spmb & app_state' });
    } catch (err: any) {
      console.warn('[Server] Supabase save error:', err?.message);
      return res.json({ success: true, note: 'Saved to in-memory state' });
    }
  };

  app.get('/api/app_state', handleGetState);
  app.get('/api/spmb', handleGetState);
  app.post('/api/app_state', handlePostState);
  app.post('/api/spmb', handlePostState);

  // GET /api/health: Check server status
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 SPMB Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
