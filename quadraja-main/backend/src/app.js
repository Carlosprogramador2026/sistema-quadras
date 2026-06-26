import express from 'express';
import cors from 'cors';
import routes from './routes/index.js';
import { errorHandler, notFound } from './middlewares/errorHandler.js';

export function createApp() {
  const app = express();

  app.use(
    cors({
      origin: process.env.CORS_ORIGIN?.split(',') ?? '*',
    })
  );
  app.use(express.json({ limit: '10kb' }));

  app.use('/api', routes);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
