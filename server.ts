
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * SPMB SERVER - OPTIMIZED VERSION
 * Stable connection, timeout protection, cache fallback,
 * Supabase synchronization, and graceful shutdown.
 */

import dns from 'node:dns';
dns.setDefaultResultOrder('ipv4first');

import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isProduction = process.env.NODE_ENV === 'production';
const PORT = Number(process.env.PORT) || 3000;

const ACTIVE_SUPABASE_URL =
  'https://mduwtxkqroausoxriqgf.supabase.co';

const ACTIVE_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJIUzI1NiIsInR5cCI6Im1kdXd0eGtxcm9hdXNveHJpcWdmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM3MTUwMTEsImV4cCI6MjEwOTI5MTAxMX0.l281N2aTChr8qPu7sjLZIyLc4kjPuFxKiZ3Px0j1lwI';

const sanitizeSupabaseUrl = (url?: string): string => {
  if (!url || !url.includes('mduwtxkqroausoxriqgf')) {
    return ACTIVE_SUPABASE_URL;
  }

  return url
    .replace(/\/rest\/v1\/?$/, '')
    .replace(/\/+$/, '');
};

const sanitizeSupabaseKey = (key?: string): string => {
  if (!key || !key.includes('Im1kdXd0eGtxcm9hdXNveHJpcWdmI')) {
    return ACTIVE_SUPABASE_ANON_KEY;
  }

  return key;
};

const SUPABASE_URL = sanitizeSupabaseUrl(
  process.env.VITE_SUPABASE_URL
);

const SUPABASE_ANON_KEY = sanitizeSupabaseKey(
  process.env.VITE_SUPABASE_ANON_KEY
);

const REQUEST_TIMEOUT = 12000;
const BODY_LIMIT = '50mb';

let cachedAppState: any = null;
let lastSuccessfulSave = 0;

const supabaseHeaders = {
  apikey: SUPABASE_ANON_KEY,
  Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
  'Content-Type': 'application/json',
};

const createTimeoutSignal = () => {
  return AbortSignal.timeout(REQUEST_TIMEOUT);
};

/**
 * Safe fetch with timeout protection.
 */
async function safeFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  return fetch(url, {
    ...options,
    signal: createTimeoutSignal(),
  });
}

/**
 * Read data from Supabase.
 */
async function readSupabaseTable(table: string): Promise<any | null> {
  try {
    const response = await safeFetch(
      `${SUPABASE_URL}/rest/v1/${table}?id=eq.main_state&select=*`,
      {
        method: 'GET',
        headers: supabaseHeaders,
      }
    );

    if (!response.ok) {
      const errorText = await response.text();

      console.warn(
        `[Supabase] Read ${table} failed:`,
        response.status,
        errorText.slice(0, 500)
      );

      return null;
    }

    const rows = await response.json();

    if (
      Array.isArray(rows) &&
      rows.length > 0 &&
      rows[0]?.data !== undefined &&
      rows[0]?.data !== null
    ) {
      return rows[0].data;
    }

    return null;
  } catch (error: any) {
    console.warn(
      `[Supabase] Read ${table} error:`,
      error?.message || error
    );

    return null;
  }
}

/**
 * GET application state.
 * Priority: spmb -> app_state -> memory cache.
 */
async function handleGetState(
  req: express.Request,
  res: express.Response
) {
  try {
    const spmbData = await readSupabaseTable('spmb');

    if (spmbData !== null) {
      cachedAppState = spmbData;

      return res.json({
        success: true,
        data: cachedAppState,
        source: 'supabase_spmb',
      });
    }

    const appStateData = await readSupabaseTable('app_state');

    if (appStateData !== null) {
      cachedAppState = appStateData;

      return res.json({
        success: true,
        data: cachedAppState,
        source: 'supabase_app_state',
      });
    }

    return res.json({
      success: cachedAppState !== null,
      data: cachedAppState,
      source: 'cache_fallback',
    });
  } catch (error: any) {
    console.error(
      '[Server] GET state error:',
      error?.message || error
    );

    return res.json({
      success: cachedAppState !== null,
      data: cachedAppState,
      source: 'cache_fallback',
    });
  }
}

/**
 * Save data to one Supabase table.
 */
async function saveSupabaseTable(
  table: string,
  payload: string
): Promise<boolean> {
  try {
    const response = await safeFetch(
      `${SUPABASE_URL}/rest/v1/${table}`,
      {
        method: 'POST',
        headers: {
          ...supabaseHeaders,
          Prefer: 'resolution=merge-duplicates,return=minimal',
        },
        body: payload,
      }
    );

    if (!response.ok) {
      const errorText = await response.text();

      console.error(
        `[Supabase] Save ${table} failed:`,
        response.status,
        errorText.slice(0, 500)
      );

      return false;
    }

    return true;
  } catch (error: any) {
    console.error(
      `[Supabase] Save ${table} error:`,
      error?.message || error
    );

    return false;
  }
}

/**
 * POST application state.
 */
