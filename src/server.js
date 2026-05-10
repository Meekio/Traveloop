import app from './app.js';
import { config, validateEnv } from './config/env.js';

// Validate environment variables before starting
validateEnv();

const PORT = config.port;

app.listen(PORT, () => {
  console.log(`🚀 Traveloop Backend running on port ${PORT}`);
  console.log(`📍 Environment: ${config.nodeEnv}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
});
