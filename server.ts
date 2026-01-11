// server.ts - Next.js Standalone + Socket.IO
import { setupSocket } from '@/lib/socket';
import { createServer } from 'http';
import { Server } from 'socket.io';
import next from 'next';

const dev = process.env.NODE_ENV !== 'production';
const currentPort = parseInt(process.env.PORT || '3000', 10);
const hostname = '0.0.0.0';

// Custom server with Socket.IO integration
async function createCustomServer() {
  try {
    // Create Next.js app - disable Turbopack for stable development
    const nextApp = next({
      dev,
      turbo: false, // Use Webpack instead of Turbopack
      dir: process.cwd(),
      // In production, use the current directory where .next is located
      conf: dev ? undefined : { distDir: './.next' }
    });

    await nextApp.prepare();
    const handle = nextApp.getRequestHandler();

    // Simple Token Bucket Rate Limiter
    const rateLimitMap = new Map<string, { tokens: number; lastFill: number }>();
    const LIMIT = 100; // Max requests
    const WINDOW = 10000; // 10 seconds
    const FILL_RATE = LIMIT / WINDOW;

    // Create HTTP server that will handle both Next.js and Socket.IO
    const server = createServer((req, res) => {
      // Skip socket.io requests from Next.js handler
      if (req.url?.startsWith('/api/socketio')) {
        return;
      }

      // Rate Limiting Logic
      const ip = req.socket.remoteAddress || 'unknown';
      const now = Date.now();
      
      let bucket = rateLimitMap.get(ip);
      if (!bucket) {
        bucket = { tokens: LIMIT, lastFill: now };
        rateLimitMap.set(ip, bucket);
      }

      // Refill tokens
      const timePassed = now - bucket.lastFill;
      bucket.tokens = Math.min(LIMIT, bucket.tokens + timePassed * FILL_RATE);
      bucket.lastFill = now;

      // Consume token
      if (bucket.tokens < 1) {
        res.statusCode = 429;
        res.setHeader('Retry-After', Math.ceil((1 - bucket.tokens) / FILL_RATE / 1000));
        res.end('Too Many Requests');
        return;
      }
      bucket.tokens -= 1;

      // Clean up old buckets periodically (optimization)
      if (rateLimitMap.size > 10000 && Math.random() < 0.01) {
        for (const [key, b] of rateLimitMap) {
          if (now - b.lastFill > WINDOW) {
            rateLimitMap.delete(key);
          }
        }
      }

      handle(req, res);
    });

    // Setup Socket.IO
    const io = new Server(server, {
      path: '/api/socketio',
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      }
    });

    setupSocket(io);

    // Start the server
    server.listen(currentPort, hostname, () => {
      console.log(`> Ready on http://${hostname}:${currentPort}`);
      console.log(`> Socket.IO server running at ws://${hostname}:${currentPort}/api/socketio`);
    });

  } catch (err) {
    console.error('Server startup error:', err);
    process.exit(1);
  }
}

// Start the server
createCustomServer();
