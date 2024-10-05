import { Express } from 'express';
import UserRouter from './UserRouter';
import HistoryRouter from './HistoryRouter';
import TestRouter from './TestRouter';

const routes = (app: Express) => {
  app.use('/api/user', UserRouter);
  app.use('/api/history', HistoryRouter);
  app.use('/api/test', TestRouter);
};

export default routes;