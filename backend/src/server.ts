import './prestart.js';
import { env } from './config/env.config.js';
import app from './app.js';
import { logger } from './config/logger.js';


const PORT = env.PORT || 5000;

app.listen(PORT, () => {
  logger.info(`🚀 Server running in ${env.NODE_ENV} mode on port ${PORT}`);
});