async function handlePostState(
  req: express.Request,
  res: express.Response
) {
  try {
    if (
      !req.body ||
      typeof req.body !== 'object' ||
      !Object.prototype.hasOwnProperty.call(req.body, 'data') ||
      req.body.data === null ||
      req.body.data === undefined
    ) {
      return res.status(400).json({
        success: false,
        error: 'Missing data payload',
      });
    }

    const data = req.body.data;

    // Update local cache immediately.
    cachedAppState = data;

    const payload = JSON.stringify({
      id: 'main_state',
      data,
      updated_at: new Date().toISOString(),
    });

    // Save to both tables concurrently.
    const results = await Promise.all([
      saveSupabaseTable('spmb', payload),
      saveSupabaseTable('app_state', payload),
    ]);

    const spmbSaved = results[0];
    const appStateSaved = results[1];

    if (spmbSaved || appStateSaved) {
      lastSuccessfulSave = Date.now();
    }

    return res.status(200).json({
      success: true,
      message: 'Application state processed',
      saved: {
        spmb: spmbSaved,
        app_state: appStateSaved,
      },
      source:
        spmbSaved && appStateSaved
          ? 'supabase_both'
          : spmbSaved
            ? 'supabase_spmb'
            : appStateSaved
              ? 'supabase_app_state'
              : 'memory_cache',
    });
  } catch (error: any) {
    console.error(
      '[Server] POST state error:',
      error?.message || error
    );

    return res.status(200).json({
      success: true,
      source: 'memory_cache',
      message: 'Data retained in server memory',
    });
  }
}

/**
 * Start server.
 */
async function startServer() {
  const app = express();

  app.disable('x-powered-by');

  app.use(
    express.json({
      limit: BODY_LIMIT,
    })
  );

  app.use(
    express.urlencoded({
      extended: true,
      limit: BODY_LIMIT,
    })
  );

  // Avoid requests remaining open indefinitely.
  app.use((req, res, next) => {
    res.setTimeout(30000);

    next();
  });

  // API routes.
  app.get('/api/health', (req, res) => {
    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: isProduction ? 'production' : 'development',
      cacheAvailable: cachedAppState !== null,
      lastSuccessfulSave:
        lastSuccessfulSave > 0
          ? new Date(lastSuccessfulSave).toISOString()
          : null,
    });
  });

  app.get('/api/app_state', handleGetState);
  app.get('/api/spmb', handleGetState);

  app.post('/api/app_state', handlePostState);
  app.post('/api/spmb', handlePostState);

  // Handle invalid JSON.
  app.use(
    (
      error: any,
      req: express.Request,
      res: express.Response,
      next: express.NextFunction
    ) => {
      if (res.headersSent) {
        return next(error);
      }

      if (error?.type === 'entity.too.large') {
        return res.status(413).json({
          success: false,
          error: 'Request body is too large',
        });
      }

      if (error instanceof SyntaxError && 'body' in error) {
        return res.status(400).json({
          success: false,
          error: 'Invalid JSON payload',
        });
      }

      console.error('[Server] Middleware error:', error);

      return res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  );

  // Development server.
  if (!isProduction) {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
      },
      appType: 'spa',
    });

    app.use(vite.middlewares);

    console.log('[Server] Vite development mode enabled');
  } else {
    // Production server.
    const distPath = path.join(__dirname, 'dist');

    app.use(
      express.static(distPath, {
        index: false,
        maxAge: '1d',
      })
    );

    app.get('*', (req, res, next) => {
      res.sendFile(
        path.join(distPath, 'index.html'),
        (error) => {
          if (error) {
            next(error);
          }
        }
      );
    });

    console.log('[Server] Production mode enabled');
  }

  // Start listening.
  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log('--------------------------------------');
    console.log('SPMB SERVER STARTED');
    console.log(`Port        : ${PORT}`);
    console.log(`Environment : ${isProduction ? 'Production' : 'Development'}`);
    console.log(`Supabase    : ${SUPABASE_URL}`);
    console.log(`Health      : http://localhost:${PORT}/api/health`);
    console.log('--------------------------------------');
  });

  server.keepAliveTimeout = 65000;
  server.headersTimeout = 66000;
  server.requestTimeout = 30000;

  // Handle server errors.
  server.on('error', (error: any) => {
    console.error('[Server] HTTP server error:', error);
  });

  // Graceful shutdown.
  const shutdown = (signal: string) => {
    console.log(`[Server] ${signal} received. Shutting down...`);

    server.close((error) => {
      if (error) {
        console.error('[Server] Shutdown error:', error);
        process.exitCode = 1;
      }

      console.log('[Server] Server stopped');
    });

    setTimeout(() => {
      console.error('[Server] Forced shutdown');

      process.exit(1);
    }, 10000).unref();
  };

  process.once('SIGTERM', () => shutdown('SIGTERM'));
  process.once('SIGINT', () => shutdown('SIGINT'));
}

// Global error handling.
process.on('unhandledRejection', (reason) => {
  console.error('[Server] Unhandled rejection:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('[Server] Uncaught exception:', error);
});

// Run server.
startServer().catch((error) => {
  console.error('[Server] Failed to start:', error);
  process.exitCode = 1;
});
