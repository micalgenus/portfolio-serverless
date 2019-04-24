import express, { Express } from 'express';
import cors from 'cors';

export const AllowCORSExpress = (app?: Express) => {
  const a = app || express();

  a.use(cors({ origin: true, credentials: true }));
  return a;
};
