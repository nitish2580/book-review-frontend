// config/env.js
const path = require('path');
const dotenv = require('dotenv');

const env = process.env.NODE_ENV || 'development';

const envPath = path.resolve(__dirname, `../.env.${env}`);

// Load the environment-specific file only
const result = dotenv.config({ path: envPath });

if (result.error) {
  console.warn(`❗ Could not find .env.${env}, falling back to .env`);
  dotenv.config({ path: path.resolve(__dirname, '../.env') });
}
