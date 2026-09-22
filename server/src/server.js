const app = require('./app');
const config = require('./config/env');
const { connectDB } = require('./config/db');

const startServer = async () => {
  try {
    await connectDB();

    const server = app.listen(config.port, () => {
      console.log(`[TCPeople] Server running on http://localhost:${config.port} in ${config.env} mode`);
    });

    const shutdown = async () => {
      console.log('\n[TCPeople] Gracefully shutting down...');
      server.close(() => {
        console.log('[TCPeople] HTTP server closed.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
  } catch (error) {
    console.error(`[TCPeople] Startup error: ${error.message}`);
    process.exit(1);
  }
};

startServer();
