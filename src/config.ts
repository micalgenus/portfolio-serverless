import dotenv from 'dotenv';

import path from 'path';
import fs from 'fs';

import redis from 'ioredis';
import Redis from 'ioredis-mock';

import '@/models';

// DotENV
dotenv.config();

export const CACHE_EXPIRE = 3600;

export const cache =
  process.env.NODE_ENV !== 'test'
    ? new redis({ host: process.env.REDIS_HOST, port: parseInt(process.env.REDIS_PORT, 10), password: process.env.REDIS_PASSWORD })
    : new Redis({});

// Load RSA key pair
export const RSA = {
  PRIVATE_KEY: fs.readFileSync(path.join(process.cwd(), 'private.pem'), 'utf8') || null,
  PUBLIC_KEY: fs.readFileSync(path.join(process.cwd(), 'public.pem'), 'utf8') || null,
};
