import 'reflect-metadata';
import express from "express";
import loaders from "./loaders";
import config from "./config";

async function startServer() {
  try {
    const app = express();
    await loaders({ expressApp: app });
    
    app.listen(config.port, () => {
      console.log(`🚀 Server is running on port ${config.port}`);
      console.log(`📊 Environment: ${config.nodeEnv}`);
      console.log(`🔗 Health check: http://localhost:${config.port}/status`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
