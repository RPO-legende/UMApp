import postgres from 'postgres';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const sql = postgres({
  host: process.env.POSTGRES_HOST || 'localhost',
  port: Number(process.env.POSTGRES_PORT) || 5432,
  username: process.env.POSTGRES_USER || 'myuser',
  password: process.env.POSTGRES_PASSWORD || 'mypassword',
  database: process.env.POSTGRES_DB || 'mydb'
});

export default sql;