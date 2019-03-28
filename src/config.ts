import dotenv from 'dotenv';

import path from 'path';
import fs from 'fs';

import '@/models';

// DotENV
dotenv.config();

// Load RSA key pair
export const RSA = {
  PRIVATE_KEY: fs.readFileSync(path.join(process.cwd(), 'private.pem'), 'utf8') || null,
  PUBLIC_KEY: fs.readFileSync(path.join(process.cwd(), 'public.pem'), 'utf8') || null,
};
